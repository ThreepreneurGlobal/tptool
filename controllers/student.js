const ExcelJS = require("exceljs");
const User = require("../models/user");
const Student = require("../models/student");
const ErrorHandler = require("../utils/errHandle");
const TryCatch = require("../middleware/TryCatch");
const Skill = require("../models/skill");

exports.getStudentById = TryCatch(async (req, resp, next) => {
    const student = await User.findOne({
        where: { orgId: req.user.orgId, status: true, role: "user", designation: "student", id: req.params.id },
        include: [
            {
                model: Student, foreignKey: "userId", as: "student",
                include: [
                    { model: Skill, foreignKey: "courseId", attributes: ["id", "title", "short_name"], as: "course", where: { sub_category: ["degree", "master", "diploma"] } },
                    { model: Skill, foreignKey: "branchId", attributes: ["id", "title", "short_name"], as: "branch", where: { sub_category: "branch" } },
                ],
            },
        ],
        attributes: { exclude: ["password"] }
    });

    resp.status(200).json({ success: true, student });
});


exports.exportAllStud = TryCatch(async (req, resp, next) => {
    const students = await User.findAll({
        where: { orgId: req.user.orgId, status: true, role: "user" }
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("students");

    worksheet.columns = [
        { header: 'Name', key: "name", width: "30" },
        { header: 'Mail ID', key: "email", width: "30" },
        { header: '10%', key: "tenthPer", width: "30" },
        { header: '12%', key: "twelvePer", width: "30" },
        { header: 'Skills', key: "skills", width: "90" },
        { header: 'Enroll ID', key: "enrollmentId", width: "30" },
        { header: 'Field', key: "edField", width: "30" },
        { header: 'Year', key: "year", width: "30" },
        { header: 'Branch', key: "branch", width: "30" },
    ];
    students.forEach((item) => {
        worksheet.addRow({
            name: item.name,
            email: item.email,
            tenthPer: item.tenthPer,
            twelvePer: item.twelvePer,
            skills: item.skills,
            enrollmentId: item.enrollmentId,
            edField: item.edField,
            year: item.year,
            branch: item.branch,
        });
    });

    resp.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    resp.setHeader('Content-Disposition', `attachment; filename=students.xlsx`);
    await workbook.xlsx.write(resp);
    resp.end();
});

exports.importStudent = TryCatch(async (req, resp, next) => {
    let users;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);

    const worksheet = workbook.worksheets[0];
    worksheet.eachRow({ includeEmpty: false }, async (row, idx) => {
        if (idx !== 1) {
            const [Name, Mail, Mobile, Ten, Twelve, Skills, Enroll_ID, Field, Year, Branch] = row.values;
            users = await User.create({
                name: Name, email: Mail, password: "Pass@321", mobile: Mobile, ten_per: Ten, twelve_per: Twelve,
                skills: Skills, enroll: Enroll_ID, ed_field: Field, year: Year, branch: Branch
            });
        };
    });

    resp.status(200).json({ success: true, message: `${users.length} Students Imported Successfully...` });
});