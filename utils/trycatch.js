
const TryCatch = theFunc => (req, resp, next) => {
    Promise.resolve(theFunc(req, resp, next)).catch(next);
};


export class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;

        Error.captureStackTrace(this, this.constructor);
    }
};


export default TryCatch;