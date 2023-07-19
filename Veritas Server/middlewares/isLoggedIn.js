import jwt from "jsonwebtoken";
import { catchAsyncError } from "../utils/catchAsyncError.js";
import Orginazation from "../models/Orginazation.js";
import AppError from "../utils/AppError.js";
import { config } from "../config/index.js";
import Employee from "../models/Employee.js";
import { authRole } from "../utils/authRole.js";

export const isLoggedIn = catchAsyncError(async (req, res, next) => {
  let token = req.headers?.authorization;

  if (!token) {
    return next(new AppError("No authorization token present in header", 400));
  }

  token = token.split(" ")[1];

  if (!token) {
    return next(new AppError("Invalid token..."));
  }

  const decoded = await jwt.verify(token, config.JWT_SECRET);
  const orginazation = await Orginazation.findOne({ _id: decoded.id });

  const employee = await Employee.findOne({ _id: decoded.id });

  if (orginazation) {
    req.auth = orginazation;
    return next();
  } else if (employee) {
    req.auth = employee;
    return next();
  }
});

export const isOrginazation = catchAsyncError(async (req, res, next) => {
  if (req.auth.role === authRole.ORGINAZATION) {
    return next();
  }
  return next(
    new AppError(
      "Access Denied! you are not authorized to perform this action",
      400
    )
  );
});
