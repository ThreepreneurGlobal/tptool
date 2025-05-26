import bcryptjs from 'bcryptjs';
import { Op } from 'sequelize';

import Achievement from '../../models/achievement.js';
import Application from '../../models/application.js';
import Certificate from '../../models/certificate.js';
import Experience from '../../models/experience.js';
import PlacePosition from '../../models/place_position.js';
import Project from '../../models/project.js';
// import Skill from '../../models/skill.js';
import Student from '../../models/student.js';
import User from '../../models/user.js';
import UserSkill from '../../models/user_skill.js';
import { getCollegeBatchOpts, getCollegeBranchesOpts, getCollegeCoursesOpts, getCollegeEdYearOpts } from '../../utils/opt/college.js';
import TryCatch, { ErrorHandler } from '../../utils/trycatch.js';

// ALL STUDENTS RECORDS
export const getStudents = TryCatch(async (req, resp, next) => {
    const { course, branch, batch, current_yr, gender } = req.query;
    const whereClause = { status: true, is_active: true };
    const whereUserClause = { status: true, is_active: true, role: 'user' };

    if (course) {
        const courseArr = Array.isArray(course) ? course : [course];
        whereClause.course = { [Op.in]: courseArr };
    };
    if (branch) {
        const branchArr = Array.isArray(branch) ? branch : [branch];
        whereClause.branch = { [Op.in]: branchArr };
    };
    if (batch) {
        const year = parseInt(batch, 10);
        if (!isNaN(year)) {
            whereClause.batch = {
                [Op.gte]: new Date(year, 0, 1, 0, 0, 0, 0),
                [Op.lt]: new Date(year + 1, 0, 1, 0, 0, 0, 0),
            };
        };
    };
    if (current_yr) {
        whereClause.current_yr = current_yr;
    };
    if (gender) {
        whereUserClause.gender = gender;
    };

    const users = await User.findAll({
        where: whereUserClause, attributes: ['id', 'name', 'mobile', 'email', 'gender', 'id_prf'],
        include: [
            {
                model: Student, foreignKey: 'user_id', as: 'student', required: true, where: whereClause,
                attributes: ['id', 'dob', 'course', 'branch', 'batch', 'ten_per', 'twelve_per', 'experience', 'current_yr']
            }
        ],
    });
    resp.status(200).json({ success: true, users });
});


// CREATE STUDENT
export const createStudent = TryCatch(async (req, resp, next) => {
    const {
        name, mobile, email, id_prf, dob, course, branch, batch, current_yr, enroll, ten_yr, gender,
        ten_board, ten_stream, ten_per, twelve_yr, twelve_board, twelve_stream, twelve_per,
        degree_name, degree_university, degree_branch, degree_yr, degree_per, diploma, abc_id,
        diploma_yr, diploma_branch, diploma_per, ed_gap, gap_desc, disability, experience,
    } = req.body;

    const existed = await User.findOne({ where: { [Op.or]: [{ email }, { mobile }] } });
    if (existed) {
        return next(new ErrorHandler(`${existed.name} ALREADY EXISTS!`, 500));
    };

    // if (name?.length <= 5) {
    //     return next(new ErrorHandler(`STUDENT NAME TOO SHORT! MIN 6 CHAR REQUIRED!`, 500));
    // };

    // Genrate Password
    let password;
    let student;
    const trimName = name?.replace(" ", "");
    const nameWord = trimName?.split(' ');
    if (nameWord?.length > 0) {
        const first = nameWord[0];
        const namePart = first?.charAt(0).toUpperCase() + first?.slice(1).toLowerCase();
        const fixedPart = '@123#';
        const digitNeeded = 10 - (namePart?.length + fixedPart?.length);
        let digit = '';
        
        if (digitNeeded > 0) {
            for (let i = 0; i < digitNeeded; i++) {
                digit += (4 + i).toString();
            };
        };

        password = namePart + "@123" + digit + '#';
    };

    const hash_pass = await bcryptjs.hash(password, 10);
    const user = await User.create({ name, mobile, email, password: hash_pass, id_prf, gender });
    if (!user) {
        return next(new ErrorHandler('REGISTRATION FAILED!', 500));
    };

    if (user) {
        student = await Student.create({
            dob, course, branch, batch, current_yr, enroll, ten_yr, ten_board, ten_stream, ten_per,
            twelve_yr, twelve_board, twelve_stream, twelve_per, diploma, diploma_yr, diploma_branch,
            diploma_per, degree_name, degree_university, degree_branch, degree_yr, degree_per,
            ed_gap, gap_desc, disability, experience, abc_id, user_id: user.id,
        });
    }
    if (!student) {
        return next(new ErrorHandler('REGISTRATION FAILED!', 500));
    };
    resp.status(201).json({ success: true, message: `${user?.name?.toUpperCase()} ADDED...` });
});


