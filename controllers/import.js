import fs from 'fs';
import moment from 'moment';
import { Op } from 'sequelize';
import XLSX from 'xlsx';

import Student from '../models/student.js';
import User from '../models/user.js';
import { excelToJSDate } from '../utils/dateFeature.js';
import { toLowerCaseFields } from '../utils/strFeature.js';
import TryCatch from '../utils/trycatch.js';


export const importStudent = TryCatch(async (req, resp, next) => {
    let users = [];
    let errorMsgs = [];
    const file = req.file && req.file.path;
    const workbook = XLSX.readFile(file);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    await Promise.all(data?.map(async (item) => {
        const {
            'ID NO.': ID, Name, 'Mail ID': Mail_ID, Contact, Course, Branch, Batch, Studying, Enrollment,
            'Birth Date': BirthDate, Gender, 'Tenth Passing': Tenth_Passing, 'Tenth Board/University': Tenth_Board,
            'Tenth Stream': Tenth_Stream, 'Tenth Score': Tenth_Score, 'Twelve Passing': Twelth_Passing,
            'Twelve Board/University': Twelth_Board, 'Twelve Stream': Twelth_Stream, 'Twelve Score': Twelth_Score,
            'Diploma Passing': Diploma_Passing, 'Diploma Name': Diploma_Name, 'Diploma Stream': Diploma_Stream,
            'Diploma Score': Diploma_Score, Disability, 'Gap (Yrs)': Education_Gap, 'Gap Description': Gap_Reason,
        } = toLowerCaseFields(item);

        // Genrate Password
        if (Name?.length <= 5) {
            errorMsgs.push(`Student Name too Short! min 6 Char Required for ${Name}`);
            return;
        };
        const trimName = Name.replace(" ", "");
        const nameWord = trimName.split(' ');
        let password;
        if (nameWord?.length > 0) {
            const first = nameWord[0];
            password = (first.substring(0, 6)).charAt(0).toUpperCase() + first.substring(1, 6).toLowerCase() + "@123#";
        };

        //DOB Format
        let birthDate = null;
        if (BirthDate) {
            let parseDate;
            if (typeof BirthDate === "number") {
                parseDate = excelToJSDate(BirthDate);
            } else {
                parseDate = moment(BirthDate, ["MM-DD-YYYY", "DD-MM-YYYY", "YYYY-MM-DD", "MM/DD/YYYY", "DD/MM/YYYY", "YYYY/MM/DD"]);
            };
            if (moment(parseDate).isValid()) {
                birthDate = moment(parseDate).format('YYYY-MM-DD');
            } else {
                errorMsgs.push(`${BirthDate} Birth Date Invalid! Birth Date Valid for ${Name}`);
                return;
            };
        };
        //Batch Date Format
        let batchDate = null;
        if (Batch) {
            let parseDate;
            if (typeof Batch === "number") {
                parseDate = excelToJSDate(Batch);
            } else {
                parseDate = moment(Batch, ["MM-DD-YYYY", "DD-MM-YYYY", "YYYY-MM-DD", "MM/DD/YYYY", "DD/MM/YYYY", "YYYY/MM/DD"]);
            };
            if (moment(parseDate).isValid()) {
                batchDate = moment(parseDate).format('YYYY-MM-DD');
            } else {
                errorMsgs.push(`${Batch} Batch Date Invalid! Batch Date Valid for ${Name}`);
                return;
            };
        };
        //Tenth Passing Date Format
        let tenDate = null;
        if (Tenth_Passing) {
            let parseDate;
            if (typeof Tenth_Passing === "number") {
                parseDate = excelToJSDate(Tenth_Passing);
            } else {
                parseDate = moment(Tenth_Passing, ["MM-DD-YYYY", "DD-MM-YYYY", "YYYY-MM-DD", "MM/DD/YYYY", "DD/MM/YYYY", "YYYY/MM/DD"]);
            };
            if (moment(parseDate).isValid()) {
                tenDate = moment(parseDate).format('YYYY-MM-DD');
            } else {
                errorMsgs.push(`${Tenth_Passing} Passing Date Invalid! Passing Date Valid for ${Name}`);
                return;
            };
        };
        //Twelve Passing Date Format
        let twelveDate = null;
        if (Twelth_Passing) {
            let parseDate;
            if (typeof Twelth_Passing === "number") {
                parseDate = excelToJSDate(Twelth_Passing);
            } else {
                parseDate = moment(Twelth_Passing, ["MM-DD-YYYY", "DD-MM-YYYY", "YYYY-MM-DD", "MM/DD/YYYY", "DD/MM/YYYY", "YYYY/MM/DD"]);
            };
            if (moment(parseDate).isValid()) {
                twelveDate = moment(parseDate).format('YYYY-MM-DD');
            } else {
                errorMsgs.push(`${Twelth_Passing} Passing Date Invalid! Passing Date Valid for ${Name}`);
                return;
            };
        };
        //Twelve Passing Date Format
        let diplomaDate = null;
        if (Diploma_Passing) {
            let parseDate;
            if (typeof Diploma_Passing === "number") {
                parseDate = excelToJSDate(Diploma_Passing);
            } else {
                parseDate = moment(Diploma_Passing, ["MM-DD-YYYY", "DD-MM-YYYY", "YYYY-MM-DD", "MM/DD/YYYY", "DD/MM/YYYY", "YYYY/MM/DD"]);
            };
            if (moment(parseDate).isValid()) {
                diplomaDate = moment(parseDate).format('YYYY-MM-DD');
            } else {
                errorMsgs.push(`${Diploma_Passing} Passing Date Invalid! Passing Date Valid for ${Name}`);
                return;
            };
        };

        const existed = await User.findOne({
            where: { [Op.or]: [{ name: Name?.toLowerCase() }, { email: Mail_ID }] }
        });
        if (existed) {
            errorMsgs.push(`${existed.name} Already Exist!`);
            return;
        };

        const user = await User.create({
            name: Name?.toLowerCase(), email: Mail_ID, password, mobile: Contact,
            gender: Gender?.toLowerCase(), id_prf: ID
        });
        users.push(user);

        if (user) {
            await Student.create({
                dob: birthDate, course: Course, branch: Branch, batch: batchDate, current_yr: Studying,
                enroll: Enrollment, ten_yr: tenDate, ten_board: Tenth_Board, ten_stream: Tenth_Stream,
                ten_per: Tenth_Score, twelve_yr: twelveDate, twelve_board: Twelth_Board, user_id: user?.id,
                twelve_stream: Twelth_Stream, twelve_per: Twelth_Score, diploma: Diploma_Name,
                diploma_stream: Diploma_Stream, diploma_yr: diplomaDate, diploma_per: Diploma_Score,
                ed_gap: Education_Gap, gap_desc: Gap_Reason, disability: Disability === 'yes' ? true : false,
            });
        };
    }));

    console.log(errorMsgs);
    fs.rm(req.file?.path, () => { console.log('XLSX FILE DELETED...') });
    resp.status(201).json({ success: true, message: `${users?.length} Students Imported...` });
});