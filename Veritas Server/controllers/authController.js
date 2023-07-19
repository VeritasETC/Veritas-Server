import { catchAsyncError } from "../utils/catchAsyncError.js";
import AppError from "../utils/AppError.js";
import Employee from "../models/Employee.js";
import Orginazation from "../models/Orginazation.js";
import { orginazationSignin } from "./orginazationController.js";
import { employeeSignin } from "./employeeController.js";

export const signin = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError("All fields are required!", 400));
    }

    let employee = await Employee.findOne({ empEmail: email });

    let orginazation = await Orginazation.findOne({ mailingAddress: email });

    if (employee) {
        // employee login
        await employeeSignin(req, res, next);
    } else if (orginazation) {
        // orginazation login
        await orginazationSignin(req, res, next);
    } else {
        return next(new AppError("email not registered!", 400));
    }
});
