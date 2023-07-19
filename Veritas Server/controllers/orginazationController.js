import { catchAsyncError } from "../utils/catchAsyncError.js";
import AppError from "../utils/AppError.js";
import Orginazation from "../models/Orginazation.js";
import Employee from "../models/Employee.js";
import sendEmail from "../utils/Email.js";
import { authRole } from "../utils/authRole.js";
import Transaction from "../models/Transaction.js";
import { config } from "../config/index.js";
import Attendance from "../models/Attendance.js";

export const createOrginazation = catchAsyncError(async (req, res, next) => {
    const { orginazationName, password, email } = req.body;

    if (!orginazationName || !password || !email) {
        return next(new AppError("All fields are required!", 400));
    }

    let orginazation = await Orginazation.findOne({ orginazationName });

    if (orginazation) {
        return next(new AppError("Orginazation already exist's", 409));
    }

    orginazation = await Orginazation.create({
        name: orginazationName,
        mailingAddress: email,
        password,
        role: authRole.ORGINAZATION,
    });

    const token = orginazation.generateJwtToken();

    return res
        .status(201)
        .json({ success: true, data: { ...orginazation._doc, token } });
});

export const orginazationSignin = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email && !password) {
        return next(new AppError("All fields are required!", 400));
    }

    const orginazation = await Orginazation.findOne({
        mailingAddress: email,
    });

    if (!orginazation) {
        return next(new AppError("Orginazation Email not registered!", 404));
    }

    const isValid = await orginazation.comparePassword(password);

    if (!isValid) {
        return next(new AppError("Invalid Password!", 400));
    }

    const token = orginazation.generateJwtToken();

    return res
        .status(200)
        .json({ success: true, data: { ...orginazation._doc, token } });
});

