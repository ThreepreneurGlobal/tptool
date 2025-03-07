import { Op } from 'sequelize';

import UserSkill from '../../../models/user_skill.js';
import TryCatch, { ErrorHandler } from '../../../utils/trycatch.js';
import Student from '../../../models/student.js';

// UserSkill.sync({ alter: true, force: true });

export const addSkill = TryCatch(async (req, resp, next) => {
    const { skill_id, rating, description } = req.body;
    const student = await Student.findOne({ where: { user_id: req.user.id, status: true } });
    if (!student) {
        return next(new ErrorHandler('STUDENT NOT FOUND!', 404));
    };

    const existed = await UserSkill.findOne({ where: { skill_id, student_id: student?.id, status: true } });
    if (existed) {
        return next(new ErrorHandler('SKILL ALREADY EXISTS!', 400));
    };

    await UserSkill.create({ skill_id, rating, description, student_id: student?.id });
    resp.status(201).json({ success: true, message: 'SKILL ADDED!' });
});


export const editSkill = TryCatch(async (req, resp, next) => {
    const { skill_id, rating, description } = req.body;
    const student = await Student.findOne({ where: { user_id: req.user.id, status: true } });
    const skill = await UserSkill.findOne({ where: { id: req.params.id, student_id: student?.id, status: true } });
    if (!skill) {
        return next(new ErrorHandler('SKILL NOT FOUND!', 404));
    };

    await skill.update({ skill_id, rating, description });
    resp.status(200).json({ success: true, message: 'SKILL UPDATED!' });
});


export const deleteSkill = TryCatch(async (req, resp, next) => {
    const student = await Student.findOne({ where: { user_id: req.user.id, status: true } });
    if (!student) {
        return next(new ErrorHandler('STUDENT NOT FOUND!', 404));
    };

    const skill = await UserSkill.findOne({ where: { id: req.params.id, student_id: student?.id, status: true, is_active: true, } });
    if (!skill) {
        return next(new ErrorHandler('SKILL NOT FOUND!', 404));
    };

    await skill.update({ status: false });
    resp.status(200).json({ success: true, message: 'SKILL DELETED!' });
});