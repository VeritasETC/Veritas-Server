import mongoose from "mongoose";
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const AttendanceSchema = new Schema(
    {
        employeeId: { type: ObjectId, ref: "Employee" },
        clockIn: { type: Date },
        clockOut: { type: Date },
        leave: {
            status: {
                type: String,
                enum: ["pending", "approved", "rejected"],
                default: "pending",
            },
            isRequested: {
                type: Boolean,
                default: false,
            },
            from: {
                type: Date,
            },
            reason: {
                type: String,
            },
            to: {
                type: Date,
            },
            hour: {
                type: Number,
            },
            numOfDays: {
                type: Number,
            },
        },
        manualWorkHour: {
            date: { type: Date },
            hour: { type: Number },
            note: { type: String },
            isApproved: {
                by: { type: ObjectId, ref: "Orginazation" },
                status: {
                    type: String,
                    enum: ["pending", "approved", "rejected"],
                    default: "pending",
                },
            },
        },
        isWorkStarted: { type: Boolean, default: false },
    },
    { timestamps: true }
);
export default mongoose.model("Attendance", AttendanceSchema);
