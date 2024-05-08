const jwt = require('jsonwebtoken');
const User = require("../models/user");
const ErrorHandler = require("../utils/errHandle");
const TryCatch = require("./TryCatch");


exports.isAuthenticatedUser = TryCatch(async (req, resp, next) => {
    const { token } = req.cookies;
    // const token = req.headers.authorization;
    if (!token) {
        return next(new ErrorHandler("Please Login Firstly!", 403));
    };

    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findByPk(decode.id);
    next();
});



exports.isAutherizeRole = (...roles) => {
    return (req, resp, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler(`ROLE : ${req.user.role && 
                req.user.role.toUpperCase()} IS NOT ALLOWED TO ACCESS THIS RESOURCE!`, 403));
        };

        next();
    };
};