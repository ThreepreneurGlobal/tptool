import fs from 'fs';
import { Op } from 'sequelize';

import Student from '../models/student.js';
import User from '../models/user.js';
import sendToken from '../utils/token.js';
import TryCatch, { ErrorHandler } from '../utils/trycatch.js';


export const createAdmin = TryCatch(async (req, resp, next) => {
    const { name, mobile, email, password, designation, id_prf } = req.body;

    const existed = await User.findOne({ [Op.or]: [{ name }, { email }, { mobile }] });
    if (existed) {
        return next(new ErrorHandler(`${existed.name} ALREADY EXISTS!`, 500));
    };

    const user = await User.create({ name, mobile, email, password, designation, id_prf, role: 'admin' });
    if (!user) {
        return next(new ErrorHandler('REGISTRATION FAILED!', 500));
    };

    sendToken(user, 201, resp);
});


export const loginUser = TryCatch(async (req, resp, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new ErrorHandler('PLEASE ENTER MAIL ID AND PASSWORD', 401));
    };

    const user = await User.findOne({ where: { email } });
    if (!user) {
        return next(new ErrorHandler("PLEASE ENTER VALID MAIL ID AND PASSWORD!", 401));
    };

    const isPassMatch = await user.comparePass(password);
    if (!isPassMatch) {
        return next(new ErrorHandler("PLEASE ENTER VALID MAIL ID AND PASSWORD!", 401));
    };

    sendToken(user, 200, resp);
});


export const myProfile = TryCatch(async (req, resp, next) => {
    const user = await User.findOne({
        where: { id: req.user.id, status: true },
        attributes: { exclude: ["password", "status", "created_at", "updated_at"] },
    });

    resp.status(200).json({ success: true, user });
});


export const logoutUser = TryCatch(async (req, resp, next) => {
    resp
        .status(200)
        .json({ success: true, message: "LOGGED OUT SUCCESSFULLY..." });
});


export const updateProfile = TryCatch(async (req, resp, next) => {
    const { gender, address, city, pin_code, facebook, twitter, instagram, linkedin, whatsapp } = req.body;
    const avatar = req.file?.path;

    const user = await User.findByPk(req.user.id);

    if (avatar && user.avatar) {
        fs.rm(user.avatar, () => { console.log('OLD FILE REMOVED SUCCESSFULLY...'); });
    };

    await user.update({ gender, address, city, pin_code, facebook, twitter, instagram, linkedin, whatsapp, avatar: avatar ? avatar : user.avatar });
    resp.status(200).json({ success: true, message: "PROFILE UPDATED SUCCESSFULLY..." });
});


//User to Student Association
// User.hasOne(Student, { foreignKey: "userId", as: "student" });
// Student.belongsTo(User, { foreignKey: "userId", as: "user" });