export const addEmployee = catchAsyncError(async (req, res, next) => {
    const {
        name,
        email,
        jobTitle,
        taxRate,
        salary,
        paymentAmount,
        paymentFrequency,
        isFullTime,
        startDate,
    } = req.body;

    if (!name || !email) {
        return next(new AppError("All fields are required!", 400));
    }

    let employee = await Employee.findOne({ empEmail: email });
    if (employee) {
        return next(new AppError("Email Already registered!", 400));
    }
    let payType;
    if (paymentFrequency === 1) {
        payType = "monthly";
    } else if (paymentFrequency === 2) {
        payType = "weekly";
    } else if (paymentFrequency === 3) {
        payType = "hourly";
    }

    const nextMonth = new Date(startDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    employee = await Employee.create({
        empName: name,
        empEmail: email,
        jobTitle,
        payType,
        taxRate,
        salary,
        paymentAmount,
        empStartDate: startDate,
        payDate: nextMonth,
        orginazation: req.auth._id,
        employmentStatus: isFullTime ? "Full-time" : "Part-time",
        role: authRole.EMPLOYEE,
    });
    let URL;
    if (config.NODE_ENV === "development") {
        URL = `${req.protocol}://${req.hostname}:3000/employee/set-password?email=${employee.empEmail}&name=${employee.empName}`;
    } else {
        URL = `http://hexo-safe-client.cloudapps.zeroek.com/employee/set-password?email=${employee.empEmail}&name=${employee.empName}`;
    }

    try {
        // send email
        await sendEmail("vadavision@vision.ca", employee.empEmail, URL);
    } catch (error) {
        return next(new AppError("Failed to send email!", 400));
    }

    employee.password = undefined;

    res.status(201).json({
        success: true,
        message: "Email Sent successfully...",
        data: employee,
    });
});

export const getAllEmployee = catchAsyncError(async (req, res, next) => {
    const employees = await Employee.find({
        orginazation: req.auth._id,
    });

    if (employees.length === 0) {
        return res
            .status(200)
            .json({ success: true, message: "No Employee Found..." });
    }

    res.status(200).json({ success: true, data: [...employees] });
});

export const getEmployeeInformation = catchAsyncError(
    async (req, res, next) => {
        const { employeeID } = req.params;

        const employee = await Employee.findOne({ _id: employeeID });

        if (!employee) {
            return res
                .status(404)
                .json({ success: false, message: "No employee found!" });
        }

        employee.password = undefined;

        res.status(200).json({ success: true, data: employee });
    }
);

export const updateOrginazationOwner = catchAsyncError(
    async (req, res, next) => {
        const update = { $set: { owner: {} } };

        for (let key in req.body) {
            update.$set.owner[key] = req.body[key];
        }

        const orginazation = await Orginazation.findOneAndUpdate(
            { _id: req.auth._id },
            update,
            { new: true }
        );
        orginazation.password = undefined;
        res.status(200).json({ success: true, data: orginazation });
    }
);

export const getOrginazationDetails = catchAsyncError(
    async (req, res, next) => {
        const orginazation = await Orginazation.findOne({ _id: req.auth._id });
        res.status(200).json({ success: true, data: orginazation });
    }
);

export const updateBusinessInformation = catchAsyncError(
    async (req, res, next) => {
        const update = { $set: { businessInformation: {} } };

        for (let key in req.body) {
            update.$set.businessInformation[key] = req.body[key];
        }

        const orginazation = await Orginazation.findOneAndUpdate(
            { _id: req.auth._id },
            update,
            { new: true }
        );
        orginazation.password = undefined;
        res.status(200).json({ success: true, data: orginazation });
    }
);

export const getEmployeeGainedCurrentMonth = catchAsyncError(
    async (req, res, next) => {
        const employee = await Employee.aggregate([
            // User is the model of userSchema
            {
                $group: {
                    _id: { $month: "$createdAt" }, // group by the month *number*, mongodb doesn't have a way to format date as month names
                    numberofdocuments: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: false, // remove _id
                    month: {
                        // set the field month as the month name representing the month number
                        $arrayElemAt: [
                            [
                                "", // month number starts at 1, so the 0th element can be anything
                                "january",
                                "february",
                                "march",
                                "april",
                                "may",
                                "june",
                                "july",
                                "august",
                                "september",
                                "october",
                                "november",
                                "december",
                            ],
                            "$_id",
                        ],
                    },
                    numberofdocuments: true, // keep the count
                },
            },
        ]);

        res.status(200).json({ success: true, data: employee[0] });
    }
);

export const getTotalAmountPaidThisMonth = catchAsyncError(
    async (req, res, next) => {
        const transaction = await Transaction.aggregate([
            {
                $match: {
                    status: "Success",
                },
            },
            {
                $addFields: {
                    month: { $month: "$transactionDate" },
                    amountNum: { $toDecimal: "$amount" },
                },
            },
            {
                $group: {
                    _id: "$month",
                    totalAmount: { $sum: "$amountNum" },
                },
            },
            {
                $project: {
                    _id: 0,
                    month: "$_id",
                    totalAmount: 1,
                },
            },
        ]);
        res.status(200).json({ success: true, data: transaction });
    }
);

export const getAllPendingTransaction = catchAsyncError(
    async (req, res, next) => {
        const currentDate = new Date();
        const payDay = new Date();
        payDay.setMonth(currentDate.getMonth() + 1);

        const employees = await Employee.find({
            payDate: {
                $lte: currentDate,
            },
            orginazation: req.auth._id,
        });

        res.status(200).json({ success: true, data: employees });
    }
);

export const getUpcommingPayout = catchAsyncError(async (req, res, next) => {
    const currentDate = new Date();

    const pipeline = [
        {
            $match: {
                payDate: { $gt: currentDate },
            },
        },
        {
            $project: {
                _id: 0,
                paymentAmount: {
                    $toDecimal: "$paymentAmount",
                },
            },
        },
        {
            $group: {
                _id: null,
                totalPayment: { $sum: "$paymentAmount" },
            },
        },
    ];

    const employee = await Employee.aggregate(pipeline);

    console.log(employee);

    const totalPayment = employee.length ? employee[0].totalPayment : 0;

    res.status(200).json({ success: true, data: totalPayment });
});

// approve or reject manual workhour time request
export const reviewWorkHourStatus = catchAsyncError(async (req, res, next) => {
    const { attendanceId, status } = req.body;
    let attendance = await Attendance.findOne({ _id: attendanceId });
    attendance.manualWorkHour.isApproved.status = status;
    attendance.save();
    res.status(200).json({ success: true, message: "Action Updated..." });
});

export const getAllAttendances = catchAsyncError(async (req, res, next) => {
    const currentDate = new Date();
    currentDate.setUTCHours(0, 0, 0, 0);

    const attendance = await Attendance.find({
        clockIn: {
            $gte: currentDate,
            $lt: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000),
        },
    }).populate("employeeId");

    res.status(200).json({ success: true, data: attendance });
});

export const getAllLeaveRequest = catchAsyncError(async (req, res, next) => {
    const { status } = req.body;
    const attendance = await Attendance.find({
        "leave.status": status,
        "leave.isRequested": true,
    }).populate("employeeId");

    res.status(200).json({ success: true, data: attendance });
});

export const updateLeaveRequest = catchAsyncError(async (req, res, next) => {
    const { status, id } = req.body;
    const attendance = await Attendance.findOne({ _id: id });
    attendance.leave.status = status;
    await attendance.save();

    return res.status(200).json({ success: true, data: attendance });
});
