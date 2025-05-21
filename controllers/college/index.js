import crypto from 'crypto';
import { Op } from 'sequelize';

import College from '../../models/college.js';
import Credential from '../../models/credential.js';
import User from '../../models/user.js';
import { getCollegeOpts, getUniversityOpts } from '../../utils/options/college.js';
import TryCatch, { ErrorHandler } from '../../utils/trycatch.js';


export const createCollege = TryCatch(async (req, resp, next) => {
    const { name, reg_no, contact, email, type, university, city, state, country, pin_code,
        establish_yr, principal_name, principal_contact, principal_email } = req.body;

    const exists = await College.findOne({ where: { [Op.or]: [{ reg_no }, { email }], status: true } });
    if (exists) {
        return next(new ErrorHandler('COLLEGE ALREADY EXISTS!', 400));
    };

    const hash = crypto.createHash('sha256').update(reg_no + Date.now().toString()).digest('hex');

    const college = await College.create({
        name, reg_no, contact, email, university, principal_name, principal_contact, principal_email,
        type, city, state, country, pin_code, establish_yr, college_id: hash.substring(0, 10),
    });
    if (!college) {
        return next(new ErrorHandler('COLLEGE NOT CREATED!', 400));
    };

    resp.status(201).json({ success: true, message: college?.name?.toUpperCase() + ' CREATED!' });
});


export const getColleges = TryCatch(async (req, resp, next) => {
    const colleges = await College.findAll({
        where: { status: true }, order: [['created_at', 'DESC']],
        attributes: ['id', 'name', 'email', 'contact', 'type', 'university', 'city', 'state', 'country']
    });

    resp.status(200).json({ success: true, colleges });
});


export const getCollegeById = TryCatch(async (req, resp, next) => {
    const college = await College.findOne({
        where: { id: req.params.id, status: true },
        include: [{ model: Credential, as: 'credential', attributes: ['id', 'front_host_url', 'back_host_url'] }]
    });
    if (!college) {
        return next(new ErrorHandler('COLLEGE NOT FOUND!', 404));
    };

    resp.status(200).json({ success: true, college });
});


// export const editCollege = TryCatch(async (req, resp, next) => {
//     const { admin_email, name, contact, email, type, university, address, city, state,
//         country, pin_code, establish_yr, web, principal_name, principal_contact,
//         principal_email, facebook, twitter, instagram, linkedin, youtube } = req.body;
//     const logo = req.file?.path;

//     const user = await User.findOne({ where: { email: admin_email, status: true, role: 'admin' }, attributes: ['id', 'college_id', 'role'] });
//     const college = await College.findOne({ where: { id: user?.college_id, status: true } });
//     if (!college) {
//         return next(new ErrorHandler('COLLEGE NOT FOUND!', 404));
//     };

//     await college.update({
//         name, contact, email, type, university, address, city, state, country, pin_code,
//         establish_yr, web, principal_name, principal_contact, principal_email, facebook,
//         twitter, instagram, linkedin, youtube, logo: logo ? logo : college?.logo,
//     });
//     resp.status(200).json({ success: true, message: 'COLLEGE PROFILE UPDATED SUCCESSFULLY!' });
// });


export const activeCollege = TryCatch(async (req, resp, next) => {
    const college = await College.findOne({ where: { id: req.params.id, is_active: false, status: true } });
    if (!college) {
        return next(new ErrorHandler('COLLEGE NOT FOUND!', 404));
    };

    await college.update({ is_active: true });
    resp.status(200).json({ success: true, message: 'COLLEGE ACTIVATED SUCCESSFULLY!' });
});


export const deactiveCollege = TryCatch(async (req, resp, next) => {
    const college = await College.findOne({ where: { id: req.params.id, is_active: true, status: true } });
    if (!college) {
        return next(new ErrorHandler('COLLEGE NOT FOUND!', 404));
    };

    await college.update({ is_active: false });
    resp.status(200).json({ success: true, message: 'COLLEGE DEACTIVATED SUCCESSFULLY!' });
});


export const getCollegeOptions = TryCatch(async (req, resp, next) => {
    const [college_opts] = await Promise.all([getCollegeOpts()]);

    resp.status(200).json({ success: true, college_opts });
});


export const getUniversityOptions = TryCatch(async (req, resp, next) => {
    const [university_opts] = await Promise.all([getUniversityOpts()]);

    resp.status(200).json({ success: true, university_opts });
});