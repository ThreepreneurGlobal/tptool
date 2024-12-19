import { ErrorHandler } from "../utils/trycatch.js";

const ErrorMiddleware = (err, req, resp, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error!";

    // json web token error
    if (err.name == "JsonWebTokenError") {
        const message = `JSON Web Token is Invalid!, try again...`;
        err = new ErrorHandler(message, 400);
    };

    // json web token expire error
    if (err.name == "TokenExpiredError") {
        const message = `JSON Web Token is Expired!, try again...`;
        err = new ErrorHandler(message, 400);
    };

    resp.status(err.statusCode).json({ success: false, message: err.message });
};


export default ErrorMiddleware;