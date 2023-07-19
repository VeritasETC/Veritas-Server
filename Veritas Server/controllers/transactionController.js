import Employee from "../models/Employee.js";
import Transaction from "../models/Transaction.js";
import { catchAsyncError } from "../utils/catchAsyncError.js";

export const saveTransaction = catchAsyncError(async (req, res, next) => {
    const { transactionHash, fromAddress, toAddress, amount } = req.body;
    const { employeeId } = req.params;

    const transaction = await Transaction.create({
        transactionHash,
        fromAddress,
        toAddress,
        amount,
        employeeId,
        orginazationId: req.auth._id,
        status: "Success",
    });
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    await Employee.findOneAndUpdate(
        { _id: employeeId },
        { $set: { payDate: nextMonth } },
        { new: true }
    );

    res.status(201).json({ success: true, data: transaction });
});

export const getAllTransactions = catchAsyncError(async (req, res, next) => {
    const { employeeId } = req.params;

    const transactions = await Transaction.find({
        employeeId,
        // orginazationId: req.auth._id,
    }).populate("employeeId");
    if (transactions.length === 0) {
        return res
            .status(200)
            .json({ success: true, message: "No Transactions...." });
    }

    res.status(200).json({ success: true, data: transactions });
});

export const getTotalTransactions = catchAsyncError(async (req, res, next) => {
    const { status } = req.body;
    if (status) {
        const transactions = await Transaction.find({
            orginazationId: req.auth._id,
            status,
        }).populate("employeeId");
        if (transactions.length === 0) {
            return res
                .status(200)
                .json({ success: true, message: "No Transactions...." });
        }

        return res.status(200).json({ success: true, data: transactions });
    }
    const transactions = await Transaction.find({
        orginazationId: req.auth._id,
    }).populate("employeeId");
    if (transactions.length === 0) {
        return res
            .status(200)
            .json({ success: true, message: "No Transactions...." });
    }

    res.status(200).json({ success: true, data: transactions });
});

export const getMonthlyTransactions = catchAsyncError(
    async (req, res, next) => {
        const year = new Date().getFullYear();
        const month = new Date().getMonth() + 1;

        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59);

        const monthlyTransactions = await Transaction.aggregate([
            {
                $match: {
                    employeeId: req.auth._id,
                    transactionDate: {
                        $gte: startOfMonth,
                        $lte: endOfMonth,
                    },
                },
            },
            {
                $project: {
                    transactionHash: 1,
                    fromAddress: 1,
                    toAddress: 1,
                    amount: 1,
                    employeeId: 1,
                    organizationId: 1,
                    status: 1,
                    transactionDate: 1,
                    monthName: {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $eq: [
                                            { $month: "$transactionDate" },
                                            1,
                                        ],
                                    },
                                    then: "January",
                                },
                                {
                                    case: {
                                        $eq: [
                                            { $month: "$transactionDate" },
                                            2,
                                        ],
                                    },
                                    then: "February",
                                },
                                {
                                    case: {
                                        $eq: [
                                            { $month: "$transactionDate" },
                                            3,
                                        ],
                                    },
                                    then: "March",
                                },
                                {
                                    case: {
                                        $eq: [
                                            { $month: "$transactionDate" },
                                            4,
                                        ],
                                    },
                                    then: "April",
                                },
                                {
                                    case: {
                                        $eq: [
                                            { $month: "$transactionDate" },
                                            5,
                                        ],
                                    },
                                    then: "May",
                                },
                                {
                                    case: {
                                        $eq: [
                                            { $month: "$transactionDate" },
                                            6,
                                        ],
                                    },
                                    then: "June",
                                },
                                {
                                    case: {
                                        $eq: [
                                            { $month: "$transactionDate" },
                                            7,
                                        ],
                                    },
                                    then: "July",
                                },
                                {
                                    case: {
                                        $eq: [
                                            { $month: "$transactionDate" },
                                            8,
                                        ],
                                    },
                                    then: "August",
                                },
                                {
                                    case: {
                                        $eq: [
                                            { $month: "$transactionDate" },
                                            9,
                                        ],
                                    },
                                    then: "September",
                                },
                                {
                                    case: {
                                        $eq: [
                                            { $month: "$transactionDate" },
                                            10,
                                        ],
                                    },
                                    then: "October",
                                },
                                {
                                    case: {
                                        $eq: [
                                            { $month: "$transactionDate" },
                                            11,
                                        ],
                                    },
                                    then: "November",
                                },
                                {
                                    case: {
                                        $eq: [
                                            { $month: "$transactionDate" },
                                            12,
                                        ],
                                    },
                                    then: "December",
                                },
                            ],
                            default: "",
                        },
                    },
                },
            },
        ]);
        res.status(200).json({ success: true, data: monthlyTransactions });
    }
);

export const getTransaction = catchAsyncError(async (req, res, next) => {
    const { transactionId } = req.body;

    const transactions = await Transaction.findOne({
        _id: transactionId,
    })
        .populate("employeeId")
        .populate("orginazationId");

    res.status(200).json({ success: true, data: transactions });
});

export const getAllMyTransactions = catchAsyncError(async (req, res, next) => {
    const transactions = await Transaction.find({ employeeId: req.auth._id })
        .populate("employeeId")
        .populate("orginazationId");
    res.status(200).json({ success: true, data: transactions });
});
