import { Op } from 'sequelize';
import XLSX from 'xlsx';

import Student from '../../models/student.js';
import User from '../../models/user.js';
import TryCatch, { ErrorHandler } from '../../utils/trycatch.js';


// GENERATE STUDENT UPLOADER EXCEL FILE TEMPLATE
export const generateTemplate = TryCatch(async (req, resp, next) => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([[
        'ID NO.', 'Name', 'Mail ID', 'Contact', 'Course', 'Branch', 'Batch', 'Studying', 'Enrollment',
        'Birth Date', 'Gender', 'Tenth Passing', 'Tenth Board/University', 'Tenth Score',
        'Twelve Passing', 'Twelve Board/University', 'Twelve Stream', 'Twelve Score', 'Degree Name',
        'Degree University', 'Degree Branch', 'Degree Passing', 'Degree Score', 'Diploma Passing',
        'Diploma Name', 'Diploma Stream', 'Diploma Score', 'Disability', 'Gap (Yrs)', 'Gap Description',
    ]]);

    XLSX.utils.book_append_sheet(workbook, worksheet, 'data');

    // Send workbook to client
    const fileBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    resp.setHeader('Content-Disposition', 'attachment; filename=students.xlsx');
    resp.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    resp.send(fileBuffer);
    // resp.status(200).end(fileBuffer, 'binary');
    resp.status(200).end();
});


// EXPORT ALL STUDENT RECORDS IN EXCEL FILE
export const exportStudent = TryCatch(async (req, resp, next) => {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length <= 0) {
        return next(new ErrorHandler('STUDENTS NOT FOUND!', 404));
    };

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

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(users.map(item => ({
        'ID NO.': item?.id_prf,
        'Name': item?.name,
        'Mail ID': item?.email,
        'Contact': item?.mobile,
        'Course': item?.student?.course,
        'Branch': item?.student?.branch,
        'Batch': item?.student?.batch,
        'Studying': item?.student?.current_yr,
        'Enrollment': item?.student?.enroll,
        'Birth Date': item?.student?.dob,
        'Gender': item?.gender,
        'Tenth Passing': item?.student?.ten_yr,
        'Tenth Board/University': item?.student?.ten_board,
        'Tenth Score': item?.student?.ten_per,
        'Twelve Passing': item?.student?.twelve_yr,
        'Twelve Board/University': item?.student?.twelve_board,
        'Twelve Stream': item?.student?.twelve_stream,
        'Twelve Score': item?.student?.twelve_per,
        'Diploma Passing': item?.student?.diploma_yr,
        'Diploma Name': item?.student?.ten_board,
        'Diploma Stream': item?.student?.diploma_stream,
        'Diploma Score': item?.student?.diploma_per,
        'Degree Name': item?.student?.degree_name,
        'Degree University': item?.student?.degree_university,
        'Degree Branch': item?.student?.degree_branch,
        'Degree Passing': item?.student?.degree_yr,
        'Degree Score': item?.student?.degree_per,
        'Disability': item?.student?.disability === false ? 'no' : 'yes',
        'Experience (Yrs)': item?.student?.experience,
        'Address': item?.address,
        'City': item?.city,
        'Pin Code': item?.pin_code,
        'Gap (Yrs)': item?.student?.ed_gap,
        'Gap Description': item?.student?.gap_desc,
    })));

    XLSX.utils.book_append_sheet(workbook, worksheet, 'data');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    resp.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    resp.setHeader('Content-Disposition', 'attachment; filename=students.xlsx');
    resp.status(200).end(buffer, 'binary');
});