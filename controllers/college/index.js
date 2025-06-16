import fs from 'fs';

// import College from '../../models/super/college.js';
// import SuperUser from '../../models/super/user.js';
import TryCatch, { ErrorHandler } from '../../utils/trycatch.js';


// MY COLLEGE
export const myCollege = TryCatch(async (req, resp, next) => {
    // const super_user = await SuperUser.findOne({
    //     where: { email: req.user.email, status: true, is_active: true },
    //     attributes: ['id', 'name', 'email', 'role', 'college_id']
    // });
    // if (!super_user) {
    //     return next(new ErrorHandler('USER NOT FOUND!', 404));
    // };

    // const college = await College.findOne({ where: { id: super_user?.college_id, status: true } });
    // if (!college) {
    //     return next(new ErrorHandler('COLLEGE NOT FOUND!', 404));
    // };

    resp.status(200).json({ success: true, college });
});



// UPDATE COLLEGE
export const editMyCollege = TryCatch(async (req, resp, next) => {
    // const {
    //     name, contact, web, description, address, city, state, country, pin_code, establish_yr, principal_name,
    //     principal_email, principal_contact, facebook, twitter, instagram, linkedin, youtube,
    // } = req.body;
    // const logo = req.file?.path;

    // const super_user = await SuperUser.findOne({
    //     where: { email: req.user.email, status: true, is_active: true },
    //     attributes: ['id', 'name', 'email', 'role', 'college_id']
    // });
    // if (!super_user) {
    //     return next(new ErrorHandler('USER NOT FOUND!', 404));
    // };

    // const college = await College.findOne({ where: { id: super_user?.college_id, status: true } });
    // if (!college) {
    //     return next(new ErrorHandler('COLLEGE NOT FOUND!', 404));
    // };

    // if (college?.logo && logo) {
    //     fs.rm(college?.logo, () => console.log('OLD COLLEGE LOGO DELETED!'));
    // };

    // await college.update({
    //     name, contact, web, address, city, state, country, pin_code, establish_yr, principal_name, principal_email,
    //     principal_contact, description, facebook, twitter, instagram, linkedin, youtube, logo: logo ? logo : college?.logo,
    // });
    resp.status(200).json({ success: true, message: 'COLLEGE PROFILE UPDATED!' });
});