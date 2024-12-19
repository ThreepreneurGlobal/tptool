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
        return next(new ErrorHandler(`${existed.name} Already Exists!`, 500));
    };

    const user = await User.create({ name, mobile, email, password, designation, id_prf, role: 'admin' });
    if (!user) {
        return next(new ErrorHandler(`Registration Failed!`, 500));
    };

    sendToken(user, 201, resp);
});


export const loginUser = TryCatch(async (req, resp, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new ErrorHandler("Please Enter Email and Password!", 401));
    };

    const user = await User.findOne({ where: { email } });
    if (!user) {
        return next(new ErrorHandler("Please Enter Valid Email and Password!", 401));
    };

    const isPassMatch = await user.comparePass(password);
    if (!isPassMatch) {
        return next(new ErrorHandler("Please Enter Valid Email and Password!", 401));
    };

    sendToken(user, 200, resp);
});


export const myProfile = TryCatch(async (req, resp, next) => {
    const user = await User.findOne({
        where: { id: req.user.id, status: true },
        attributes: {
            exclude: ["password", "status", "created_at", "updated_at"]
        },
    });

    resp.status(200).json({ success: true, user });
});


export const logoutUser = TryCatch(async (req, resp, next) => {
    resp
        .status(200)
        .json({ success: true, message: "Logged Out Successfully..." });
});


export const updateProfile = TryCatch(async (req, resp, next) => {
    const { gender, address, city, pin_code, facebook, twitter, instagram, linkedin, whatsapp } = req.body;
    const avatar = req.file?.path;

    const user = await User.findByPk(req.user.id);

    if (avatar && user.avatar) {
        fs.rm(user.avatar, () => { console.log('OLD FILE REMOVED SUCCESSFULLY...'); });
    };

    await user.update({ avatar: avatar ? avatar : user.avatar, gender, address, city, pin_code, facebook, twitter, instagram, linkedin, whatsapp });
    resp.status(200).json({ success: true, message: "Profile Updated Successfully..." });
});


export const createStudent = TryCatch(async (req, resp, next) => {
    const {
        name, mobile, email, id_prf, dob, course, branch, batch, current_yr, enroll, ten_yr, gender,
        ten_board, ten_stream, ten_per, twelve_yr, twelve_board, twelve_stream, twelve_per, diploma,
        diploma_yr, diploma_stream, diploma_per, ed_gap, gap_desc, disability, experience,
    } = req.body;

    const existed = await User.findOne({ where: { [Op.or]: [{ name }, { email }, { mobile }, { id_prf }] } });
    if (existed) {
        return next(new ErrorHandler(`${existed.name} Already Exists!`, 500));
    };

    if (name?.length <= 5) {
        return next(new ErrorHandler(`Student Name too Short! min 6 Char Required!`, 500));
    };

    // Genrate Password
    let password;
    let student;
    const trimName = name?.replace(" ", "");
    const nameWord = trimName?.split(' ');
    if (nameWord?.length > 0) {
        const first = nameWord[0];
        password = (first.substring(0, 6)).charAt(0).toUpperCase() + first.substring(1, 6).toLowerCase() + "@123#";
    };

    const user = await User.create({ name, mobile, email, password, id_prf, gender });
    if (!user) {
        return next(new ErrorHandler(`Registration Failed!`, 500));
    };

    if (user) {
        student = await Student.create({
            dob, course, branch, batch, current_yr, enroll, ten_yr, ten_board, ten_stream, ten_per,
            twelve_yr, twelve_board, twelve_stream, twelve_per, diploma, diploma_yr, diploma_stream,
            diploma_per, ed_gap, gap_desc, disability, experience, user_id: user.id,
        });
    }
    if (!student) {
        return next(new ErrorHandler(`Registration Failed!`, 500));
    };
    resp.status(201).json({ success: true, message: `${user?.name?.toUpperCase()} ADDED...` });
});


export const studentById = TryCatch(async (req, resp, next) => {
    const user = await User.findOne({
        where: { id: req.params.id, status: true, role: 'user', designation: 'student' },
        attributes: { exclude: ['password', 'role', 'status', 'updated_at', 'created_at'] },
        include: [
            {
                model: Student, foreignKey: 'user_id', as: 'student', required: true,
                attributes: { exclude: ['user_id', 'status', 'updated_at', 'created_at'] },
            }
        ],
    });

    if (!user) {
        return next(new ErrorHandler('Student Not Found!', 404));
    };

    resp.status(200).json({ success: true, user });
});