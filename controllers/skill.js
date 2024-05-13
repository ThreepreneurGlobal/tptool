const TryCatch = require("../middleware/TryCatch");
const Skill = require("../models/skill");
const ErrorHandler = require("../utils/errHandle");
const Student = require("../models/student");
const CollageSkill = require("../models/collageSkill");
const CompanySkill = require("../models/companySkill");

// Skill.sync();

//Skills
exports.createSkill = TryCatch(async (req, resp, next) => {
    const { title, short_name, description, sub_category } = req.body;

    const [skill, created] = await Skill.findOrCreate({
        where: { title, short_name },
        defaults: { description, sub_category, category: "skills" }
    });
    created ? resp.status(201).json({ success: true, message: `${skill.title?.toUpperCase()} is Created Successfully...` }) :
        resp.status(403).json({ success: false, message: `${skill.title?.toUpperCase()} Already Exists!` });
});


exports.getAllSkills = TryCatch(async (req, resp, next) => {
    const apiObj = {};
    const api = await Skill.findAll({ where: { category: "skills", status: true } });
    if (api.length === 0) {
        return next(new ErrorHandler("Skills Not Found!", 404));
    };
    api.forEach((item) => {
        if (!apiObj[item.sub_category]) {
            apiObj[item.sub_category] = { label: item.sub_category.toUpperCase(), options: [] };
        };
        apiObj[item.sub_category].options.push({ label: item.title && item.title.toUpperCase(), value: item.id });
    });

    const skills = Object.values(apiObj);
    resp.status(200).json({ success: true, skills });
});

exports.getSuperSkills = TryCatch(async (req, resp, next) => {
    const items = await Skill.findAll({ where: { category: "skills", status: true } });

    const skills = await Promise.all(items.map(async (skill) => {
        const count = await CompanySkill.count({ where: { skillId: skill.id } });
        return { ...skill.toJSON(), count };
    }));

    resp.status(200).json({ success: true, skills });
});


//Branch
exports.getAllBranches = TryCatch(async (req, resp, next) => {
    const items = await Skill.findAll({ where: { category: "course", status: true, sub_category: "branch" } });

    const branches = await Promise.all(items.map(async (skill) => {
        const count = await CollageSkill.count({ where: { skillId: skill.id } });
        return { ...skill.toJSON(), count };
    }));
    resp.status(200).json({ success: true, branches });
});

exports.getGenBranches = TryCatch(async (req, resp, next) => {
    const apiObj = {};
    const api = await Skill.findAll({ where: { sub_category: "branch", status: true } });
    if (api.length === 0) {
        return next(new ErrorHandler("Branches Not Found!", 404));
    };
    api.forEach((item) => {
        if (!apiObj[item.sub_category]) {
            apiObj[item.sub_category] = { label: item.sub_category.toUpperCase(), options: [] };
        };
        apiObj[item.sub_category].options.push({ label: item.title && item.title.toUpperCase(), value: item.id });
    });

    const branches = Object.values(apiObj);
    resp.status(200).json({ success: true, branches });
});

exports.createBranch = TryCatch(async (req, resp, next) => {
    const { title, short_name, description } = req.body;
    const [branch, created] = await Skill.findOrCreate({
        where: { title, short_name },
        defaults: { description, category: "course", sub_category: "branch" }
    });
    created ? resp.status(201).json({ success: true, message: `${branch.title?.toUpperCase()} is Created Successfully...` }) :
        resp.status(403).json({ success: false, message: `${branch.title?.toUpperCase()} Already Exists!` });
});


//Course
exports.getAllCourses = TryCatch(async (req, resp, next) => {
    const apiObj = {};
    const api = await Skill.findAll({ where: { category: "course", status: true, sub_category: ["degree", "diploma", "master"] } });

    api.forEach((item) => {
        if (!apiObj[item.sub_category]) {
            apiObj[item.sub_category] = { label: item.sub_category.toUpperCase(), options: [] }
        };
        apiObj[item.sub_category].options.push({ label: item.title && item.title.toUpperCase(), value: item.id });
    });
    const courses = Object.values(apiObj);
    resp.status(200).json({ success: true, courses });
});

exports.getSuperCourses = TryCatch(async (req, resp, next) => {
    const items = await Skill.findAll({ where: { category: "course", status: true, sub_category: ["degree", "diploma", "master"] } });

    const courses = await Promise.all(items.map(async (skill) => {
        const count = await CollageSkill.count({ where: { skillId: skill.id } });
        return { ...skill.toJSON(), count };
    }));

    resp.status(200).json({ success: true, courses });
});

exports.createCourse = TryCatch(async (req, resp, next) => {
    const { title, short_name, description, sub_category } = req.body;

    const [course, created] = await Skill.findOrCreate({
        where: { title, short_name },
        defaults: { description, category: "course", sub_category }
    });
    created ? resp.status(201).json({ success: true, message: `${course.title?.toUpperCase()} is Created Successfully...` }) :
        resp.status(403).json({ success: false, message: `${course.title?.toUpperCase()} Already Exists!` });
});


//Generals
exports.getSkillById = TryCatch(async (req, resp, next) => {
    const skill = await Skill.findOne({ where: { id: req.params.id, status: true } });
    if (!skill) {
        return next(new ErrorHandler("Item Not Found!", 404));
    };

    resp.status(200).json({ success: true, skill });
});

exports.updateSkill = TryCatch(async (req, resp, next) => {
    const { category, short_name, description, sub_category } = req.body;
    const skill = await Skill.findOne({ where: { id: req.params.id, status: true } });
    if (!skill) {
        return next(new ErrorHandler("Not Found!", 404));
    };

    await skill.update({ category, short_name, description, sub_category });
    resp.status(200).json({ success: true, message: `${skill.title?.toUpperCase()} Updated Successfully...` });
});


exports.deleteSkill = TryCatch(async (req, resp, next) => {
    const skill = await Skill.findOne({ where: { id: req.params.id, status: true } });
    if (!skill) {
        return next(new ErrorHandler("Not Found!", 404));
    };

    await skill.update({ status: false });
    resp.status(200).json({ success: true, message: `Deleted Successfully...` });
});


//Student - Skill {Branch/Course} Association
Student.belongsTo(Skill, { foreignKey: "courseId", as: "course" });
// Skill.hasOne(Skill, { foreignKey: "course" });

Student.belongsTo(Skill, { foreignKey: "branchId", as: "branch" });
// Skill.hasOne(Skill, { foreignKey: "branch" });