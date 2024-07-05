const XLSX = require("xlsx");
const User = require("../models/user");
const Student = require("../models/student");
const ErrorHandler = require("../utils/errHandle");
const TryCatch = require("../middleware/TryCatch");
const Skill = require("../models/skill");
const Application = require("../models/aplication");
const PlacePosition = require("../models/placePosition");
const Company = require("../models/company");
const Project = require("../models/project");
const UserSkill = require("../models/studentSkill");
const Academy = require("../models/academy");
const DocumentModel = require("../models/document");


exports.getStudentById = TryCatch(async (req, resp, next) => {
    const user = await User.findOne({
        where: { orgId: req.user.orgId, status: true, role: "user", designation: "student", id: req.params.id },
        include: [
            {
                model: Student, foreignKey: "userId", as: "student",
                include: [
                    { model: Skill, foreignKey: "courseId", attributes: ["id", "title", "short_name"], as: "course", where: { sub_category: ["degree", "master", "diploma"] } },
                    { model: Skill, foreignKey: "branchId", attributes: ["id", "title", "short_name"], as: "branch", where: { sub_category: "branch" } },
                ],
            },
            {
                model: Application, foreignKey: "userId", as: "apps", required: false, attributes: { exclude: ['orgId', 'compId', 'positionId', 'userId'] },
                include: [
                    { model: PlacePosition, foreignKey: "positionId", as: "position", required: true, attributes: ['id', 'title', 'type', 'locations'] },
                    { model: Company, foreignKey: "compId", as: "company", required: true, attributes: ['id', 'title'] },
                ]
            },
            { model: Skill, through: UserSkill, as: "skills", required: false, attributes: ['id', 'title', 'short_name'] }
        ],
        attributes: { exclude: ["password"] }
    });
    if (!user) {
        return next(new ErrorHandler("Student Not Found!", 404));
    }

    // Applications Status Counting
    const job_status = Application.rawAttributes.app_status.values;
    const job_status_count = {};
    const intern_status_count = {};
    for (let status of job_status) {
        job_status_count[status] = 0;
        intern_status_count[status] = 0;
    };

    if (user?.apps) {
        user?.apps?.forEach(app => {
            const positionType = app?.position?.type;
            if (positionType === "job" && job_status_count.hasOwnProperty(app.app_status)) {
                job_status_count[app.app_status]++;
            } else if (positionType === "intern" && intern_status_count.hasOwnProperty(app.app_status)) {
                intern_status_count[app.app_status]++;
            }
        });
    };

    // Project List
    const projects = await Project.findAll({ where: { status: true, studId: user?.id }, attributes: { exclude: ["studId"] } });

    // Academic List
    const academies = await Academy.findAll({
        where: { status: true, userId: user?.id }, attributes: { exclude: ['studId', 'userId', 'orgId'] }
    });

    // Attachments List
    const id_prfs = await DocumentModel.findAll({ where: { userId: user?.id, type: "id_prf" } });
    const certificates = await DocumentModel.findAll({ where: { userId: user?.id, type: "certificate" } });

    const student = {
        user, job_status_count, intern_status_count, projects, academies, id_prfs, certificates
    };
    resp.status(200).json({ success: true, student });
});

// For Student Self
exports.updateStudentProfile = TryCatch(async (req, resp, next) => {
    const { dob, ten_yr, ten_per, ten_board, twelve_yr, twelve_per, twelve_board,
        twelve_stream, experience, interested_in, position, langs } = req.body;

    if (dob && isNaN(Date.parse(dob))) {
        return next(new ErrorHandler("Invalid Date of Birth format", 400));
    };

    const student = await Student.findOne({ where: { userId: req.user.id } });
    if (!student) {
        return next(new ErrorHandler("Student Not Found!", 404));
    };

    await student.update({
        dob, ten_yr, ten_per, ten_board, twelve_yr, twelve_per, twelve_board, twelve_stream,
        experience, interested_in, position, langs
    });

    resp.status(200).json({ success: true, message: 'STUDENT PROFILE UPDATED SUCCESSFULLY...' });
});

// For Admin 
exports.editCollageStudent = TryCatch(async (req, resp, next) => {
    const { name, email, mobile, dob, gender, courseId, branchId, current_yr, batch, enroll,
        ed_gap, gap_desc, ten_per, ten_yr, twelve_per, twelve_yr, twelve_stream, universityId, } = req.body;

    let user = await User.findOne({ where: { id: req.params.id, status: true, orgId: req.user.orgId } });
    if (!user) {
        return next(new ErrorHandler("Student Not Found!", 404));
    };

    await user.update({ name, email, mobile, gender, });
    if (user && user.role === "user") {
        const student = await Student.findOne({ where: { userId: user.id, status: true } });
        await student.update({
            dob, courseId, branchId, current_yr, batch, enroll, ed_gap, gap_desc, ten_per,
            ten_yr, twelve_per, twelve_yr, twelve_stream, universityId,
        });
    };
    resp.status(201).json({ success: true, message: `${user?.name?.toUpperCase()} Profile Updated Successfully...` });
});

exports.exportAllStud = TryCatch(async (req, resp, next) => {
    const users = await User.findAll({
        where: { orgId: req.user.orgId, status: true, role: "user" },
        include: [
            {
                model: Student, foreignKey: "userId", as: "student", required: false,
                include: [
                    { model: Skill, foreignKey: "courseId", attributes: ["id", "title"], as: "course", where: { sub_category: ["degree", "master", "diploma"] } },
                    { model: Skill, foreignKey: "branchId", attributes: ["id", "title"], as: "branch", where: { sub_category: "branch" } },
                ]
            }
        ]
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(users.map((item) => ({
        Name: item?.name,
        Mobile: item?.mobile,
        Mail: item?.email,
        Gender: item?.gender,
        Address: item?.address,
        Pin_Code: item?.pin_code,
        City: item?.city,
        IDProof: item?.id_prf,
        DOB: item?.student?.dob,
        Batch: item?.student?.batch,
        Course: item?.student?.course?.title,
        Branch: item?.student?.branch?.title,
        EnrollmentID: item?.student?.enroll,
        Tenth_Year: item?.student?.ten_yr,
        Tenth_Percentage: item?.student?.ten_per,
        Twelth_Year: item?.student?.twelve_yr,
        Twelth_Percentage: item?.student?.twelve_per,
    })));

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    resp.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    resp.setHeader('Content-Disposition', `attachment; filename=students.xlsx`);
    resp.status(200).end(buffer, 'binary');
});

