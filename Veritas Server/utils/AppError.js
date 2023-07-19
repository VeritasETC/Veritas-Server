/**
 * global error class
 */
class AppError extends Error {
    statusCode;
    status;
    isOperational;

    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        this.status = `${statusCode}`.startsWith("4") ? "error" : "fail";

        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;
