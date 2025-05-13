import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import { DataTypes, Op, Sequelize } from "sequelize";

import College from "../../models/college.js";
import Credential from "../../models/credential.js";
import SecondUser from '../../models/second/user.js';
import User from "../../models/user.js";
import { decryptData, getIPAddress } from '../../utils/hashing.js';
import mailTransporter from "../../utils/mail.js";
import TryCatch, { ErrorHandler } from "../../utils/trycatch.js";



export const createAdmin = TryCatch(async (req, resp, next) => {
    const today = new Date();
    const { name, mobile, email, designation, college_id } = req.body;

    const exists = await User.findOne({ where: { [Op.or]: [{ email }, { mobile }], status: true, } });
    if (exists && exists?.college_id !== Number(college_id) && exists?.password && exists?.is_active && exists?.role === 'admin') {
        return next(new ErrorHandler('ADMIN ALREADY EXISTS BUT OTHER COLLEGE!', 400));
    };
    if (exists && exists?.college_id === Number(college_id) && exists?.password && exists?.is_active && exists?.role === 'admin') {
        return next(new ErrorHandler('ADMIN ALREADY EXISTS!', 400));
    };
    const college = await College.findOne({ where: { id: Number(college_id), status: true }, attributes: ['id', 'name', 'email'] });
    if (!college) {
        return next(new ErrorHandler('COLLEGE NOT FOUND!', 404));
    };

    const credential = await Credential.findOne({ where: { college_id: college?.id } });
    if (!credential) {
        return next(new ErrorHandler('CREATE SYSTEM FOR THIS COLLEGE!', 404));
    };

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hash_otp = crypto.createHash('sha256').update(otp).digest('hex');

    const db_name = decryptData(credential?.db_name);
    const db_user = decryptData(credential?.db_user);
    const db_pass = decryptData(credential?.db_pass);
    const db_host = decryptData(credential?.db_host);
    
    const db_ip_add = await getIPAddress(db_host);
    if (!db_ip_add) {
        return next(new ErrorHandler('INVALID DB HOSTING!', 400));
    };

    const collegeDb = new Sequelize(db_name, db_user, db_pass, {
        host: db_ip_add,
        // port: credential?.db_port,
        dialect: 'mysql',
    });

    try {
        await collegeDb.authenticate();
    } catch (error) {
        console.error(error?.message);
    }

    let user;
    if (exists && !exists?.is_active && !exists?.password) {
        user = await exists.update({ otp: hash_otp, otp_valid: today });
    } else {
        user = await User.create({ name, mobile, email, designation, college_id: college?.id, otp: hash_otp, otp_valid: today, is_active: false, role: 'admin' });
        if (!user) {
            return next(new ErrorHandler('ADMIN NOT CREATED!', 400));
        };

        try {
            const CollegeUser = SecondUser(collegeDb, DataTypes);
            await CollegeUser.create({ name, mobile, email, designation, role: 'admin', is_active: false, });
        } catch (error) {
            return next(new ErrorHandler('FAILED TO ADD USER TO COLLEGE DATABASE!', 400));
        }
    };

    // MAIL CONFIRMATION
    const options = {
        from: process.env.MAIL_USER,
        to: email,
        subject: 'Your One-Time Password (OTP) for Verification',
        html: `
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>OTP Verification</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        width: 100vw;
                        margin: 0 auto;
                        background-color: #ffffff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    }
                    .otp {
                        font-size: 24px;
                        font-weight: bold;
                        color: #007bff;
                        margin: 20px 0;
                        text-align: center;
                    }
                    .footer {
                        text-align: center;
                        font-size: 12px;
                        color: #777;
                        margin-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="content">
                        <p>Dear ${user?.name},</p>
                        <p>Thank you for using our service. Your One-Time Password (OTP) for verification is:</p>
                        <div class="otp">${otp}</div>
                        <p>Please enter this OTP in the application to complete your verification process. This OTP is valid for 5 minutes.</p>
                        <p>If you did not request this OTP, please ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2025 TPConnect. All rights reserved.</p>
                    </div>
                </div>
            </body>
        </html>
        `,
    };

    await mailTransporter.sendMail(options, (error, info) => {
        if (error) {
            return new ErrorHandler(error.message, 400);
        };
    });

    resp.status(200).json({ success: true, message: 'OTP SEND SUCCESSFULLY!' });
});


