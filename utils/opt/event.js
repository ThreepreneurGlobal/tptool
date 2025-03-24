import { Sequelize } from "sequelize";
import Event from "../../models/event.js";
import EventCompany from "../../models/event_company.js";


export const getPositionOpts = async () => {
    const data = await EventCompany.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('positions')), 'positions']], raw: true,
    });

    const positions = data?.flatMap(item => {
        const parsedPositions = JSON.parse(item?.positions);
        return parsedPositions?.map(position => ({ label: position?.toUpperCase(), value: position, }));
    });

    return positions;
};


export const getCourseOpts = async () => {
    const data = await EventCompany.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('courses')), 'courses']], raw: true,
    });

    const courses = data?.flatMap(item => {
        const parsedCourses = JSON.parse(item?.courses);
        return parsedCourses?.map(course => ({ label: course?.toUpperCase(), value: course, }));
    });
    return courses;
};


export const getBranchOpts = async () => {
    const data = await EventCompany.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('branches')), 'branches']], raw: true,
    });

    const branches = data?.flatMap(item => {
        const parsedBranches = JSON.parse(item?.branches);
        return parsedBranches?.map(branch => ({ label: branch?.toUpperCase(), value: branch, }));
    });

    return branches;
};