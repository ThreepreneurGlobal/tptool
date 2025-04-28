import fs from 'fs';
import { Op } from "sequelize";
import Project from "../../../models/project.js";
import Student from "../../../models/student.js";
import User from "../../../models/user.js";
import TryCatch, { ErrorHandler } from "../../../utils/trycatch.js";



export const addProject = TryCatch(async (req, resp, next) => {
    const { title, description, url, project_status, rating, git_hub, start_date, end_date } = req.body;
    const prev_img = req?.file?.path;

    const student = await Student.findOne({ where: { user_id: req.user.id, status: true, }, attributes: ['id', 'user_id'] });
    if (!student) {
        return next(new ErrorHandler('INVALID STUDENT!', 403));
    };
    const exists = await Project.findOne({
        where: { [Op.and]: [{ title }, { user_id: req.user.id }, { student_id: student?.id }] },
    });
    if (exists) {
        return next(new ErrorHandler('PROJECT ALREADY EXISTS!', 400));
    };

    await Project.create({
        title, description, url, project_status, rating, user_id: req.user.id, student_id: student?.id,
        git_hub, start_date, end_date, prev_img: prev_img ? prev_img : null,
    });

    resp.status(201).json({ success: true, message: 'PROJECT ADDED!' });
});


export const editProject = TryCatch(async (req, resp, next) => {
    const { title, description, url, project_status, rating, git_hub, start_date, end_date } = req.body;
    const prev_img = req?.files[0]?.path;

    const student = await Student.findOne({ where: { user_id: req.user.id, status: true }, attributes: ['id', 'user_id'] });
    if (!student) {
        return next(new ErrorHandler('INVALID STUDENT!', 403));
    };
    const project = await Project.findOne({
        where: { id: req.params.id, status: true, user_id: req.user.id, student_id: student.id },
    });
    if (!project) {
        return next(new ErrorHandler('PROJECT NOT FOUND!', 404));
    };

    if (project?.prev_img && prev_img) {
        fs.rm(project?.prev_img, () => console.log('OLD FILE DELETED!'));
    };

    await project.update({
        title, description, url, project_status, rating, git_hub, start_date, end_date,
        prev_img: prev_img ? prev_img : project?.prev_img,
    });
    resp.status(201).json({ success: true, message: 'PROJECT UPDATED!' });
});




//Project to Student Association
Student.hasMany(Project, { foreignKey: 'student_id', as: 'projects' });
Project.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

//Project to User Association
User.hasMany(Project, { foreignKey: 'user_id', as: 'projects' });
Project.belongsTo(User, { foreignKey: 'user_id', as: 'user' });