export const verifyOtp = TryCatch(async (req, resp, next) => {
    const today = new Date();
    const { email, otp } = req.body;
    if (!email || !otp) {
        return next(new ErrorHandler('MAIL ID AND OTP REQUIRED!', 400));
    };

    const hash_otp = crypto.createHash('sha256').update(otp).digest('hex');
    const user = await User.findOne({ where: { email, status: true, is_active: false, }, });
    if (!user) {
        return next(new ErrorHandler('USER NOT FOUND!', 404));
    };
    if (user?.otp_valid > today) {
        return next(new ErrorHandler('YOUR OTP IS EXPIRE!', 404));
    };
    const verified = user?.otp === hash_otp && user?.status && !user?.is_active;
    if (!verified) {
        return next(new ErrorHandler('INVALID OTP!', 400));
    };

    resp.status(200).json({ success: true, message: 'USER VERIFIED SUCCESSFULLY!' });
});



export const createPassword = TryCatch(async (req, resp, next) => {
    const { new_pass, confirm_pass, email } = req.body;
    if (!email || !new_pass || !confirm_pass) {
        return next(new ErrorHandler('PASSWORD REQUIRED!', 400));
    };

    if (new_pass !== confirm_pass) {
        return next(new ErrorHandler('NEW PASSWORD AND CONFIRM PASSWORD DOES NOT MATCH!', 400));
    };

    const user = await User.findOne({ where: { email, status: true, is_active: false }, attributes: ['id', 'name', 'email', 'password', 'otp', 'is_active', 'college_id'] });
    if (!user) {
        return next(new ErrorHandler('USER NOT FOUND!', 404));
    };

    const hash_pass = await bcryptjs.hash(new_pass, 10);
    const is_update = await user.update({ password: hash_pass, is_active: true, otp: null, otp_valid: null, });
    if (!is_update || user?.password === null) {
        return next(new ErrorHandler('USER NOT REGISTERED!', 400));
    };

    const credential = await Credential.findOne({ where: { college_id: user?.college_id } });
    if (!credential) {
        return next(new ErrorHandler('CREATE SYSTEM FOR THIS COLLEGE!', 404));
    };

    const db_name = decryptData(credential?.db_name);
    const db_user = decryptData(credential?.db_user);
    const db_pass = decryptData(credential?.db_pass);
    const db_host = decryptData(credential?.db_host);

    const collegeDb = new Sequelize(db_name, db_user, db_pass, {
        host: db_host,
        // port: credential?.db_port,
        dialect: 'mysql',
    });
    try {
        await collegeDb.authenticate();
    } catch (error) {
        console.error(error?.message);
    }

    try {
        const CollegeUser = SecondUser(collegeDb, DataTypes);
        const college_admin = await CollegeUser.findOne({ where: { email, is_active: false } });
        if (!college_admin) {
            return next(new ErrorHandler('ADMIN NOT FOUND!', 404));
        };
        await college_admin.update({ password: hash_pass, is_active: true });
    } catch (error) {
        return next(new ErrorHandler(error?.message, error?.statusCode));
    }

    // MAIL CONFIRMATION
    const options = {
        from: process.env.MAIL_USER,
        to: user?.email,
        subject: 'Your TPConnect Account is Ready!',
        html: `
            <p>Dear <strong>${user?.name}</strong>,</p>
            <p>Your account has been successfully created. Below are your login details:</p>
            <p><strong>Email:</strong> ${user?.email} <br>
            <strong>Password:</strong> ${new_pass}</p>
            <p>You can access your account by clicking the button below:</p>
            <p style="text-align: center;">
                <a href="${credential?.front_host_url}/login" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Login to Your Account</a>
            </p>

            <p>If you did not request this account, please contact our support team immediately.</p>
            <p>
                Best Regards, <br>
                <strong>TPConnect</strong>
            </p>
        `,
    };
    await mailTransporter.sendMail(options, (error, info) => {
        if (error) {
            return new ErrorHandler(error.message, 400);
        };
    });
    resp.status(201).json({ success: true, message: 'ADMIN CREATED!' });
});

