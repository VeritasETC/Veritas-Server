import { catchAsyncError } from "../utils/catchAsyncError.js";
import AppError from "../utils/AppError.js";
import Employee from "../models/Employee.js";
import Attendance from "../models/Attendance.js";
import { formatMilliseconds } from "../utils/formatTime.js";
import Transaction from "../models/Transaction.js";

export const setEmployeePassword = catchAsyncError(async (req, res, next) => {
    const { password, email, name } = req.body;

    const employee = await Employee.findOne({ empEmail: email });

    if (!employee) {
        return next(new AppError("Email not registered!", 400));
    }

    employee.password = password;
    await employee.save();

    const token = employee.generateJwtToken();
    employee.password = undefined;

    res.status(201).json({ success: true, data: { ...employee._doc, token } });
});

export const employeeSignin = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    const employee = await Employee.findOne({
        empEmail: email,
    });

    if (!employee) {
        return next(new AppError("Email Email not registered!", 404));
    }

    const isValid = await employee.comparePassword(password);

    if (!isValid) {
        return next(new AppError("Invalid Password!", 400));
    }

    const token = employee.generateJwtToken();

    return res
        .status(200)
        .json({ success: true, data: { ...employee._doc, token } });
});

export const updateEmployeeInformation = catchAsyncError(
    async (req, res, next) => {
        const update = { $set: {} };

        for (let key in req.body) {
            update.$set[key] = req.body[key];
        }

        const updatedEmployee = await Employee.findOneAndUpdate(
            { _id: req.auth._id },
            update,
            { new: true }
        );
        updatedEmployee.password = undefined;

        res.status(201).json({ success: true, data: { updatedEmployee } });
    }
);

export const getLoggedInEmployeeInfo = catchAsyncError(
    async (req, res, next) => {
        const employee = await Employee.findOne({ _id: req.auth._id });
        return res.status(200).json({ success: true, data: employee });
    }
);

export const employeeClockIn = catchAsyncError(async (req, res, next) => {
    const employee = await Employee.findById(req.auth._id);
    const currentDate = new Date();
    currentDate.setUTCHours(0, 0, 0, 0);

    let attendance = await Attendance.findOne({
        employeeId: req.auth._id,
        clockIn: {
            $gte: currentDate,
            $lt: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000), // Add 24 hours to get the next day
        },
    });

    if (attendance?.clockOut) {
        return res.status(200).json({
            success: false,

            message:
                "You have already cloked out for today! you can not clock in again",
        });
    }

    if (attendance) {
        return res
            .status(200)
            .json({ success: false, message: "You are already clocked in." });
    }

    attendance = new Attendance({
        employeeId: employee._id,
        clockIn: new Date(),
        isWorkStarted: true,
    });
    await attendance.save();
    res.status(200).json({ success: true, data: employee });
});

export const employeeClockOut = catchAsyncError(async (req, res, next) => {
    const attendance = await Attendance.findOne({ employeeId: req.auth._id });

    if (attendance && !attendance.clockOut) {
        attendance.clockOut = new Date();
        attendance.isWorkStarted = false;
        await attendance.save();

        res.status(200).json({
            success: true,
            message: "Work time Stopped...",
        });
    } else {
        return next(new AppError("No clock-in found for the employee.", 400));
    }
});

// Calculate Work Hours
export const getTotalWorkTime = catchAsyncError(async (req, res, next) => {
    const attendances = await Attendance.find({ employeeId: req.auth._id });
    let totalWorkHours = 0;

    attendances.forEach((attendance) => {
        if (attendance.clockIn && attendance.clockOut) {
            const duration = attendance.clockOut - attendance.clockIn;
            totalWorkHours += duration;
        }
    });

    const workHoursInHours = totalWorkHours / (1000 * 60 * 60); // Convert milliseconds to hours
    res.status(200).json({
        success: true,
        data: { workHours: workHoursInHours },
    });
});

export const getWorkTime = catchAsyncError(async (req, res, next) => {
    const currentDate = new Date();
    currentDate.setUTCHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
        employeeId: req.auth._id,
        clockIn: {
            $gte: currentDate,
            $lt: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000),
        },
    });

    if (attendance && attendance?.clockIn && attendance?.clockOut) {
        const duration = attendance.clockOut - attendance.clockIn;
        // let workHours = duration / (1000 * 60 * 60);
        let workHours = formatMilliseconds(duration);
        return res.status(200).json({
            success: true,
            data: { workHours: workHours },
        });
    }

    res.status(400).json({
        success: false,
        status: "work-not-started",
        message: "Timer not started yet!",
    });
});

