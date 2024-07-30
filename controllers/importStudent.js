const XLSX = require("xlsx");
const moment = require("moment");
const { rm } = require("fs");
const TryCatch = require("../middleware/TryCatch");
const ErrorHandler = require("../utils/errHandle");
const Org = require("../models/org");
const Skill = require("../models/skill");
const CollageSkill = require("../models/collageSkill");
const Student = require("../models/student");
const User = require("../models/user");
const { excelToJSDate } = require("../utils/feature01");


exports.generateTemplate = TryCatch(async (req, resp, next) => {
    const collageSkills = await CollageSkill.findAll({ where: { collageId: req.user.orgId, status: true } });
    const collageSkillIds = collageSkills.map(item => item.skillId);

    const branches = await Skill.findAll({ where: { status: true, sub_category: "branch", id: collageSkillIds } });
    const courses = await Skill.findAll({ where: { status: true, sub_category: ["degree", "master", "diploma"], id: collageSkillIds } });
    // Check Branches and Courses Available or Not...
    if (branches.length === 0 || courses.length === 0) {
        return next(new ErrorHandler("Branches or Courses Not Available", 404));
    };

    //Create Workbook and Worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([
        ['Name', 'Mail', 'Mobile', 'Gender', 'City', 'IDProof', 'BirthDate', 'Batch', 'EnrollmentID', 'TenthPassing', 'TenthPercentage',
            'TwelvePassing', 'TwelveStream', 'TwelvePercentage', 'Disablity', 'EducationGap', 'Course_Code', 'Branch_Code', 'CurrentYear']
    ]);

    XLSX.utils.book_append_sheet(workbook, worksheet, 'students');

    const branchData = [['Branch Code', 'Branch Name']];
    const courseData = [['Course Code', 'Course Name']];

    branches.forEach(item => {
        branchData.push([item.id, item.title]);
    });
    const wsBranch = XLSX.utils.aoa_to_sheet(branchData);
    XLSX.utils.book_append_sheet(workbook, wsBranch, "branch");

    courses.forEach(item => {
        courseData.push([item.id, item.title]);
    });
    const wsCourse = XLSX.utils.aoa_to_sheet(courseData);
    XLSX.utils.book_append_sheet(workbook, wsCourse, "course");

    // Send workbook to client
    const fileBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    resp.setHeader('Content-Disposition', 'attachment; filename=tptemplate.xlsx');
    resp.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    resp.send(fileBuffer);
    // resp.status(200).end(fileBuffer, 'binary');
    resp.status(200).end();
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
            Course_Code, Branch_Code, CurrentYear } = item;

        // Genrate Password
        const trimName = Name.replace(" ", "");
        const nameWord = trimName.split(' ');
        let password;
        if (nameWord.length > 0) {
            const first = nameWord[0];
            password = (first.substring(0, 4)).charAt(0).toUpperCase() + first.substring(1, 4).toLowerCase() + "@123";
        };

        //DOB Format
        let formattedDate = null;
        if (BirthDate) {
            let parseDate;
            if (typeof BirthDate === "number") {
                parseDate = excelToJSDate(BirthDate);
            } else {
                parseDate = moment(BirthDate, ["MM-DD-YYYY", "DD-MM-YYYY", "YYYY-MM-DD", "MM/DD/YYYY", "DD/MM/YYYY", "YYYY/MM/DD"]);
            };
            if (moment(parseDate).isValid()) {
                formattedDate = moment(parseDate).format('YYYY-MM-DD');
            } else { console.error('Invalid Birth Date! ' + BirthDate) };
        };

        const existed = await User.findOne({ where: { name: Name?.toLowerCase(), email: Mail } });
        if (existed) {
            console.log(`${existed.name} Already Exist!`);
            return null;
        };
        const user = await User.create({
            name: Name?.toLowerCase(), email: Mail, password, mobile: Mobile, gender: Gender?.toLowerCase(),
            city: City?.toLowerCase(), id_prf: IDProof, orgId: req.user.orgId
        });
        users.push(user);
        if (user) {
            await Student.create({
                dob: formattedDate, batch: Batch, enroll: EnrollmentID, ten_yr: TenthPassing,
                ten_per: TenthPercentage, twelve_yr: TwelvePassing, twelve_stream: TwelveStream?.toLowerCase(),
                twelve_per: TwelvePercentage, disablity: Disablity?.toLowerCase() === "yes" ? true : false,
                ed_gap: EducationGap, userId: user.id, courseId: Course_Code, branchId: Branch_Code,
                current_yr: CurrentYear, universityId: auth.collage.universityId
            });
        };
    }));

    rm(req.file.path, () => { console.log('XLSX FILE DELETED...') });
    users.length > 0 ? resp.status(200).json({ success: true, message: `${users.length} Students Imported Successfully...` }) :
        resp.status(400).json({ success: true, message: `Students Not Imported Successfully...` });
});