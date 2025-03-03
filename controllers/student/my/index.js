import { Op } from 'sequelize';
import Certificate from '../../../models/certificate.js';
import Project from '../../../models/project.js';
import Skill from '../../../models/skill.js';
import Student from '../../../models/student.js';
import User from '../../../models/user.js';
import UserSkill from '../../../models/user_skill.js';
import TryCatch, { ErrorHandler } from '../../../utils/trycatch.js';



export const myStudentProfile = TryCatch(async (req, resp, next) => {
    const student = await Student.findOne({
        where: { user_id: req.user.id, status: true }, attributes: { exclude: ['user_id', 'status'] },
        include: [
            {
                model: Skill, through: { model: UserSkill, attributes: ['id', 'rating'] },
                as: 'skills', required: false, attributes: ['id', 'title'], where: { status: true },
            },
            {
                model: Certificate, foreignKey: 'student_id', as: 'certificates', required: false,
                attributes: ['id', 'title', 'url'], where: { status: true },
            },
            {
                model: Project, foreignKey: 'student_id', as: 'projects', required: false,
                attributes: ['id', 'title', 'url', 'project_status', 'prev_img'], where: { status: true },
            },
        ]
    });

    resp.status(200).json({ success: true, student });
});


export const registerStudent = TryCatch(async (req, resp, next) => {
    const {
        name, mobile, email, id_prf, dob, course, branch, batch, current_yr, enroll, ten_yr, gender,
        ten_board, ten_stream, ten_per, twelve_yr, twelve_board, twelve_stream, twelve_per,
        degree_name, degree_university, degree_branch, degree_yr, degree_per, diploma, abc_id,
        diploma_yr, diploma_branch, diploma_per, ed_gap, gap_desc, disability, experience,
    } = req.body;

    const existed = await User.findOne({ where: { [Op.or]: [{ email }, { mobile }], status: true } });
    if (existed) {
        return next(new ErrorHandler('ALREADY REGISTERED!', 400));
    };

    if (name?.length <= 5) {
        return next(new ErrorHandler(`STUDENT NAME TOO SHORT! MIN 6 CHAR REQUIRED!`, 500));
    };

    // Genrate Password
    let password;
    const trimName = name?.replace(" ", "");
    const nameWord = trimName?.split(' ');
    if (nameWord?.length > 0) {
        const first = nameWord[0];
        password = (first.substring(0, 6)).charAt(0).toUpperCase() + first.substring(1, 6).toLowerCase() + "@123#";
    };

    const user = await User.create({ name, mobile, email, password, id_prf, gender, status: false });
    if (!user) {
        return next(new ErrorHandler('REGISTRATION FAILED!', 400));
    };

    const student = await Student.create({
        dob, course, branch, batch, current_yr, enroll, ten_yr, ten_board, ten_stream, ten_per,
        twelve_yr, twelve_board, twelve_stream, twelve_per, diploma, diploma_yr, diploma_branch,
        diploma_per, degree_name, degree_university, degree_branch, degree_yr, degree_per,
        ed_gap, gap_desc, disability, experience, abc_id, user_id: user.id, status: false,
    });
    if (!student) {
        return next(new ErrorHandler('REGISTRATION FAILED!', 400));
    };

    resp.status(201).json({ success: true, message: 'REGISTRATION SUCCESSFULLY!' });
});