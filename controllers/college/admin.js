import fs from 'fs';

import User from '../../models/user.js';
import College from '../../models/college.js';
import TryCatch, { ErrorHandler } from '../../utils/trycatch.js';
import { uploadFile } from '../../utils/upload.js';


// MY COLLEGE
export const myCollege = TryCatch(async (req, resp, next) => {
    const { email } = req.query;
    const user = await User.findOne({
        where: { email, status: true, is_active: true },
        attributes: ['id', 'name', 'email', 'role', 'college_id']
    });
    if (!user) {
        return next(new ErrorHandler('USER NOT FOUND!', 404));
    };

    const college = await College.findOne({ where: { id: user?.college_id, status: true } });
    if (!college) {
        return next(new ErrorHandler('COLLEGE NOT FOUND!', 404));
    };

    resp.status(200).json({ success: true, college });
});



// UPDATE COLLEGE
export const editMyCollege = TryCatch(async (req, resp, next) => {
    const {
        name, contact, web, description, address, city, state, country, pin_code, establish_yr, principal_name,
        principal_email, principal_contact, facebook, twitter, instagram, linkedin, youtube, admin_email, logo: logo_txt,
    } = req.body;
    const logo_file = req.file?.path;

    const user = await User.findOne({
        where: { email: admin_email, status: true, is_active: true },
        attributes: ['id', 'name', 'email', 'role', 'college_id']
    });
    if (!user) {
        return next(new ErrorHandler('USER NOT FOUND!', 404));
    };

    const college = await College.findOne({ where: { id: user?.college_id, status: true } });
    if (!college) {
        return next(new ErrorHandler('COLLEGE NOT FOUND!', 404));
    };

    const logo = await uploadFile(college?.logo, logo_file, logo_txt);

    await college.update({
        name, contact, web, address, city, state, country, pin_code, establish_yr, principal_name, principal_email,
        principal_contact, description, facebook, twitter, instagram, linkedin, youtube, logo,
    });
    resp.status(200).json({ success: true, message: 'COLLEGE PROFILE UPDATED!' });
});
