import ExcelJS from 'exceljs';
import { Op } from 'sequelize';

import Student from '../../models/student.js';
import User from '../../models/user.js';
import TryCatch, { ErrorHandler } from '../../utils/trycatch.js';


// GENERATE STUDENT UPLOADER EXCEL FILE TEMPLATE
export const generateTemplate = TryCatch(async (req, resp, next) => {
    const workbook = new ExcelJS.Workbook();
    const sheet_data = workbook.addWorksheet('data');
    const sheet_courses = workbook.addWorksheet('courses');
    const sheet_branches = workbook.addWorksheet('branches');

    // FETCH DATA FOR CREATE DROPDOWN
    const option_promise = await fetch(process.env.SUPER_SERVER + '/v1/master/course/create-opts?college_category=' + req.query.college_category);
    const { opts: { courses: course_array, branches: branch_array } } = await option_promise.json();

    // PREPARE DATA FOR COURSES AND BRANCHE SHEET
    sheet_courses.addRow(['COURSE NAME']);
    course_array?.forEach(course => {
        sheet_courses.addRow([course?.label]);
    });

    sheet_branches.addRow(['BRANCH NAME']);
    branch_array?.forEach(branch => {
        sheet_branches.addRow([branch?.label]);
    });

    sheet_data.addRow([
        'ID CARD NO.*', 'NAME*', 'MAIL ID*', 'CONTACT*', 'COURSE NAME*', 'BRANCH NAME*', 'ADMISSION DATE*',
        'STUDYING YEAR*', 'ENROLLMENT NO.*', 'BIRTH DATE*', 'GENDER*', 'TENTH PASSING DATE*',
        'TENTH PASSING BOARD/UNIVERSITY*', 'TENTH SCORE*', 'TWELVE PASSING DATE', 'TWELVE PASSING BOARD/UNIVERSITY',
        'TWELVE STREAM', 'TWELVE SCORE', 'DEGREE NAME', 'DEGREE PASSING UNIVERSITY', 'DEGREE BRANCH',
        'DEGREE PASSING DATE', 'DEGREE SCORE', 'DIPLOMA PASSING DATE', 'DIPLOMA NAME', 'DIPLOMA STREAM',
        'DIPLOMA SCORE', 'DISABILITY*', 'EDUCATION GAP (YRS)', 'EDUCATION GAP DESCRIPTION',
    ]);


    for (let row = 2; row <= 200; row++) {
        sheet_data.getCell(`E${row}`).dataValidation = {
            type: 'list',
            allowBlank: false,
            formulae: [`courses!$A$2:$A$${sheet_courses.rowCount}`],
            showErrorMessage: true,
            errorTitle: 'INVALID COURSE!',
            error: 'PLEASE SELECT A VALID COURSE FROM DROPDOWN!',
        };
        sheet_data.getCell(`F${row}`).dataValidation = {
            type: 'list',
            allowBlank: false,
            formulae: [`branches!$A$2:$A$${sheet_branches.rowCount}`],
            showErrorMessage: true,
            errorTitle: 'INVALID BRANCH!',
            error: 'PLEASE SELECT A VALID BRANCH FROM DROPDOWN!',
        };
    };

    sheet_courses.protect(process.env.EXCEL_PASS);
    sheet_branches.protect(process.env.EXCEL_PASS);

    const buffer = await workbook.xlsx.writeBuffer();
    resp.setHeader('Content-Disposition', 'attachment; filename=students.xlsx');
    resp.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    resp.send(buffer);
    resp.status(200).end();
});


