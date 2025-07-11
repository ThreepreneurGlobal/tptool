import { ErrorHandler } from "../utils/trycatch.js";


// ERROR MIDDLEWARE
const ErrorMiddleware = (err, req, resp, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "INTERNAL SERVER ERROR!";

    // json web token error
    if (err.name == "JsonWebTokenError") {
        // const message = `JSON WEB TOKEN IS INVALID! TRY AGAIN...`;
        const message = 'PLEASE LOGIN FIRST!'
        err = new ErrorHandler(message, 400);
    };

    // json web token expire error
    if (err.name == "TokenExpiredError") {
        // const message = `JSON WEB TOKEN IS EXPIRED! TRY AGAIN...`;
        const message = 'PLEASE LOGIN FIRST!'
        err = new ErrorHandler(message, 400);
    };

    console.error(err);
    resp.status(err.statusCode).json({ success: false, message: err.message });
};


export default ErrorMiddleware;