// SINGLE STUDENT RECORD WITH RELATED ALL FEATURES
export const studentById = TryCatch(async (req, resp, next) => {
    const user = await User.findOne({
        where: { id: req.params.id, status: true, is_active: true, role: 'user', designation: 'student' },
        attributes: { exclude: ['password', 'role', 'status', 'updated_at', 'created_at'] },
        include: [
            {
                model: Student, foreignKey: 'user_id', as: 'student', where: { status: true, is_active: true },
                // include: [{
                //     model: Skill, through: { model: UserSkill, attributes: ['id', 'rating'] },
                //     as: 'skills', required: false, attributes: ['id', 'title'], where: { status: true },
                // }],
                attributes: { exclude: ['user_id', 'status', 'updated_at', 'created_at'] }, required: true,
            },
            {
                model: Certificate, foreignKey: 'user_id', as: 'certificates', required: false,
                attributes: ['id', 'title', 'url'], where: { status: true },
            },
            {
                model: Project, foreignKey: 'user_id', as: 'projects', required: false,
                attributes: ['id', 'title', 'url', 'project_status', 'prev_img'], where: { status: true },
            },
            {
                model: Achievement, foreignKey: 'user_id', as: 'achievements', required: false,
                attributes: ['id', 'title', 'description', 'date', 'org_name'], where: { status: true },
            },
            {
                model: Experience, foreignKey: 'user_id', as: 'experiences', required: false,
                attributes: ['id', 'start_date', 'end_date', 'position', 'org_name',
                    'location', 'work_type', 'category'], where: { status: true },
            },
        ],
    });

    if (!user) {
        return next(new ErrorHandler('STUDENT NOT FOUND!', 404));
    };

    const user_skill_data = await UserSkill.findAll({ where: { student_id: user?.student?.id, status: true }, attributes: ['id', 'rating', 'skill_id'] });
    const user_skill_ids = await user_skill_data.map(item => item?.skill_id);

    const skills = await Promise.all(user_skill_ids?.map(async (item) => {
        const skill_promise = await fetch(process.env.SUPER_SERVER + '/v1/master/skill/get/' + item);
        const { skill } = await skill_promise.json();
        const rate = user_skill_data?.filter(data => data.skill_id === item)[0];
        return { id: skill?.id, title: skill?.title, category: skill?.category, rating: rate?.rating };
    }));

    const applications = await Application.findAll({
        where: { user_id: user.id, status: true }, attributes: ['id', 'app_status', 'position_id']
    });

    const positionIds = applications?.map(app => app?.position_id);
    const placePositios = await PlacePosition.findAll({ where: { id: positionIds }, attributes: ['id', 'type'] });
    const positionTypeMap = placePositios?.reduce((acc, position) => {
        acc[position?.id] = position?.type?.toUpperCase();
        return acc;
    }, {});

    const countStatuses = (apps = []) => {
        return apps?.reduce((acc, app) => {
            acc[app?.app_status?.toUpperCase()] = (acc[app?.app_status] || 0) + 1;
            return acc;
        }, {});
    };

    const jobApps = applications?.filter(app => positionTypeMap[app?.position_id] === 'JOB');
    const internApps = applications?.filter(app => positionTypeMap[app?.position_id] === 'INTERNSHIP');

    const jobStatusCounts = countStatuses(jobApps);
    const internshipStatusCounts = countStatuses(internApps);

    const statistics = {
        job: {
            labels: Object.keys(jobStatusCounts),
            data: Object.values(jobStatusCounts),
        },
        internship: {
            labels: Object.keys(internshipStatusCounts),
            data: Object.values(internshipStatusCounts),
        },
    };
    const modified_user = { ...user.toJSON(), student: { ...user?.student?.toJSON(), skills } };
    resp.status(200).json({ success: true, user: modified_user, statistics });
});