// EXPORT ALL STUDENT RECORDS IN EXCEL FILE
export const exportStudent = TryCatch(async (req, resp, next) => {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length <= 0) {
        return next(new ErrorHandler('STUDENTS NOT FOUND!', 404));
    };

    // FETCH DATA
    const users = await User.findAll({
        where: { id: { [Op.in]: ids }, status: true, is_active: true, role: 'user' },
        attributes: ['id', 'name', 'email', 'mobile', 'gender', 'address', 'city', 'pin_code', 'id_prf'],
        include: [
            {
                model: Student, foreignKey: 'user_id', as: 'student', required: true, where: { is_active: true, status: true },
                attributes: { exclude: ['interested_in', 'langs', 'user_id', 'status', 'created_at', 'updated_at'] }
            }
        ]
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('data');

    // WORKSHEET LABELS
    worksheet.columns = [
        { header: 'ID CARD NO.', key: 'id_prf', width: 20 },
        { header: 'NAME', key: 'name', width: 30 },
        { header: 'MAIL ID', key: 'email', width: 30 },
        { header: 'CONTACT', key: 'mobile', width: 15 },
        { header: 'COURSE NAME', key: 'course', width: 25 },
        { header: 'BRANCH NAME', key: 'branch', width: 25 },
        { header: 'BATCH YEAR', key: 'batch', width: 15 },
        { header: 'STUDYING YEAR', key: 'current_yr', width: 15 },
        { header: 'ENROLLMENT NO.', key: 'enroll', width: 20 },
        { header: 'BIRTH DATE', key: 'dob', width: 15 },
        { header: 'GENDER', key: 'gender', width: 10 },
        { header: 'TENTH PASSING YEAR', key: 'ten_yr', width: 15 },
        { header: 'TENTH PASSING BOARD/UNIVERSITY', key: 'ten_board', width: 30 },
        { header: 'TENTH SCORE', key: 'ten_per', width: 10 },
        { header: 'TWELVE PASSING YEAR', key: 'twelve_yr', width: 15 },
        { header: 'TWELVE PASSING BOARD/UNIVERSITY', key: 'twelve_board', width: 30 },
        { header: 'TWELVE STREAM', key: 'twelve_stream', width: 20 },
        { header: 'TWELVE SCORE', key: 'twelve_per', width: 10 },
        { header: 'DIPLOMA PASSING YEAR', key: 'diploma_yr', width: 15 },
        { header: 'DIPLOMA NAME', key: 'diploma_name', width: 30 },
        { header: 'DIPLOMA STREAM', key: 'diploma_stream', width: 20 },
        { header: 'DIPLOMA SCORE', key: 'diploma_per', width: 10 },
        { header: 'DEGREE NAME', key: 'degree_name', width: 30 },
        { header: 'DEGREE PASSING UNIVERSITY', key: 'degree_university', width: 30 },
        { header: 'DEGREE BRANCH', key: 'degree_branch', width: 20 },
        { header: 'DEGREE PASSING YEAR', key: 'degree_yr', width: 15 },
        { header: 'DEGREE SCORE', key: 'degree_per', width: 10 },
        { header: 'DISABILITY', key: 'disability', width: 10 },
        { header: 'Experience (Yrs)', key: 'experience', width: 10 },
        { header: 'ADDRESS', key: 'address', width: 30 },
        { header: 'CITY', key: 'city', width: 20 },
        { header: 'PIN CODE', key: 'pin_code', width: 10 },
        { header: 'EDUCATION GAP (YRS)', key: 'ed_gap', width: 15 },
        { header: 'EDUCATION GAP DESCRIPTION', key: 'gap_desc', width: 30 },
    ];

    // WORKSHEET DATA
    users?.forEach((item) => {
        worksheet.addRow({
            id_prf: item?.id_prf?.toUpperCase(),
            name: item?.name?.toUpperCase(),
            email: item?.email,
            mobile: '+' + item?.mobile,
            course: item?.student?.course?.toUpperCase(),
            branch: item?.student?.branch?.toUpperCase(),
            batch: new Date(item?.student?.batch).getFullYear(),
            current_yr: item?.student?.current_yr?.toUpperCase(),
            enroll: item?.student?.enroll,
            dob: new Date(item?.student?.dob).toLocaleDateString(),
            gender: item?.gender?.toUpperCase(),
            ten_yr: new Date(item?.student?.ten_yr).getFullYear(),
            ten_board: item?.student?.ten_board?.toUpperCase(),
            ten_per: item?.student?.ten_per,
            twelve_yr: new Date(item?.student?.twelve_yr).getFullYear(),
            twelve_board: item?.student?.twelve_board?.toUpperCase(),
            twelve_stream: item?.student?.twelve_stream?.toUpperCase(),
            twelve_per: item?.student?.twelve_per,
            diploma_yr: new Date(item?.student?.diploma_yr).getFullYear(),
            diploma_name: item?.student?.diploma_name?.toUpperCase(),
            diploma_stream: item?.student?.diploma_stream?.toUpperCase(),
            diploma_per: item?.student?.diploma_per,
            degree_name: item?.student?.degree_name?.toUpperCase(),
            degree_university: item?.student?.degree_university?.toUpperCase(),
            degree_branch: item?.student?.degree_branch?.toUpperCase(),
            degree_yr: new Date(item?.student?.degree_yr).getFullYear(),
            degree_per: item?.student?.degree_per,
            disability: item?.student?.disability === false ? 'NO' : 'YES',
            experience: item?.student?.experience,
            address: item?.address?.toUpperCase(),
            city: item?.city?.toUpperCase(),
            pin_code: item?.pin_code,
            ed_gap: item?.student?.ed_gap,
            gap_desc: item?.student?.gap_desc,
        });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    resp.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    resp.setHeader('Content-Disposition', 'attachment; filename=students.xlsx');
    // resp.status(200).end(buffer, 'binary');
    resp.status(200).end(buffer);
});
