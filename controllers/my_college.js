import Student from '../models/student.js';
import {
    getCollegeBranchesOpts, getCollegeCoursesOpts, getCollegeDegreeOpts, getCollegeDegreeStreamOpts, getCollegeDegreeUniversityOpts, getCollegeDiplomaOpts,
    getCollegeDiplomaStreamOpts, getCollegeEdYearOpts, getCollegeTenBoardOpts, getCollegeTwelveBoardOpts,
    getCollegeTwelveStreamOpts
} from '../utils/opt/college.js';
import TryCatch from '../utils/trycatch.js';


// ALL COURSES AND BRANCHES RECORDS IN COLLEGE
export const getCoursesBranches = TryCatch(async (req, resp, next) => {
    const courses = await Student.findAll({
        attributes: [[Student.sequelize.fn('DISTINCT', Student.sequelize.col('course')), 'course']], raw: true, where: { status: true, is_active: true }
    });

    const branches = await Student.findAll({
        attributes: [[Student.sequelize.fn('DISTINCT', Student.sequelize.col('branch')), 'branch']], raw: true, where: { status: true, is_active: true }
    });

    resp.status(200)
        .json({
            success: true,
            courses: courses?.map(item => item?.course?.toUpperCase()),
            branches: branches?.map(item => item?.branch?.toUpperCase())
        });
});


// OPTIONS FOR STUDENT CREATE
export const getCollegeOpts = TryCatch(async (req, resp, next) => {
    const promise = await fetch(process.env.SUPER_SERVER + '/v1/master/course/create-opts?college_category=' + req.query.college_category);
    const { opts: { courses, branches } } = await promise.json();

    // const courses = await getCollegeCoursesOpts();
    // const branches = await getCollegeBranchesOpts();
    const education_years = await getCollegeEdYearOpts();
    const twelve_streams = await getCollegeTwelveStreamOpts();
    const ten_boards = await getCollegeTenBoardOpts();
    const twelve_boards = await getCollegeTwelveBoardOpts();
    const diplomas = await getCollegeDiplomaOpts();
    const diploam_branches = await getCollegeDiplomaStreamOpts();
    const degree_names = await getCollegeDegreeOpts();
    const degree_branches = await getCollegeDegreeStreamOpts();
    const degree_universities = await getCollegeDegreeUniversityOpts();

    const college_opts = {
        courses, branches, education_years, twelve_streams, ten_boards, twelve_boards,
        diplomas, diploam_branches, degree_names, degree_branches, degree_universities,
    };
    resp.status(200).json({ success: true, college_opts });
});