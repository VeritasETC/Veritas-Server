import mongoose from "mongoose";
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const TransactionSchema = new Schema(
    {
        transactionHash: {
            type: String,
            trim: true,
            required: true,
        },
        fromAddress: {
            type: String,
            trim: true,
            required: true,
        },
        toAddress: {
            type: String,
            trim: true,
            required: true,
        },
        amount: {
            type: String,
            trim: true,
            required: true,
        },
        amountInUsd: {
            type: String,
        },
        employeeId: {
            type: ObjectId,
            ref: "Employee",
        },
        orginazationId: {
            type: ObjectId,
            ref: "Orginazation",
        },
        status: {
            type: String,
            enum: ["Pending", "Success"],
        },
        transactionDate: {
            type: Date,
            default: new Date(),
        },
    },
    { timestamps: true }
);

export default mongoose.model("Transaction", TransactionSchema);
