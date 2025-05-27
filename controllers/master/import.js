import ExcelJS from 'exceljs';
import { Op } from 'sequelize';
import { rm } from 'fs';
import Course from '../../models/course.js';
import TryCatch, { ErrorHandler } from '../../utils/trycatch.js';
import { toLowerCaseFields } from '../../utils/strFeature.js';
import Skill from '../../models/skill.js';


export const importCourse = TryCatch(async (req, resp, next) => {
    const courses = [];
    const errorMessages = [];
    const file = req.file?.path;

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(file);
    const worksheet = workbook.worksheets[0];
    const data = worksheet.getSheetValues();

    // SKIP THE HEADER ROW AND MAP THE DATA.
    const headers = data[1];
    const rows = data.slice(2);

    await Promise.all(rows?.map(async (row) => {
        const item = {};
        headers.forEach((header, idx) => {
            item[header] = row[idx];        // EXCELS USES 1-BASED INDEXING
        });

        // ALL STRING DATA CONVERTED TO LOWERCASE
        const {
            'COURSE NAME*': CourseName, 'COURSE CODE': CourseCode, 'COURSE TYPE': CourseType, 'COURSE DESCRIPTION': CourseDescription,
            'BRANCH NAME*': BranchName, 'BRANCH CODE': BranchCode, 'BRANCH DESCRIPTION': BranchDescription, 'COLLEGE CATEGORY*': CollegeCategory,
        } = toLowerCaseFields(item);

        // CHECK EXIST OR NOT
        const existed = await Course.findOne({ where: { status: true, [Op.and]: [{ course_name: CourseName }, { branch_name: BranchName }] } });
        if (existed) {
            // return next(new ErrorHandler(CourseName + '/' + BranchName + ' ALREADY EXISTS!', 400));
            errorMessages.push(CourseName?.toUpperCase() + '/' + BranchName?.toUpperCase() + ' ALREADY EXISTS!');
            return;
        };

        const course = await Course.create({
            course_name: CourseName, course_code: CourseCode, course_type: CourseType, course_description: CourseDescription,
            branch_name: BranchName, branch_code: BranchCode, branch_description: BranchDescription, college_category: CollegeCategory,
        });
        if (!course) {
            errorMessages.push(CourseName + '/' + BranchName + ' NOT CREATED!');
        };

        courses.push(course);
    }));

    errorMessages.map(item => console.error(item));
    rm(file, () => console.log('XLSX FILE DELETED!'));
    resp.status(201).json({ success: true, message: courses.length + ' COURSE IMPORTED...' });
});


export const importSkill = TryCatch(async (req, resp, next) => {
    const skills = [];
    const errorMessages = [];
    const file = req.file?.path;

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(file);
    const worksheet = workbook.worksheets[0];
    const data = worksheet.getSheetValues();

    // SKIP THE HEADER ROW AND MAP THE DATA.
    const headers = data[1];
    const rows = data.slice(2);

    await Promise.all(rows?.map(async (row) => {
        const item = {};
        headers.forEach((header, idx) => {
            item[header] = row[idx];        // EXCELS USES --BASED INDEXING
        });

        // ALL STRING DATA CONVERTED TO LOWERCASE
        const {
            'SKILL NAME*': Title, 'SKILL SHORT NAME': ShortName, 'SKILL DESCRIPTION': SkillDescription,
            'SKILL CATEGORY*': Category, 'SKILL SUB CATEGORY': SubCategory,
        } = toLowerCaseFields(item);

        // CHECK EXIST OR NOT
        const existed = await Skill.findOne({ where: { status: true, [Op.or]: [{ title: Title }, { short_name: ShortName }] } });
        if (existed) {
            errorMessages.push(Title?.toUpperCase() + ' ALREADY EXISTS!');
            return;
            // return next(new ErrorHandler(Title + ' ALREADY EXISTS!', 400));
        };

        const skill = await Skill.create({
            title: Title, short_name: ShortName, description: SkillDescription, category: Category, sub_category: SubCategory,
        });
        if (!skill) {
            errorMessages.push(Title + ' NOT CREATED!');
        };

        skills.push(skill);
    }));

    errorMessages.map(item => console.error(item));
    rm(file, () => console.log('XLSX FILE DELETED!'));
    resp.status(201).json({ success: true, message: skills.length + ' SKILLS IMPORTED...' });
});
