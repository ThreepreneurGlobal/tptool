import fs from 'fs';
import { Op } from 'sequelize';

import Experience from '../../../models/experience.js';
import Student from '../../../models/student.js';
import User from '../../../models/user.js';
import TryCatch, { ErrorHandler } from '../../../utils/trycatch.js';
import { uploadFile } from '../../../utils/upload.js';


// CREATE STUDENT EXPERIENCE RECORD
export const addExperience = TryCatch(async (req, resp, next) => {
    const { description, start_date, end_date, position,
        org_name, location, work_type, category } = req.body;
    const certificate = req.file?.path;

    const student = await Student.findOne({ where: { user_id: req.user.id, status: true }, attributes: ['id', 'user_id'] });
    const exist = await Experience.findOne({
        where: {
            [Op.and]: [{ org_name }, { position }, { category },
            { user_id: req.user.id }, { student_id: student?.id }, { status: true }],
        }
    });
    if (exist) {
        return next(new ErrorHandler('EXPERIENCE ALREADY EXISTS!', 400));
    };

    await Experience.create({
        description, start_date, end_date, position, org_name, location, work_type, category,
        certificate: certificate ? certificate : null, student_id: student?.id, user_id: req.user.id,
    });
    resp.status(201).json({ success: true, message: 'EXPERIENCE CREATED!' });
});


// SINGLE STUDENT EXPERIENCE RECORD
export const experienceById = TryCatch(async (req, resp, next) => {
    const experience = await Experience.findOne({ where: { id: req.params.id, status: true } });
    if (!experience) {
        return next(new ErrorHandler('EXPERIENCE NOT FOUND!', 404));
    };

    resp.status(200).json({ success: true, experience });
});


// UPDATE STUDENT EXPERIENCE RECORD
export const editExperience = TryCatch(async (req, resp, next) => {
    const { description, start_date, end_date, position,
        org_name, location, work_type, category, certificate_txt } = req.body;
    const certificate_file = req.file?.path;

    const student = await Student.findOne({ where: { user_id: req.user.id, status: true }, attributes: ['id', 'user_id'] });
    const experience = await Experience.findOne({ where: { id: req.params.id, user_id: req.user.id, student_id: student.id, status: true } });
    if (!experience) {
        return next(new ErrorHandler('EXPERIENCE NOT FOUND!', 404));
    };

    // if (experience.certificate && certificate) {
    //     fs.rm(experience.certificate, () => console.log('OLD FILE DELETED!'));
    // };
    const certificate = await uploadFile(experience?.certificate, certificate_file, certificate_txt);

    await experience.update({
        description, start_date, end_date, position, org_name, location, work_type, category, certificate,
    });
    resp.status(201).json({ success: true, message: 'EXPERIENCE UPDATED!' });
});



//Experience to Student Association
Student.hasMany(Experience, { foreignKey: 'student_id', as: 'experiences' });
Experience.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

//Experience to User Association
User.hasMany(Experience, { foreignKey: 'user_id', as: 'experiences' });
Experience.belongsTo(User, { foreignKey: 'user_id', as: 'user' });