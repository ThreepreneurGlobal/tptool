import { ErrorHandler } from "../utils/trycatch.js";

const ErrorMiddleware = (error, req, resp, next) => {
    error.statusCode = error.statusCode || 500;
    error.message = error.message || "INTERNAL SERVER ERROR!";

    // json web token error
    if (error.name == "JsonWebTokenError") {
        const message = `PLEASE LOGIN FIRST!`;
        error = new ErrorHandler(message, 400);
    };

    // json web token expire error
    if (error.name == "TokenExpiredError") {
        const message = `PLEASE LOGIN FIRST!`;
        error = new ErrorHandler(message, 400);
    };

    resp.status(error.statusCode).json({ success: false, message: error.message });
};


export default ErrorMiddleware;