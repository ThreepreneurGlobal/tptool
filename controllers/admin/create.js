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
        subject: 'Your futryoAI One Time Password (OTP) for Verification',
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>OTP FOR futryoAI</title>
            </head>
            <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
                <table align="center" width="100%" cellpadding="0" cellspacing="0"
                    style="max-width: 600px; background-color: #ffffff; border: 1px solid #e0e0e0; margin-top: 50px;border-radius: 1vmax;">
                    <tr>
                        <td style="padding: 20px; text-align: center; background-color: #2c89e6; color: #ffffff;">
                            <h2>Verify Your Email</h2>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px; text-align: center;">
                            <p style="font-size: 16px; color: #333;">Hello, ${user?.name}</p>
                            <p style="font-size: 16px; color: #333;">Your One-Time Password (OTP) for verification is:</p>
                            <h1 style="background-color: #f0f0f0; display: inline-block; padding: 10px 20px; border-radius: 5px; color: #2c3e50; letter-spacing: 4px;">
                                ${otp}
                            </h1>
                            <p style="font-size: 14px; color: #999; margin-top: 20px;">This OTP is valid for 05 minutes. Do not share it with anyone.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px; text-align: center; font-size: 12px; color: #aaa;">
                            &copy;${new Date().getFullYear()} futryoAI. All rights reserved.
                        </td>
                    </tr>
                </table>
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
        subject: 'Your futryoAI Account is Ready!',
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <title>futryoAI Account</title>
            </head>
            <body style="font-family: Arial, sans-serif; background-color: #f6f6f6; margin: 0; padding: 0;">
                <table align="center" cellpadding="0" cellspacing="0" width="100%"
                    style="max-width: 600px; background-color: #ffffff; margin-top: 40px; border: 1px solid #ddd;">
                    <tr>
                        <td style="background-color: #4390dc; color: #ffffff; padding: 20px; text-align: center;">
                            <h2>Welcome to futryoAI</h2>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px;">
                            <p style="font-size: 16px; color: #333;">Hi ${user?.name?.toUpperCase()},</p>
                            <p style="font-size: 16px; color: #333;">
                                Your account has been created successfully. Below are your login credentials:
                            </p>

                            <table style="margin: 20px 0; padding: 10px; background-color: #f9f9f9; border-radius: 5px;"
                                width="100%">
                                <tr>
                                    <td style="padding: 10px; font-weight: bold;">Email:</td>
                                    <td style="padding: 10px;">${user?.email}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; font-weight: bold;">Password:</td>
                                    <td style="padding: 10px;">${new_pass}</td>
                                </tr>
                            </table>

                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${credential?.front_host_url}/login" target="_blank"
                                    style="background-color: #3498db; color: #fff; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-size: 16px; display: inline-block;">
                                    Login
                                </a>
                            </div>

                            <p style="font-size: 14px; color: #666;">If you have any questions, feel free to contact our support team.</p>

                            <p style="font-size: 16px; color: #333;">Regards,<br>futryoAI Team</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="text-align: center; font-size: 12px; color: #999; padding: 20px; background-color: #f0f0f0;">
                            &copy; ${new Date().getFullYear()} futryoAI. All rights reserved.
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `,
    };
    await mailTransporter.sendMail(options, (error, info) => {
        if (error) {
            return new ErrorHandler(error.message, 400);
        };
    });
    resp.status(201).json({ success: true, message: 'ADMIN CREATED!' });
});

