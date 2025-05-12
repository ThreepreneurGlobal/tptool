import fs from 'fs';

import College from '../../models/college.js';
import User from '../../models/user.js';
import TryCatch, { ErrorHandler } from '../../utils/trycatch.js';


export const getAdmins = TryCatch(async (req, resp, next) => {
    const users = await User.findAll({
        where: { role: 'admin', status: true, is_active: true }, attributes: ['id', 'name', 'mobile', 'email', 'avatar'],
        include: [{ model: College, foreignKey: 'college_id', as: 'college', required: true, attributes: ['id', 'name', 'logo', 'type', 'city'] }]
    });

    resp.status(200).json({ success: true, users });
});


export const getDeactiveAdmins = TryCatch(async (req, resp, next) => {
    const users = await User.findAll({
        where: { role: 'admin', status: true, is_active: false }, attributes: ['id', 'name', 'mobile', 'email', 'avatar'],
        include: [{ model: College, foreignKey: 'college_id', as: 'college', required: true, attributes: ['id', 'name', 'logo', 'type', 'city'] }]
    });

    resp.status(200).json({ success: true, users });
});


export const getAdminById = TryCatch(async (req, resp, next) => {
    const user = await User.findOne({
        where: { id: req.params.id, status: true },
        attributes: { exclude: ['password', 'college_id', 'status'] },
        include: [{
            model: College, foreignKey: 'college_id', as: 'college', required: true,
            attributes: ['id', 'name', 'reg_no', 'contact', 'email', 'web', 'logo', 'type', 'university', 'city', 'state']
        }],
    });
    if (!user) {
        return next(new ErrorHandler('USER NOT FOUND!', 404));
    };

    resp.status(200).json({ success: true, user });
});


export const editAdmin = TryCatch(async (req, resp, next) => {
    const { name, mobile, email, address, city, state, country, pin_code,
        designation, facebook, twitter, instagram, linkedin } = req.body;
    const avatar = req.file?.path;

    const user = await User.findOne({ where: { email, status: true }, attributes: { exclude: ['password'] } });
    if (!user) {
        return next(new ErrorHandler('USER NOT FOUND!', 404));
    };

    if (user?.avatar && avatar) {
        fs.rm(user?.avatar, () => console.log('OLD AVATAR FILE DELETED!'));
    };

    await user.update({
        name, mobile, address, city, state, country, pin_code, designation, facebook,
        twitter, instagram, linkedin, avatar: avatar ? avatar : user?.avatar,
    });
    resp.status(200).json({ success: true, message: 'ADMIN UPDATED!' });
});


export const deactiveAdmin = TryCatch(async (req, resp, next) => {
    const user = await User.findOne({
        where: { id: req.params.id, status: true, is_active: true },
        attributes: { exclude: ['password', 'college_id', 'status'] },
        include: [{
            model: College, foreignKey: 'college_id', as: 'college', required: true,
            attributes: ['id', 'name', 'reg_no', 'contact', 'email', 'web', 'logo', 'type', 'university', 'city', 'state']
        }],
    });
    if (!user) {
        return next(new ErrorHandler('USER NOT FOUND!', 404));
    };

    await user.update({ is_active: false });
    resp.status(200).json({ success: true, message: 'ADMIN DEACTIVATED SUCCESSFULLY!' });
});


export const activeAdmin = TryCatch(async (req, resp, next) => {
    const user = await User.findOne({
        where: { id: req.params.id, status: true, is_active: false },
        attributes: { exclude: ['password', 'college_id', 'status'] },
        include: [{
            model: College, foreignKey: 'college_id', as: 'college', required: true,
            attributes: ['id', 'name', 'reg_no', 'contact', 'email', 'web', 'logo', 'type', 'university', 'city', 'state']
        }],
    });
    if (!user) {
        return next(new ErrorHandler('USER NOT FOUND!', 404));
    };

    await user.update({ is_active: true });
    resp.status(200).json({ success: true, message: 'ADMIN ACTIVATED SUCCESSFULLY!' });
});



// USER-COLLEGE RELATION
College.hasMany(User, { foreignKey: 'college_id', as: 'users' });
User.belongsTo(College, { foreignKey: 'college_id', as: 'college' });
