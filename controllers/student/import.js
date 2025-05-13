import bcryptjs from 'bcryptjs';
import fs from 'fs';
import { Op } from 'sequelize';
import XLSX from 'xlsx';

import Student from '../../models/student.js';
import User from '../../models/user.js';
import { excelToDate } from '../../utils/dateFeature.js';
import { toLowerCaseFields } from '../../utils/strFeature.js';
import TryCatch from '../../utils/trycatch.js';


// IMPORT ALL STUDENT RECORDS USING EXCEL FILE
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
            'Birth Date': BirthDate, Gender, 'Tenth Passing': Tenth_Year, 'Tenth Board/University': Tenth_Board,
            'Tenth Score': Tenth_Score, 'Twelve Passing': Twelth_Year,
            'Twelve Board/University': Twelth_Board, 'Twelve Stream': Twelth_Stream, 'Twelve Score': Twelth_Score,
            'Degree Name': Degree_Name, 'Degree University': Degree_University, 'Degree Branch': Degree_Branch,
            'Degree Passing': Degree_Year, 'Degree Score': Degree_Score, 'Diploma Passing': Diploma_Year,
            'Diploma Name': Diploma_Name, 'Diploma Stream': Diploma_Stream, 'Diploma Score': Diploma_Score,
            Disability, 'Gap (Yrs)': Education_Gap, 'Gap Description': Gap_Reason,
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

        //Date Format
        const dob = excelToDate(BirthDate, errorMsgs, Name);
        const batch = excelToDate(Batch, errorMsgs, Name);
        const ten_yr = excelToDate(Tenth_Year, errorMsgs, Name);
        const twelve_yr = excelToDate(Twelth_Year, errorMsgs, Name);
        const diploma_yr = excelToDate(Diploma_Year, errorMsgs, Name);
        const degree_yr = excelToDate(Degree_Year, errorMsgs, Name);

        const existed = await User.findOne({
            where: { [Op.or]: [{ mobile: Contact }, { email: Mail_ID }] }
        });
        if (existed) {
            errorMsgs.push(`${existed.name} Already Exist!`);
            return;
        };

        const hash_pass = await bcryptjs.hash(password, 10);
        const user = await User.create({
            name: Name?.toLowerCase(), email: Mail_ID, password: hash_pass, mobile: Contact,
            gender: Gender?.toLowerCase(), id_prf: ID, status: true, is_active: true,
        });
        users.push(user);

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

    console.error(errorMsgs);
    fs.rm(req.file?.path, () => { console.log('XLSX FILE DELETED...') });
    resp.status(201).json({ success: true, message: `${users?.length} STUDENTS IMPORTED...` });
});