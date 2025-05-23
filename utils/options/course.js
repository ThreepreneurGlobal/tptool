import { Sequelize, Op } from 'sequelize';
import Course from '../../models/course.js';


export const getCourseOpts = async (college_categories) => {
    const apiObj = {};
    const where = { status: true };
    const unique_courses = new Set();

    if (college_categories) {
        const category_array = college_categories?.split(',').map(category => category.trim());
        where.college_category = { [Op.in]: category_array };
    };

    const data = await Course.findAll({
        where, group: ['course_name', 'course_type'], attributes: ['id', 'course_type', 'course_name']
    });
    if (data.length <= 0) return [];

    data.forEach((item) => {
        if (!unique_courses.has(item?.course_name)) {
            unique_courses.add(item?.course_name);

            if (!apiObj[item?.type]) {
                apiObj[item?.course_type] = { label: item?.course_type?.toUpperCase(), options: [] };
            };

            apiObj[item?.course_type]?.options?.push({
                lable: item?.course_name?.toUpperCase(),
                value: item?.course_name?.toLowerCase(),
            });
        };
    });

    const courses = Object.values(apiObj);
    return courses;
};


export const getBranchOpts = async (college_categories) => {
    const apiObj = {};
    const where = { status: true };
    const unique_branches = new Set();

    if (college_categories) {
        const category_array = college_categories?.split(',').map(item => item.trim());
        where.college_category = { [Op.in]: category_array };
    };

    const data = await Course.findAll({
        where, group: ['branch_name', 'course_name'], attributes: ['id', 'course_name', 'branch_name']
    });
    if (data.length <= 0) return [];

    data.forEach((item) => {
        if (!unique_branches.has(item?.branch_name)) {
            unique_branches.add(item?.branch_name);

            if (!apiObj[item?.type]) {
                apiObj[item?.course_name] = { label: item?.course_name?.toUpperCase(), options: [] };
            };

            apiObj[item?.course_name]?.options?.push({
                lable: item?.branch_name?.toUpperCase(),
                value: item?.branch_name?.toLowerCase(),
            });
        }
    });

    const branches = Object.values(apiObj);
    return branches;
};


export const getCategoriesOpts = async () => {
    const data = await Course.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('college_category')), 'college_category']], raw: true,
    });

    const categories = data?.filter(item => item?.college_category !== null && item?.college_category !== '')
        .map(item => ({
            label: item?.college_category?.toUpperCase(),
            value: item?.college_category
        }));

    return categories;
};


export const getCreateCourseOpts = async (college_categories) => {
    const where = { status: true };
    if (college_categories) {
        const category_array = college_categories?.split(',').map(category => category.trim());
        where.college_category = { [Op.in]: category_array };
    };

    const data = await Course.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('course_name')), 'course_name']], raw: true, where,
    });

    const courses = data?.filter(item => item?.course_name !== null && item?.course_name !== '')
        .map(item => ({
            label: item?.course_name?.toUpperCase(),
            value: item?.course_name
        }));

    return courses;
};


export const getCreateBranchOpts = async (college_categories) => {
    const where = { status: true };
    if (college_categories) {
        const category_array = college_categories?.split(',').map(item => item.trim());
        where.college_category = { [Op.in]: category_array };
    };

    const data = await Course.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('branch_name')), 'branch_name']], raw: true, where,
    });

    const branches = data?.filter(item => item?.branch_name !== null && item?.branch_name !== '')
        .map(item => ({
            label: item?.branch_name?.toUpperCase(),
            value: item?.branch_name
        }));

    return branches;
};