export const leaveRequest = catchAsyncError(async (req, res, next) => {
    const { fromDate, toDate, reason, hour, numOfDays } = req.body;
    if (!fromDate) {
        return next(new AppError("Please provide leave date", 400));
    }

    const attendance = await Attendance.findOne({ employeeId: req.auth._id });

    if (attendance) {
        let attendance = await Attendance.create({
            employeeId: req.auth._id,
            leave: {
                reason,
                from: fromDate,
                hour,
                numOfDays,
                to: toDate,
                status: "pending",
                isRequested: true,
            },
        });
        return res.status(200).json({
            success: true,
            data: attendance,
            message: "Leave request sent for approval.",
        });
    }

    attendance.leave = {
        reason,
        from: fromDate,
        hour,
        numOfDays,
        to: toDate,
        status: "pending",
        isRequested: true,
    };
    await attendance.save();
    return res.status(200).json({
        success: true,
        data: attendance,
        message: "Leave request sent for approval.",
    });
});

export const getWorkStatus = catchAsyncError(async (req, res, next) => {
    const currentDate = new Date();
    currentDate.setUTCHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
        employeeId: req.auth._id,
        clockIn: {
            $gte: currentDate,
            $lt: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000),
        },
    });

    if (attendance && attendance?.clockIn) {
        return res
            .status(200)
            .json({ success: true, data: attendance, status: "work-started" });
    }
    return res
        .status(400)
        .json({ success: false, message: "Work not started!" });
});

// manual work setting
export const setMyWorkHour = catchAsyncError(async (req, res, next) => {
    const { date, hour, note } = req.body;
    const currentDate = new Date();
    currentDate.setUTCHours(0, 0, 0, 0);

    let attendance = await Attendance.findOne({
        employeeId: req.auth._id,
        clockIn: {
            $gte: currentDate,
            $lt: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000),
        },
    });

    if (attendance) {
        attendance.manualWorkHour.date = date;
        attendance.manualWorkHour.hour = hour;
        attendance.manualWorkHour.note = note;
        await attendance.save();
        return res
            .status(200)
            .json({ success: true, message: "Request Sent for approval!" });
    }

    attendance = await Attendance.create({
        manualWorkHour: {
            date,
            hour,
            note,
        },
    });
    return res
        .status(200)
        .json({ success: true, message: "Request Sent for approval!" });
});

export const getMyAttendances = catchAsyncError(async (req, res, next) => {
    const currentDate = new Date();
    currentDate.setUTCHours(0, 0, 0, 0);

    const attendance = await Attendance.find({
        employeeId: req.auth._id,
        // clockIn: {
        //     $gte: currentDate,
        //     $lt: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000),
        // },
    }).populate("employeeId");

    res.status(200).json({ success: true, data: attendance });
});

export const getAllMyLeaves = catchAsyncError(async (req, res, next) => {
    const attendances = await Attendance.find({
        employeeId: req.auth._id,
        "leave.isRequested": true,
    }).populate("employeeId");

    res.status(200).json({ success: true, data: attendances });
});

// helper function
const getPreviousMonthPay = async (employeeId) => {
    const currentDate = new Date();
    const previousMonthStart = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 2,
        1
    );
    const previousMonthEnd = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        0
    );

    const previousMonthTransactions = await Transaction.find({
        employeeId: employeeId,
        transactionDate: {
            $gte: previousMonthStart,
            $lte: previousMonthEnd,
        },
        status: "Success",
    }).exec();

    let previousMonthPay = 0;

    for (const transaction of previousMonthTransactions) {
        previousMonthPay += parseFloat(transaction.amount);
    }

    return previousMonthPay;
};

export const getPrevMonthPay = catchAsyncError(async (req, res, next) => {
    const currentDate = new Date();
    const previousMonthStart = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        1
    );
    const previousMonthEnd = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        0
    );

    const transaction = await Transaction.findOne({
        employeeId: req.auth._id,
        transactionDate: {
            $gte: previousMonthStart,
            $lte: previousMonthEnd,
        },
        status: "Success",
    }).exec();
    // console.log(transaction, "sasa", req.auth._id);
    // Retrieve the previous month's pay
    const previousMonthPay = await getPreviousMonthPay(req.auth._id);

    //  const difference = pay - previousMonthPay;

    res.status(200).json({ success: true, data: "difference" });
});
