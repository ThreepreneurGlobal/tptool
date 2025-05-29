import jwt from 'jsonwebtoken';

import User from '../models/user.js';
import TryCatch, { ErrorHandler } from '../utils/trycatch.js';


// AUTHENTICATION
const isAuthenticatedUser = TryCatch(async (req, resp, next) => {
    const auth_token = req.headers['authorization'];
    if (!auth_token) {
        return next(new ErrorHandler("PLEASE LOGIN FIRST!", 403));
    };

    const decode = jwt.verify(auth_token, process.env.JWT_SECRET);
    if (!decode) {
        return next(new ErrorHandler("PLEASE LOGIN FIRST!", 403));
    };

    const user = await User.findByPk(decode.id, { attributes: ['id', 'name', 'role', 'email', 'auth_tokens'] });
    if (!user) {
        return next(new ErrorHandler("PLEASE LOGIN FIRST!", 403));
    };

    const auth_tokens = user?.auth_tokens || [];
    if (!auth_tokens?.includes(auth_token)) {
        return next(new ErrorHandler("PLEASE LOGIN FIRST!", 403));
    };

    req.user = user;
    next();
});


// AUTHERIZATION FOR SPECIFIC APIS
const isAutherizeRole = (...roles) => {
    return (req, resp, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler(`${req.user.role?.toUpperCase()} IS NOT ALLOWED TO ACCESS THIS RESOURCE!`, 403));
        };

        next();
    };
};


export { isAuthenticatedUser, isAutherizeRole };

