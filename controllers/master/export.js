import ExcelJS from 'exceljs';
import { Sequelize } from 'sequelize';
import College from '../../models/college.js';
import TryCatch from '../../utils/trycatch.js';


export const courseTemplate = TryCatch(async (req, resp, next) => {
    const workbook = new ExcelJS.Workbook();
    const sheet_data = workbook.addWorksheet('data');
    const sheet_type = workbook.addWorksheet('types');
    const sheet_category = workbook.addWorksheet('categories');

    const data = await College.findAll({
        where: { status: true }, raw: true,
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('college_category')), 'college_category']],
    });

    const course_type_opts = ['diploma', 'ug', 'pg', 'phd'];
    const college_category_opts = data?.filter(item => item?.college_category !== null || item?.college_category !== '')
        .map(item => item?.college_category?.toUpperCase());

    sheet_type.addRow(['COURSE TYPE']);
    sheet_category.addRow(['COLLEGE CATEGORY']);

    course_type_opts.forEach(opt => { sheet_type.addRow([opt?.toUpperCase()]) });
    college_category_opts.forEach(opt => { sheet_category.addRow([opt]) });
    sheet_data.addRow([
        'COURSE NAME*', 'COURSE CODE', 'COURSE TYPE', 'COURSE DESCRIPTION', 'BRANCH NAME*', 'BRANCH CODE', 'BRANCH DESCRIPTION', 'COLLEGE CATEGORY*'
    ]);

    for (let row = 2; row <= 200; row++) {
        sheet_data.getCell('C' + row).dataValidation = {
            type: 'list',
            allowBlank: false,
            formulae: [`types!$A$2:$A$${sheet_type.rowCount}`],
            showErrorMessage: true,
            errorTitle: 'INVALID COURSE TYPE!',
            error: 'PLEASE SELECT A VALID COURSE TYPE FORM DROPDOWN!',
        };

        sheet_data.getCell('H' + row).dataValidation = {
            type: 'list',
            allowBlank: false,
            formulae: [`categories!$A$2:$A$${sheet_category.rowCount}`],
            showErrorMessage: true,
            errorTitle: 'INVALID COLLEGE CATEGORY!',
            error: 'PLEASE SELECT A VALID COLLEGE CATEGORY FORM DROPDOWN!',
        };
    };

    sheet_type.protect(process.env.EXCEL_PASS);
    sheet_category.protect(process.env.EXCEL_PASS);

    const buffer = await workbook.xlsx.writeBuffer();
    resp.setHeader('Content-Disposition', 'attachment; filename=courses_branches.xlsx');
    resp.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    resp.send(buffer);
    resp.status(200).end();
});



export const skillTemplate = TryCatch(async (req, resp, next) => {
    const workbook = new ExcelJS.Workbook();
    const sheet_data = workbook.addWorksheet('data');

    sheet_data.addRow([
        'SKILL NAME*', 'SKILL SHORT NAME', 'SKILL DESCRIPTION', 'SKILL CATEGORY*', 'SKILL SUB CATEGORY'
    ]);

    const buffer = await workbook.xlsx.writeBuffer();
    resp.setHeader('Content-Disposition', 'attachment; filename=courses_branches.xlsx');
    resp.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    resp.send(buffer);
    resp.status(200).end();
});