// UPDATE STUDENT RECORD
export const editStudent = TryCatch(async (req, resp, next) => {
    const {
        name, mobile, email, id_prf, dob, course, branch, batch, current_yr, enroll, ten_yr, gender,
        ten_board, ten_stream, ten_per, twelve_yr, twelve_board, twelve_stream, twelve_per,
        degree_name, degree_university, degree_branch, degree_yr, degree_per, abc_id, diploma,
        diploma_yr, diploma_branch, diploma_per, ed_gap, gap_desc, disability, experience,
    } = req.body;

    const user = await User.findOne({ where: { id: req.params.id, status: true, role: 'user', designation: 'student', status: true, is_active: true, }, });
    if (!user) { return next(new ErrorHandler('STUDENT NOT FOUND!', 404)); };
    const student = await Student.findOne({ where: { user_id: user?.id, status: true, is_active: true, } });
    if (!student) { return next(new ErrorHandler('STUDENT NOT FOUND!', 404)); };

    const isUpdated = await user.update({ name, email, mobile, id_prf, gender });
    if (!isUpdated) {
        return next(new ErrorHandler('STUDENT NOT UPDATED!', 404));
    };
    await student.update({
        dob, course, branch, batch, current_yr, enroll, ten_yr, ten_board, ten_stream, ten_per,
        twelve_yr, twelve_board, twelve_stream, twelve_per, diploma, diploma_yr, diploma_branch,
        diploma_per, degree_name, degree_university, degree_branch, degree_yr, degree_per,
        ed_gap, gap_desc, disability, experience, abc_id,
    });

    resp.status(200).json({ success: true, message: `${user?.name?.toUpperCase()} UPDATED...` });
});


// OPTIONS FOR STUDENT FILETER
export const getFilterOpts = TryCatch(async (req, resp, next) => {
    const [courses, branches, years, batches] = await Promise.all([
        getCollegeCoursesOpts(), getCollegeBranchesOpts(), getCollegeEdYearOpts(), getCollegeBatchOpts()
    ]);

    const filter_opts = { courses, branches, years, batches };
    resp.status(200).json({ success: true, filter_opts });
});


// ALL ONBOARD STUDENTS RECORDS
export const getOnBoardStudents = TryCatch(async (req, resp, next) => {
    const users = await User.findAll({
        where: { status: true, is_active: false, },
        include: [{
            model: Student, foreignKey: 'user_id', as: 'student', required: true,
            where: { status: true, is_active: false, }
        }]
    });

    resp.status(200).json({ success: true, users });
});


// SINGLE ONBOARD STUDENT RECORD
export const getOnBoardStudentById = TryCatch(async (req, resp, next) => {
    const user = await User.findOne({
        include: [{
            model: Student, foreignKey: 'user_id', as: 'student', required: true,
            where: { status: true, is_active: false, user_id: req.params.id }
        }], where: { status: true, is_active: false, id: req.params.id },
    });
    if (!user) {
        return next(new ErrorHandler('STUDENT NOT FOUND!', 404));
    };

    resp.status(200).json({ success: true, user });
});


// UPDATE ONBOARD STUDENT
export const editOnboardStudent = TryCatch(async (req, resp, next) => {
    const { user_id, student_id, status } = req.body;
    const user = await User.findOne({ where: { status: true, is_active: false, id: user_id }, });
    const student = await Student.findOne({ where: { status: true, is_active: false, user_id, id: student_id } });
    if (!user || !student) {
        return next(new ErrorHandler('STUDENT NOT FOUND!', 404));
    };

    await user.update({ is_active: true, status: status === 'approve' ? true : false });
    await student.update({ is_active: true, status: status === 'approve' ? true : false });
    resp.status(200)
        .json({ success: true, message: status === 'approve' ? 'APPLICATION APPROVED SUCCESSFULLY!' : 'SORRY! APPLICATION REJECTED!' });
});


//User to Student Association
User.hasOne(Student, { foreignKey: "user_id", as: "student" });
Student.belongsTo(User, { foreignKey: "user_id", as: "user" });