import fs from 'fs';
import { Op } from 'sequelize';

import Achievement from '../../../models/achievement.js';
import Student from '../../../models/student.js';
import User from '../../../models/user.js';
import TryCatch, { ErrorHandler } from '../../../utils/trycatch.js';


export const addAchievement = TryCatch(async (req, resp, next) => {
    const { title, description, date, org_name } = req.body;
    const certificate = req.file?.path;

    const student = await Student.findOne({ where: { user_id: req.user.id, status: true }, attributes: ['id', 'user_id'] });
    const exist = await Achievement.findOne({
        where: { [Op.and]: [{ title }, { org_name }, { user_id: req.user.id }, { student_id: student?.id }, { status: true }], }
    });
    if (exist) {
        return next(new ErrorHandler('ACHIEVEMENT RECORD ALREADY EXISTS!', 400));
    };

    await Achievement.create({
        title, description, date, org_name, student_id: student?.id,
        certificate: certificate ? certificate : null, user_id: req.user.id
    });
    resp.status(201).json({ success: true, message: 'ACHIEVEMENT RECORD CREATED!' });
});


export const editAchievement = TryCatch(async (req, resp, next) => {
    const { title, description, date, org_name } = req.body;
    const certificate = req.file?.path;

    const student = await Student.findOne({ where: { user_id: req.user.id, status: true }, attributes: ['id', 'user_id'] });
    const achievement = await Achievement.findOne({
        where: { status: true, id: req.params.id, user_id: req.user.id, student_id: student?.id, }
    });
    if (!achievement) {
        return next(new ErrorHandler('ACHIEVEMENT RECORD NOT FOUND!', 404));
    };

    if (achievement.certificate && certificate) {
        fs.rm(achievement.certificate, () => console.log('OLD FILE DELETED!'));
    };

    await achievement.update({ 
        title, description, date, org_name, certificate: certificate ? certificate : achievement.certificate,
    });
    resp.status(201).json({ success: true, message: 'ACHIEVEMENT RECORD UPDATED!' });
});


export const getAchievementById = TryCatch(async (req, resp, next) => {
    const achievement = await Achievement.findOne({ where: { status: true, id: req.params.id } });
    if (!achievement) {
        return next(new ErrorHandler('ACHIEVEMENT RECORD NOT FOUND!', 404));
    };

    resp.status(200).json({ success: true, achievement });
});


export const deleteAchievement = TryCatch(async (req, resp, next) => { });



//Achievement to Student Association
Student.hasMany(Achievement, { foreignKey: 'student_id', as: 'achievements' });
Achievement.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

//Achievement to User Association
User.hasMany(Achievement, { foreignKey: 'user_id', as: 'achievements' });
Achievement.belongsTo(User, { foreignKey: 'user_id', as: 'user' });