import { Sequelize } from 'sequelize';

import Student from '../models/student.js';
import TryCatch from '../utils/trycatch.js';


export const coursesOpt = TryCatch(async (req, resp, next) => {
    const data = await Student.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('course')), 'course']], raw: true,
    });

    const courses = data?.filter(item => item?.course !== null && item?.course !== '')
        .map(item => ({
            label: item?.course?.toUpperCase(),
            value: item?.course
        }));

    resp.status(200).json({ success: true, courses });
});


export const branchesOpt = TryCatch(async (req, resp, next) => {
    const data = await Student.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('branch')), 'branch']], raw: true,
    });

    const branches = data?.filter(item => item?.branch !== null && item?.branch !== '')
        .map(item => ({
            label: item?.branch?.toUpperCase(),
            value: item?.branch
        }));

    resp.status(200).json({ success: true, branches });
});


export const edYearOpt = TryCatch(async (req, resp, next) => {
    const data = await Student.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('current_yr')), 'current_yr']], raw: true,
    });

    const years = data?.filter(item => item?.current_yr !== null && item?.current_yr !== '')
        .map(item => ({
            label: item?.current_yr?.toUpperCase(),
            value: item?.current_yr
        }));

    resp.status(200).json({ success: true, years });
});


export const tenStreamOpt = TryCatch(async (req, resp, next) => {
    const data = await Student.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('ten_stream')), 'ten_stream']], raw: true,
    });

    const streams = data?.filter(item => item?.ten_stream !== null && item?.ten_stream !== '')
        .map(item => ({
            label: item?.ten_stream?.toUpperCase(),
            value: item?.ten_stream
        }));

    resp.status(200).json({ success: true, streams });
});


export const twelveStreamOpt = TryCatch(async (req, resp, next) => {
    const data = await Student.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('twelve_stream')), 'twelve_stream']], raw: true,
    });

    const streams = data?.filter(item => item?.twelve_stream !== null && item?.twelve_stream !== '')
        .map(item => ({
            label: item?.twelve_stream?.toUpperCase(),
            value: item?.twelve_stream
        }));

    resp.status(200).json({ success: true, streams });
});


export const tenBoardOpt = TryCatch(async (req, resp, next) => {
    const data = await Student.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('ten_board')), 'ten_board']], raw: true,
    });

    const boards = data?.filter(item => item?.ten_board !== null && item?.ten_board !== '')
        .map(item => ({
            label: item?.ten_board?.toUpperCase(),
            value: item?.ten_board
        }));

    resp.status(200).json({ success: true, boards });
});


export const twelveBoardOpt = TryCatch(async (req, resp, next) => {
    const data = await Student.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('twelve_board')), 'twelve_board']], raw: true,
    });

    const boards = data?.filter(item => item?.twelve_board !== null && item?.twelve_board !== '')
        .map(item => ({
            label: item?.twelve_board?.toUpperCase(),
            value: item?.twelve_board
        }));

    resp.status(200).json({ success: true, boards });
});


export const diplomaOpt = TryCatch(async (req, resp, next) => {
    const data = await Student.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('diploma')), 'diploma']], raw: true,
    });

    const diplomas = data?.filter(item => item?.diploma !== null && item?.diploma !== '')
        .map(item => ({
            label: item?.diploma?.toUpperCase(),
            value: item?.diploma
        }));

    resp.status(200).json({ success: true, diplomas });
});


export const diplomaStreamOpt = TryCatch(async (req, resp, next) => {
    const data = await Student.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('diploma_stream')), 'diploma_stream']], raw: true,
    });

    const streams = data?.filter(item => item?.diploma_stream !== null && item?.diploma_stream !== '')
        .map(item => ({
            label: item?.diploma_stream?.toUpperCase(),
            value: item?.diploma_stream
        }));

    resp.status(200).json({ success: true, streams });
});


export const getCoursesBranches = TryCatch(async (req, resp, next) => {
    const courses = await Student.findAll({
        attributes: [[Student.sequelize.fn('DISTINCT', Student.sequelize.col('course')), 'course']], raw: true,
    });

    const branches = await Student.findAll({
        attributes: [[Student.sequelize.fn('DISTINCT', Student.sequelize.col('branch')), 'branch']], raw: true,
    });

    resp.status(200)
        .json({
            success: true,
            courses: courses?.map(item => item?.course?.toUpperCase()),
            branches: branches?.map(item => item?.branch?.toUpperCase())
        });
});