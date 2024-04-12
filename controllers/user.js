const ExcelJS = require("exceljs");
const { Op } = require("sequelize");
const User = require("../models/user");
const ErrorHandler = require("../utils/errHandle");
const TryCatch = require("../middleware/TryCatch");
const sendToken = require("../utils/token");
const Org = require("../models/org");


// User.sync({ force: true, alter: true });

exports.registerUser = TryCatch(async (req, resp, next) => {
    const { name, mobile, email, password } = req.body;

    await User.create({ name, mobile, email, password, role: "super", url: name + email, designation: "tp" });
    resp.status(200).json({ success: true, message: "Super User Created Successfully...." });
});

exports.addAdmin = TryCatch(async (req, resp, next) => {
    const { name, mobile, email, password, orgId, designation, id_prf } = req.body;

    const [user, created] = await User.findOrCreate({
        where: { [Op.or]: [{ name }, { email }, { orgId }] },
        defaults: { mobile, password, role: "admin", designation, id_prf, url: name + email }
    });
    created ? resp.status(200).json({ success: true, message: "Collage Admin Created Successfully...." }) :
        resp.status(500).json({ success: false, message: `${user.name} Already Exists!` });
});

exports.loginUser = TryCatch(async (req, resp, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new ErrorHandler("Please Enter Email and Password!", 401));
    };

    const user = await User.findOne({ where: { email } });
    if (!user) {
        return next(new ErrorHandler("Please Enter Valid Email or Password!", 401));
    };

    const isPassMatch = await user.comparePass(password);
    if (!isPassMatch) {
        return next(new ErrorHandler("Please Enter Valid Email or Password!", 401));
    };

    sendToken(user, 200, resp);
});

exports.logoutUser = TryCatch(async (req, resp, next) => {
    resp.cookie("token", null, { expires: new Date(Date.now()), httpOnly: true })
        .status(200).json({ success: true, message: "Logged Out Successfully..." });
});

exports.myProfile = TryCatch(async (req, resp, next) => {
    const user = await User.findByPk(req.user.id, {
        attributes: {
            exclude: ["password"]
        },
        include: req.user.orgId !== null ? [
            { model: Org, foreignKey: "orgId", as: "collage" }
        ] : [],
    });

    resp.status(200).json({ success: true, user });
});

exports.updateProfile = TryCatch(async (req, resp, next) => {
    const user = await User.findByPk(req.user.id);
    const { avatar, gender, address, city, pin_code } = req.body;

    await user.update({ avatar, gender, address, city, pin_code });
    resp.status(200).json({ success: true, message: "Profile Updated Successfully..." });
});

exports.addStudent = TryCatch(async (req, resp, next) => {
    const { name, email, password, gender, id_prf } = req.body;

    const [user, created] = await User.findOrCreate({
        where: { [Op.or]: [{ name }, { email }, { orgId: req.user.orgId }] },
        defaults: { password, gender, id_prf, url: name + email }
    });
    created ? resp.status(201).json({ success: true, message: `${user.name} Added Successfully...` }) :
        resp.status(403).json({ success: false, message: `${user.name} Already Existed!` });
});

exports.deleteStudent = TryCatch(async (req, resp, next) => {
    const student = await User.findOne({ where: { id: req.params.id, status: true, orgId: req.user.orgId } });
    if (!student) {
        return next(new ErrorHandler("Student Not Found!", 404));
    };

    await student.update({ status: false });
    resp.status(200).json({ success: true, message: "Student Deleted..." });
});

exports.allStudent = TryCatch(async (req, resp, next) => {
    const students = await User.findAll({
        where: { orgId: req.user.orgId, status: true, role: "user", designation: "student" }
    });

    resp.status(200).json({ success: true, students });
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
                name: Name, email: Mail, password: "Pass@321", mobile: Mobile, tenthPer: Ten, twelvePer: Twelve,
                skills: Skills, enrollment: Enroll_ID, edField: Field, year: Year, branch: Branch
            });
        };
    });

    resp.status(200).json({ success: true, message: `${users.length} Students Imported Successfully...` });
});