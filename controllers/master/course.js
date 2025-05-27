import { Op } from 'sequelize';
import Course from '../../models/course.js';
import { getBranchOpts, getCategoriesOpts, getCourseOpts, getCreateBranchOpts, getCreateCourseOpts } from '../../utils/options/course.js';
import TryCatch, { ErrorHandler } from '../../utils/trycatch.js';
import { getCategoryOpts } from '../../utils/options/college.js';


// MASTER/COURSE
export const getCourses = TryCatch(async (req, resp, next) => {
    const { course_type, college_category } = req.query;

    const where = { status: true };
    if (course_type) {
        where.course_type = course_type;
    };
    if (college_category) {
        where.college_category = college_category;
    };

    const courses = await Course.findAll({ where });
    resp.status(200).json({ success: true, courses });
});


export const getCourseById = TryCatch(async (req, resp, next) => {
    const course = await Course.findOne({
        where: { id: req.params.id, status: true },
    });
    if (!course) {
        return next(new ErrorHandler('COURSE NOT FOUND!', 404));
    };

    resp.status(200).json({ success: true, course });
});


export const createCourse = TryCatch(async (req, resp, next) => {
    const {
        course_name, course_code, course_type, course_description, branch_name,
        branch_code, branch_description, college_category,
    } = req.body;

    const exists = await Course.findOne({ where: { [Op.and]: [{ branch_code }, { branch_name }, { course_name }, { course_code }] } });
    if (exists) {
        return next(new ErrorHandler('COURSE ALREADY EXISTS!', 400));
    };

    const course = await Course.create({
        course_name, course_code, course_type, course_description, branch_name,
        branch_code, branch_description, college_category,
    });
    if (!course) {
        return next(new ErrorHandler('COURSE NOT CREATED!', 400));
    };

    resp.status(201).json({ success: true, message: 'COURSE CREATED!' });
});


export const editCourse = TryCatch(async (req, resp, next) => {
    const {
        course_name, course_code, course_type, course_description, branch_name,
        branch_code, branch_description, college_category
    } = req.body;
    const course = await Course.findOne({
        where: { id: req.params.id, status: true },
    });
    if (!course) {
        return next(new ErrorHandler('COURSE NOT FOUND!', 404));
    };

    await course.update({
        course_name, course_code, course_type, course_description, branch_name,
        branch_code, branch_description, college_category,
    });
    resp.status(200).json({ success: true, message: 'COURSE UPDATED!' });
});


// COMMON CONTROLLER
export const getCourseBranchOpts = TryCatch(async (req, resp, next) => {
    const { college_category } = req.query;

    const [courses, branches] = await Promise.all([
        getCourseOpts(college_category), getBranchOpts(college_category),
    ]);

    resp.status(200).json({ success: true, opts: { courses, branches } });
});


export const getCreateCourseBranchOpts = TryCatch(async (req, resp, next) => {
    const { college_category } = req.query;
    const [categories, courses, branches] = await Promise.all([
        getCategoryOpts(), getCreateCourseOpts(college_category), getCreateBranchOpts(college_category)
    ]);

    resp.status(200).json({ success: true, opts: { categories, courses, branches } });
});


// const uploadCourses = async () => {
//     for (const item of data) {
//         await Course.create({
//             course_name: item.course_name, course_code: item.course_code, branch_name: item.branch_name,
//             branch_code: item.branch_code, course_type: item.course_type, college_category: item.college_category,
//         });
//     };
// };
// uploadCourses();
