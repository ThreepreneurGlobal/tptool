import jwt from 'jsonwebtoken';

import User from '../models/user.js';
import TryCatch, { ErrorHandler } from '../utils/trycatch.js';


const isAuthenticatedUser = TryCatch(async (req, resp, next) => {
    const auth_token = req.headers['auth_token'];
    if (!auth_token) {
        return next(new ErrorHandler("Please Login First!", 403));
    };

    const decode = jwt.verify(auth_token, process.env.JWT_SECRET);
    if (!decode) {
        return next(new ErrorHandler("Please Login First!", 403));
    };

    req.user = await User.findByPk(decode.id, { attributes: ['id', 'name', 'role', 'email'] });
    next();
});


const isAutherizeRole = (...roles) => {
    return (req, resp, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler(`${req.user.role?.toUpperCase()} IS NOT ALLOWED TO ACCESS THIS RESOURCE!`, 403));
        };

        next();
    };
};


export { isAuthenticatedUser, isAutherizeRole };
