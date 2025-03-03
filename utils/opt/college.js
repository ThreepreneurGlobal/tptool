import moment from 'moment';
import { Sequelize } from "sequelize";
import Student from "../../models/student.js";


export const getCollegeCoursesOpts = async () => {
    const data = await Student.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('course')), 'course']], raw: true,
    });

    const courses = data?.filter(item => item?.course !== null && item?.course !== '')
        .map(item => ({
            label: item?.course?.toUpperCase(),
            value: item?.course
        }));
    return courses;
};


export const getCollegeBranchesOpts = async () => {
    const data = await Student.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('branch')), 'branch']], raw: true,
    });

    const branches = data?.filter(item => item?.branch !== null && item?.branch !== '')
        .map(item => ({
            label: item?.branch?.toUpperCase(),
            value: item?.branch
        }));

    return branches;
};


export const getCollegeEdYearOpts = async () => {
    const data = await Student.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('current_yr')), 'current_yr']], raw: true,
    });

    const years = data?.filter(item => item?.current_yr !== null && item?.current_yr !== '')
        .map(item => ({
            label: item?.current_yr?.toUpperCase(),
            value: item?.current_yr
        }));

    return years;
};


export const getCollegeTwelveStreamOpts = async () => {
    const data = await Student.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('twelve_stream')), 'twelve_stream']], raw: true,
    });

    const twelve_streams = data?.filter(item => item?.twelve_stream !== null && item?.twelve_stream !== '')
        .map(item => ({
            label: item?.twelve_stream?.toUpperCase(),
            value: item?.twelve_stream
        }));

    return twelve_streams;
};


export const getCollegeTenBoardOpts = async () => {
    const data = await Student.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('ten_board')), 'ten_board']], raw: true,
    });

    const ten_boards = data?.filter(item => item?.ten_board !== null && item?.ten_board !== '')
        .map(item => ({
            label: item?.ten_board?.toUpperCase(),
            value: item?.ten_board
        }));

    return ten_boards;
};


export const getCollegeTwelveBoardOpts = async () => {
    const data = await Student.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('twelve_board')), 'twelve_board']], raw: true,
    });

    const twelve_boards = data?.filter(item => item?.twelve_board !== null && item?.twelve_board !== '')
        .map(item => ({
            label: item?.twelve_board?.toUpperCase(),
            value: item?.twelve_board
        }));

    return twelve_boards;
};


export const getCollegeDiplomaOpts = async () => {
    const data = await Student.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('diploma')), 'diploma']], raw: true,
    });

    const diplomas = data?.filter(item => item?.diploma !== null && item?.diploma !== '')
        .map(item => ({
            label: item?.diploma?.toUpperCase(),
            value: item?.diploma
        }));

    return diplomas;
};


export const getCollegeDiplomaStreamOpts = async () => {
    const data = await Student.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('diploma_branch')), 'diploma_branch']], raw: true,
    });

    const diploam_branches = data?.filter(item => item?.diploma_branch !== null && item?.diploma_branch !== '')
        .map(item => ({
            label: item?.diploma_branch?.toUpperCase(),
            value: item?.diploma_branch
        }));

    return diploam_branches;
};


export const getCollegeDegreeOpts = async () => {
    const data = await Student.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('degree_name')), 'degree_name']], raw: true,
    });

    const degree_names = data?.filter(item => item?.degree_name !== null && item?.degree_name !== '')
        .map(item => ({
            label: item?.degree_name?.toUpperCase(),
            value: item?.degree_name
        }));

    return degree_names;
};


export const getCollegeDegreeStreamOpts = async () => {
    const data = await Student.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('degree_branch')), 'degree_branch']], raw: true,
    });

    const degree_branches = data?.filter(item => item?.degree_branch !== null && item?.degree_branch !== '')
        .map(item => ({
            label: item?.degree_branch?.toUpperCase(),
            value: item?.degree_branch
        }));

    return degree_branches;
};


export const getCollegeDegreeUniversityOpts = async () => {
    const data = await Student.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('degree_university')), 'degree_university']], raw: true,
    });

    const degree_universities = data?.filter(item => item?.degree_university !== null && item?.degree_university !== '')
        .map(item => ({
            label: item?.degree_university?.toUpperCase(),
            value: item?.degree_university
        }));

    return degree_universities;
};


export const getCollegeBatchOpts = async () => {
    const data = await Student.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('batch')), 'batch']], raw: true,
    });

    const batches = data?.filter(item => item?.batch !== null && item?.batch !== '')
        .map(item => moment(item.batch).year());

    return batches;
};
