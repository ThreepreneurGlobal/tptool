import bcryptjs from 'bcryptjs';
import fs from 'fs';
import { Op } from 'sequelize';

import User from '../models/user.js';
import sendToken, { cleanExpTokens } from '../utils/token.js';
import TryCatch, { ErrorHandler } from '../utils/trycatch.js';
import SuperUser from '../models/super/user.js';


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
    const user = await User.findOne({
        where: { id: req.user.id, status: true },
        attributes: { exclude: ["password", "auth_tokens", "status", "created_at", "updated_at"] },
    });

    await cleanExpTokens(user?.id);
    resp.status(200).json({ success: true, user });
});


// USER LOGOUT
export const logoutUser = TryCatch(async (req, resp, next) => {
    const auth_token = req.headers['auth_token'];
    const user = await User.findOne({ where: { id: req.user.id, status: true }, attributes: ['id', 'auth_tokens'] });

    const auth_tokens = user?.auth_tokens?.filter(token => token !== auth_token);
    await user.update({ auth_tokens });

    resp.status(200)
        .json({ success: true, message: "LOGGED OUT SUCCESSFULLY..." });
});


// UPDATE MY PROFILE
export const updateProfile = TryCatch(async (req, resp, next) => {
    const { gender, address, city, pin_code, facebook, twitter, instagram, linkedin, whatsapp } = req.body;
    const avatar = req.file?.path;

    const user = await User.findOne({ where: { id: req.user.id, status: true } });

    if (avatar && user.avatar) {
        fs.rm(user.avatar, () => { console.log('OLD FILE REMOVED SUCCESSFULLY...'); });
    };
    await user.update({ gender, address, city, pin_code, facebook, twitter, instagram, linkedin, whatsapp, avatar: avatar ? avatar : user.avatar });

    if (user?.role === 'admin') {
        const admin_user = await SuperUser.findOne({ where: { email: user?.email, role: 'admin', status: true } });
        if (!admin_user) {
            return next(new ErrorHandler('PROFILE NOT FOUND!', 404));
        };

        await admin_user.update({ address, city, pin_code, facebook, twitter, instagram, linkedin, avatar: avatar ? avatar : user?.avatar });
    };
    resp.status(200).json({ success: true, message: "PROFILE UPDATED SUCCESSFULLY..." });
});


//User to Student Association
// User.hasOne(Student, { foreignKey: "userId", as: "student" });
// Student.belongsTo(User, { foreignKey: "userId", as: "user" });
