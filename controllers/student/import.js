import bcryptjs from 'bcryptjs';
import ExcelJS from 'exceljs';
import fs from 'fs';
import { Op } from 'sequelize';

import Student from '../../models/student.js';
import User from '../../models/user.js';
import { excelToDate } from '../../utils/dateFeature.js';
import { toLowerCaseFields } from '../../utils/strFeature.js';
import TryCatch from '../../utils/trycatch.js';


// IMPORT ALL STUDENT RECORDS USING EXCEL FILE
export const importStudent = TryCatch(async (req, resp, next) => {
    let users = [];
    let errorMessages = [];
    const file = req.file?.path;

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(file);
    const worksheet = workbook.worksheets[0];
    const data = worksheet.getSheetValues();

    // SKIP THE HEADER ROW AND MAP THE DATA.
    const headers = data[1];
    const rows = data.slice(2);

    await Promise.all(rows?.map(async (row) => {
        if (row.every(cell => cell === undefined || cell === null)) {
            return;
        };

        const item = {};
        headers.forEach((header, idx) => {
            item[header] = row[idx];        // EXCELJS USES --BASED INDEXING
        });

        // ALL STRING DATA CONVERTED TO LOWERCASE
        const {
            'ID CARD NO.*': IDCard, 'NAME*': Name, 'MAIL ID*': Mail_ID, 'CONTACT*': Contact, 'COURSE NAME*': Course,
            'BRANCH NAME*': Branch, 'ADMISSION DATE*': Batch, 'STUDYING YEAR*': Studying, 'ENROLLMENT NO.*': Enrollment,
            'BIRTH DATE*': BirthDate, 'GENDER*': Gender, 'TENTH PASSING DATE*': Tenth_Year, 'TENTH PASSING BOARD/UNIVERSITY*': Tenth_Board,
            'TENTH SCORE*': Tenth_Score, 'TWELVE PASSING DATE': Twelth_Year, 'TWELVE PASSING BOARD/UNIVERSITY': Twelth_Board,
            'TWELVE STREAM': Twelth_Stream, 'TWELVE SCORE': Twelth_Score, 'DEGREE NAME': Degree_Name,
            'DEGREE PASSING UNIVERSITY': Degree_University, 'DEGREE BRANCH': Degree_Branch, 'DEGREE PASSING DATE': Degree_Year,
            'DEGREE SCORE': Degree_Score, 'DIPLOMA PASSING DATE': Diploma_Year, 'DIPLOMA NAME': Diploma_Name,
            'DIPLOMA STREAM': Diploma_Stream, 'DIPLOMA SCORE': Diploma_Score, 'DISABILITY*': Disability,
            'EDUCATION GAP (YRS)': Education_Gap, 'EDUCATION GAP DESCRIPTION': Gap_Reason,
        } = toLowerCaseFields(item);

        const email = Mail_ID?.text || Mail_ID;
        // GENERATE PASSWORD
        if (Name?.length <= 5) {
            errorMessages.push(`STUDENT NAME TOO SHORT! MIN 6 CHAR REQUIRED FOR ${Name}`);
            return;
        };
        const trimName = Name?.replace(" ", "");
        const nameWord = trimName?.split(' ');
        let password;
        if (nameWord?.length > 0) {
            const first = nameWord[0];
            password = (first.substring(0, 6)).charAt(0).toUpperCase() + first.substring(1, 6).toLowerCase() + "@123#";
        }

        // DATE FORMAT
        const dob = excelToDate(BirthDate, errorMessages, Name);
        const batch = excelToDate(Batch, errorMessages, Name);
        const ten_yr = excelToDate(Tenth_Year, errorMessages, Name);
        const twelve_yr = excelToDate(Twelth_Year, errorMessages, Name);
        const diploma_yr = excelToDate(Diploma_Year, errorMessages, Name);
        const degree_yr = excelToDate(Degree_Year, errorMessages, Name);

        // CHECK USER EXIST OR NOT
        console.log(item);
        const existed = await User.findOne({ where: { [Op.or]: [{ mobile: Contact }, { name: Name }, { email }] } });
        if (existed) {
            errorMessages.push(`${existed.name} ALREADY EXIST!`);
            return;
        };

        // PASSWORD HASHING AND CREATE USER
        const hash_pass = await bcryptjs.hash(password, 10);
        const user = await User.create({
            name: Name?.toLowerCase(), email, password: hash_pass, mobile: Contact,
            gender: Gender?.toLowerCase(), id_prf: IDCard, status: true, is_active: true,
        });
        users.push(user);

        // CREATE STUDENT RECORD
        if (user) {
            await Student.create({
                dob, course: Course, branch: Branch, batch, current_yr: Studying,
                enroll: Enrollment, ten_yr, ten_board: Tenth_Board,
                ten_per: Tenth_Score, twelve_yr, twelve_board: Twelth_Board, user_id: user?.id,
                twelve_stream: Twelth_Stream, twelve_per: Twelth_Score, diploma: Diploma_Name,
                diploma_stream: Diploma_Stream, diploma_yr, diploma_per: Diploma_Score,
                degree_name: Degree_Name, degree_university: Degree_University, degree_branch: Degree_Branch,
                degree_yr, degree_per: Degree_Score, ed_gap: Education_Gap, gap_desc: Gap_Reason,
                disability: Disability === 'yes' ? true : false, status: true, is_active: true,
            });
        };
    }));

    errorMessages.map(item => console.error(item));
    fs.rm(file, () => console.log('XLSX FILE DELETED!'));
    resp.status(201).json({ success: true, message: users.length + ' STUDENTS IMPORTED...' });
});


