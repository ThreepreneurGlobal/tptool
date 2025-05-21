import bcryptjs from 'bcryptjs';
import fs from 'fs';
import { Op } from 'sequelize';

import User from '../models/user.js';
import sendToken from '../utils/token.js';
import TryCatch, { ErrorHandler } from '../utils/trycatch.js';
import { uploadFile } from '../utils/upload.js';


export const registerUser = TryCatch(async (req, resp, next) => {
    const { name, mobile, email, password } = req.body;
    if (!name || !email || !mobile || !password) {
        return next(new ErrorHandler('ALL FIELDS REQUIRED!', 400));
    };

    const exists = await User.findOne({ where: { [Op.or]: [{ email }, { mobile }] } });
    if (exists) {
        return next(new ErrorHandler('USER ALREADY REGISTERED!', 400));
    };

    const hash_pass = await bcryptjs.hash(password, 10);
    const user = await User.create({ name, mobile, email, password: hash_pass, designation: 'super admin', role: 'super' });
    if (!user) {
        return next(new ErrorHandler('USER NOT REGISTERED!', 400));
    };

    resp.status(201).json({ success: true, message: 'SUPER ADMIN REGISTERED SUCCESSFULLY!' });
});


export const loginUser = TryCatch(async (req, resp, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new ErrorHandler('MAIL ID AND PASSWORD REQUIRED!', 400));
    };

    const user = await User.findOne({ where: { email, status: true }, attributes: ['id', 'name', 'email', 'password'] });
    if (!user) {
        return next(new ErrorHandler('INVALID MAIL ID OR PASSWORD!', 403));
    };

    const isMatched = await user.comparePass(password);
    if (!isMatched) {
        return next(new ErrorHandler('INVALID MAIL ID OR PASSWORD!', 403));
    };

    sendToken(user, 200, resp);
});


export const myProfileUser = TryCatch(async (req, resp, next) => {
    const user = await User.findOne({
        where: { id: req.user.id, status: true },
        attributes: { exclude: ['password', 'otp', 'otp_valid', 'auth_tokens', 'college_id', 'created_at', 'updated_at'] }
    });

    resp.status(200).json({ success: true, user });
});


export const logoutUser = TryCatch(async (req, resp, next) => {
    const auth_token = req.headers['authorization'];
    const user = await User.findOne({ where: { id: req.user.id, status: true }, attributes: ['id', 'auth_tokens'] });

    const auth_tokens = user?.auth_tokens?.filter(token => token !== auth_token);
    await user.update({ auth_tokens });
    resp.status(200).json({ success: true, message: 'LOGGED OUT SUCCESSFULLY!' });
});


export const editMyProfile = TryCatch(async (req, resp, next) => {
    const { name, email, mobile, address, city, state, country, pin_code,
        designation, facebook, twitter, instagram, linkedin, avatar: avatar_txt } = req.body;
    const avatar_file = req.file?.path;

    const user = await User.findOne({
        where: { id: req.user.id, status: true },
        attributes: { exclude: ['password', 'created_at', 'updated_at'] }
    });

    const avatar = await uploadFile(user?.avatar, avatar_file, avatar_txt);

    await user.update({
        name, email, mobile, address, city, state, country, pin_code, designation,
        facebook, twitter, instagram, linkedin, avatar,
    });
    resp.status(200).json({ success: true, message: 'PROFILE UPDATED SUCCESSFULLY!' });
});


