// const ExcelJS = require("exceljs");
const XLSX = require("xlsx");
const User = require("../models/user");
const Student = require("../models/student");
const ErrorHandler = require("../utils/errHandle");
const TryCatch = require("../middleware/TryCatch");
const Skill = require("../models/skill");
const Org = require("../models/org");

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
    if (!student) {
        return next(new ErrorHandler("Student Not Found!", 404));
    }

    resp.status(200).json({ success: true, student });
});


exports.exportAllStud = TryCatch(async (req, resp, next) => {
    const users = await User.findAll({
        where: { orgId: req.user.orgId, status: true, role: "user" },
        include: [
            { model: Student, foreignKey: "userId", as: "student", required: false }
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

exports.importStudent = TryCatch(async (req, resp, next) => {
    const auth = await User.findByPk(req.user.id, {
        include: [{
            model: Org, foreignKey: "orgId", as: "collage", attributes: ['id', 'title', 'city', 'state', 'universityId']
        }], attributes: ['id', 'name', 'role']
    });
    let users = [];
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const arr = XLSX.utils.sheet_to_json(worksheet);

    await Promise.all(arr.map(async (item) => {
        const { Name, Mail, Mobile, Gender, City, IDProof, BirthDate, Batch, EnrollmentID, TenthPassing,
            TenthPercentage, TwelvePassing, TwelveStream, TwelvePercentage, Disablity, EducationGap,
            Course, Branch, CurrentYear } = item;

        // Genrate Password
        const trimName = Name.replace(" ", "");
        const nameWord = trimName.split(' ');
        let password;
        if (nameWord.length > 0) {
            const first = nameWord[0];
            password = (first.substring(0, 4)).charAt(0).toUpperCase() + first.substring(1, 4).toLowerCase() + "@123";
        };

        const existed = await User.findOne({ where: { name: Name, email: Mail } });
        if (existed) {
            console.log(`${existed.name} Already Exist!`);
            return null;
        };
        const user = await User.create({
            name: Name, email: Mail, password, mobile: Mobile, gender: Gender, city: City,
            id_prf: IDProof, orgId: req.user.orgId
        });
        users.push(user);
        if (user) {
            await Student.create({
                dob: BirthDate, batch: Batch, enroll: EnrollmentID, ten_yr: TenthPassing,
                ten_per: TenthPercentage, twelve_yr: TwelvePassing, twelve_stream: TwelveStream,
                twelve_per: TwelvePercentage, disablity: Disablity, ed_gap: EducationGap,
                userId: user.id, courseId: Course, branchId: Branch, current_yr: CurrentYear,
                universityId: auth.collage.universityId
            });
        };
    }));
    users.length > 0 ? resp.status(200).json({ success: true, message: `${users.length} Students Imported Successfully...` }) :
        resp.status(400).json({ success: true, message: `Students Not Imported Successfully...` });
});