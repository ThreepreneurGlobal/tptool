import bcryptjs from 'bcryptjs';
import fs from 'fs';
import { Op } from 'sequelize';

import User from '../models/user.js';
import sendToken, { cleanExpTokens } from '../utils/token.js';
import TryCatch, { ErrorHandler } from '../utils/trycatch.js';
import { uploadFile } from '../utils/upload.js';
// import SuperUser from '../models/super/user.js';


// SELF CREATE USING ONLY TESTING
export const createAdmin = TryCatch(async (req, resp, next) => {
    const { name, mobile, email, password, designation, id_prf } = req.body;

    const existed = await User.findOne({ [Op.or]: [{ name }, { email }, { mobile }] });
    if (existed) {
        return next(new ErrorHandler(`${existed.name} ALREADY EXISTS!`, 500));
    };

    const hash_pass = await bcryptjs.hash(password, 10);
    const user = await User.create({ name, mobile, email, password: hash_pass, designation, id_prf, role: 'admin' });
    if (!user) {
        return next(new ErrorHandler('REGISTRATION FAILED!', 500));
    };

    sendToken(user, 201, resp);
});


// LOGIN USER
export const loginUser = TryCatch(async (req, resp, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new ErrorHandler('PLEASE ENTER MAIL ID AND PASSWORD', 401));
    };

    const user = await User.findOne({ where: { email, status: true } });
    if (!user) {
        return next(new ErrorHandler("PLEASE ENTER VALID MAIL ID AND PASSWORD!", 401));
    };

    const isPassMatch = await user.comparePass(password);
    if (!isPassMatch) {
        return next(new ErrorHandler("PLEASE ENTER VALID MAIL ID AND PASSWORD!", 401));
    };

    sendToken(user, 200, resp);
});


// MY PROFILE RECORD
export const myProfile = TryCatch(async (req, resp, next) => {
    let modified;
    const user = await User.findOne({
        where: { id: req.user.id, status: true },
        attributes: { exclude: ["password", "auth_tokens", "status", "created_at", "updated_at"] },
    });

    if (user?.role === 'admin') {
        const collegePromise = await fetch(process.env.SUPER_SERVER + '/v1/college/profile?email=' + user?.email);
        const { college: { college_category } } = await collegePromise.json();

        modified = { ...user.toJSON(), college_category };
    } else {
        modified = user;
    };

    resp.status(200).json({ success: true, user: modified });
});


// USER LOGOUT
export const logoutUser = TryCatch(async (req, resp, next) => {
    const auth_token = req.headers['authorization'];
    const user = await User.findOne({ where: { id: req.user.id, status: true }, attributes: ['id', 'auth_tokens'] });

    const auth_tokens = user?.auth_tokens?.filter(token => token !== auth_token);
    await user.update({ auth_tokens });

    resp.status(200).json({ success: true, message: "LOGGED OUT SUCCESSFULLY..." });
});


// UPDATE MY PROFILE
export const updateProfile = TryCatch(async (req, resp, next) => {
    const { gender, address, city, pin_code, facebook, twitter, instagram, linkedin, whatsapp, avatar: avatar_txt, Authorization } = req.body;
    const avatar_file = req.file?.path;

    const user = await User.findOne({ where: { id: req.user.id, status: true } });
    const avatar = await uploadFile(user?.avatar, avatar_file, avatar_txt);

    await user.update({ gender, address, city, pin_code, facebook, twitter, instagram, linkedin, whatsapp, avatar });

    if (user?.role === 'admin') {
        const request_body = { address, city, pin_code, facebook, twitter, instagram, linkedin, avatar };
        const admin_user_promise = await fetch(process.env.SUPER_SERVER + '/v1/user/myprofile', {
            method: 'GET', headers: { Authorization },
        });
        const { user: admin_user } = await admin_user_promise.json();

        if (!admin_user) {
            return next(new ErrorHandler('PROFILE NOT FOUND!', 404));
        };
        const edit_admin_promise = await fetch(process.env.SUPER_SERVER + '/v1/user/update/myprofile', {
            method: 'PUT', body: request_body,
            headers: { "Content-Type": "multipart/form-data", Authorization },
        });
        const { message: admin_msg } = await edit_admin_promise.json();
        console.log(admin_msg);
    };
    resp.status(200).json({ success: true, message: "PROFILE UPDATED SUCCESSFULLY..." });
});


//User to Student Association
// User.hasOne(Student, { foreignKey: "userId", as: "student" });
// Student.belongsTo(User, { foreignKey: "userId", as: "user" });
