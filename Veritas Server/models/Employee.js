import mongoose from "mongoose";
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { authRole } from "../utils/authRole.js";

const EmployeeSchema = new Schema(
    {
        empName: {
            type: String,
            trim: true,
            lowercase: true,
            required: true,
        },
        empEmail: {
            type: String,
            trim: true,
            lowercase: true,
        },
        empAddress: {
            type: String,
            trim: true,
            lowercase: true,
        },
        empPhoneNumber: {
            type: String,
            trim: true,
            lowercase: true,
        },
        empStartDate: {
            type: Date,
        },
        payType: {
            type: String,
            enum: ["hourly", "weekly", "monthly"],
        },
        payDate: {
            type: Date,
        },
        // attendances: [{ type: ObjectId, ref: "Attendance" }],
        leaveBalance: { type: Number, default: 0 },
        jobTitle: {
            type: String,
            trim: true,
            required: true,
        },
        employmentStatus: {
            type: String,
            enum: ["Full-time", "Part-time"],
        },
        salary: {
            type: String,
        },
        paymentAmount: {
            type: String,
        },
        taxRate: {
            type: String,
        },
        password: {
            type: String,
        },
        socialNumber: {
            type: String,
            trim: true,
        },
        walletAddress: {
            type: String,
            trim: true,
        },
        passChangedAt: {
            type: Date,
        },
        role: {
            type: String,
            enum: Object.values(authRole),
            default: authRole.EMPLOYEE,
        },
        orginazation: {
            type: ObjectId,
            ref: "Orginazation",
        },
    },
    { timestamps: true }
);

EmployeeSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return;

    this.password = await bcryptjs.hash(this.password, 10);
    this.passChangedAt = new Date();
    return next();
});

EmployeeSchema.methods = {
    generateJwtToken: function () {
        const token = jwt.sign({ id: this._id }, config.JWT_SECRET, {
            expiresIn: config.JWT_EXPIRE,
        });
        return token;
    },

    comparePassword: async function (plainPassword) {
        return await bcryptjs.compare(plainPassword, this.password);
    },
};

export default mongoose.model("Employee", EmployeeSchema);
