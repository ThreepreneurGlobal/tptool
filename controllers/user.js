const { rm } = require("fs");
const User = require("../models/user");
const Student = require("../models/student");
const ErrorHandler = require("../utils/errHandle");
const TryCatch = require("../middleware/TryCatch");
const sendToken = require("../utils/token");
const Org = require("../models/org");
const Skill = require("../models/skill");


// User.sync({ force: true, alter: true });
// Student.sync({ force: true, alter: true });

exports.registerUser = TryCatch(async (req, resp, next) => {
    const { name, mobile, email, password } = req.body;

    await User.create({ name, mobile, email, password, role: "super", designation: "tp" });
    resp.status(200).json({ success: true, message: "Super User Created Successfully...." });
});

exports.addAdmin = TryCatch(async (req, resp, next) => {
    const { name, mobile, email, password, orgId, designation, id_prf } = req.body;

    const existed = await User.findOne({ where: { name, email, orgId } });
    if (existed) {
        return next(new ErrorHandler(`${existed.name} Already Exists!`, 500));
    };

    await User.create({ name, mobile, email, password, orgId, designation, id_prf, role: "admin" });
    resp.status(200).json({ success: true, message: "Collage Admin Created Successfully...." })
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
            exclude: ["password", "status", "created_at", "updated_at"]
        },
        include: [
            { model: Org, foreignKey: "orgId", as: "collage", attributes: ['id', 'title', 'city', 'state', 'universityId'] },
            { model: Student, foreignKey: "userId", as: "student" }
        ],
    });

    resp.status(200).json({ success: true, user });
});

exports.updateProfile = TryCatch(async (req, resp, next) => {
    const user = await User.findByPk(req.user.id);
    const { gender, address, city, pin_code, url, facebook, twitter, instagram, linkedin, whatsapp } = req.body;
    const avatar = req.file.path;
    if (avatar && user.avatar) {
        rm(user.avatar, () => { console.log('OLD FILE REMOVED SUCCESSFULLY...'); });
    };

    await user.update({ avatar, gender, address, city, pin_code, url, facebook, twitter, instagram, linkedin, whatsapp });
    resp.status(200).json({ success: true, message: "Profile Updated Successfully..." });
});

exports.addStudent = TryCatch(async (req, resp, next) => {
    const { name, email, mobile, dob, gender, courseId, branchId, current_yr, batch, enroll,
        ed_gap, gap_desc, ten_per, ten_yr, twelve_per, twelve_yr, twelve_stream, universityId, } = req.body;

    const existed = await User.findOne({ where: { email, orgId: req.user.orgId, name } });
    if (existed) {
        return next(new ErrorHandler(`${existed.name} Already Exists!`, 500));
    };

    const user = await User.create({ name, email, mobile, gender, password: "Student@123", orgId: req.user.orgId });
    if (user) {
        await Student.create({
            dob, courseId, branchId, current_yr, batch, enroll, ed_gap, gap_desc, ten_per,
            ten_yr, twelve_per, twelve_yr, twelve_stream, userId: user.id, universityId
        });
    };

    resp.status(201).json({ success: true, message: `${user.name?.toUpperCase()} Added Successfully...` });
});

exports.deleteStudent = TryCatch(async (req, resp, next) => {
    const student = await User.findOne({ where: { id: req.params.id, status: true, orgId: req.user.orgId } });
    if (!student) {
        return next(new ErrorHandler("Student Not Found!", 404));
    };
    if (student.avatar) {
        rm(student.avatar, () => { console.log('FILE REMOVED SUCCESSFULLY...'); });
    };

    await student.update({ status: false });
    resp.status(200).json({ success: true, message: "Student Deleted..." });
});

exports.allStudent = TryCatch(async (req, resp, next) => {
    const students = await User.findAll({
        where: { orgId: req.user.orgId, status: true, role: "user", designation: "student" },
        include: [
            {
                model: Student, foreignKey: "userId", as: "student",
                include: [
                    { model: Skill, foreignKey: "courseId", attributes: ["id", "short_name"], as: "course", where: { sub_category: ["degree", "master", "diploma"] } },
                    { model: Skill, foreignKey: "branchId", attributes: ["id", "short_name"], as: "branch", where: { sub_category: "branch" } },
                ],
                attributes: ["dob", "batch", "current_yr", "enroll", "ten_per", "twelve_per", "diploma",
                    "diploma_per", "ed_gap", "experience", "id"]
            },
        ],
        attributes: ["id", "name", "email", "mobile", "avatar", "gender"]
    });

    resp.status(200).json({ success: true, students });
});

exports.getAdmins = TryCatch(async (req, resp, next) => {
    const admins = await User.findAll({
        where: { status: true, role: "admin" },
        attributes: { exclude: ["password"] },
        include: [{ model: Org, foreignKey: "orgId", as: "collage", attributes: ["id", "title", "city"] }]
    });

    resp.status(200).json({ success: true, admins });
});


//User to Student Association
User.hasOne(Student, { foreignKey: "userId", as: "student" });
Student.belongsTo(User, { foreignKey: "userId", as: "user" });