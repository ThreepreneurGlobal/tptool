const CollageSkill = require("../models/collageSkill");
const Collage = require("../models/org");
const Skill = require("../models/skill");
const TryCatch = require("../middleware/TryCatch");
const ErrorHandler = require("../utils/errHandle");

// CollageSkill.sync();

exports.addBranchInCollage = TryCatch(async (req, resp, next) => {
    const { skillIds } = req.body;
    if (!Array.isArray(skillIds)) {
        return next(new ErrorHandler("Select at Least one Branch!", 203));
    };

    //Check Existing Courses
    const existCourses = await CollageSkill.findAll({ where: { skillId: skillIds, collageId: req.user.orgId, status: true } });
    if (existCourses.length > 0) {
        return next(new ErrorHandler("Branch Already Exists!", 400));
    }
    // Course Id's
    const existIds = existCourses.map((course) => course.skillId);
    // Create New Courses after Checking Existing Id's
    const newCourses = skillIds.filter(skillId => !existIds.includes(skillId));

    await Promise.all(newCourses.map(async (skillId) => {
        try {
            const existingCourse = await CollageSkill.findOne({ where: { skillId, collageId: req.user.orgId, status: true } });
            if (!existingCourse) {
                return CollageSkill.create({ skillId, collageId: req.user.orgId });
            };
        } catch (error) {
            console.error(error.message);
        }
    }));
    resp.status(200).json({ success: true, message: "Branch Added Successfully..." });
});

exports.addCourseInCollage = TryCatch(async (req, resp, next) => {
    const { skillIds } = req.body;
    if (!Array.isArray(skillIds)) {
        return next(new ErrorHandler("Select at Least one Course!", 203));
    };

    //Check Existing Courses
    const existCourses = await CollageSkill.findAll({ where: { skillId: skillIds, collageId: req.user.orgId, status: true } });
    if (existCourses.length > 0) {
        return next(new ErrorHandler("Course Already Exists!", 400));
    }
    // Course Id's
    const existIds = existCourses.map((course) => course.skillId);
    // Create New Courses after Checking Existing Id's
    const newCourses = skillIds.filter(skillId => !existIds.includes(skillId));

    await Promise.all(newCourses.map(async (skillId) => {
        try {
            const existingCourse = await CollageSkill.findOne({ where: { skillId, collageId: req.user.orgId, status: true } });
            if (!existingCourse) {
                return CollageSkill.create({ skillId, collageId: req.user.orgId });
            };
        } catch (error) {
            console.error(error.message);
        }
    }));
    resp.status(200).json({ success: true, message: "Course Added Successfully..." });
});

exports.removeBranchInCollage = TryCatch(async (req, resp, next) => {
    const { skillId } = req.params.id;
    const skill = await CollageSkill.findOne({ where: { skillId, collageId: req.user.orgId } });
    if (!skill) {
        return next(new ErrorHandler('BRANCH NOT FOUND IN COLLAGE', 404));
    };

    const skillTitle = await Skill.findOne({ where: { id: skill.skillId, success: true } });
    if (!skill) {
        return next(new ErrorHandler('BRANCH NOT FOUND', 404));
    };

    await skill.update({ status: false });
    resp.status(200).json({ success: true, message: `${skillTitle?.title?.toUpperCase()} REMOVED SUCCESSFULLY...` });
});

exports.removeCourseInCollage = TryCatch(async (req, resp, next) => {
    const { skillId } = req.params.id;
    const skill = await CollageSkill.findOne({ where: { skillId, collageId: req.user.orgId } });
    if (!skill) {
        return next(new ErrorHandler('COURSE NOT FOUND IN COLLAGE', 404));
    };

    const skillTitle = await Skill.findOne({ where: { id: skill.skillId, success: true } });
    if (!skill) {
        return next(new ErrorHandler('COURSE NOT FOUND', 404));
    };

    await skill.update({ status: false });
    resp.status(200).json({ success: true, message: `${skillTitle?.title?.toUpperCase()} REMOVED SUCCESSFULLY...` });
});


// Collage - Branch Relation
Collage.belongsToMany(Skill, { through: CollageSkill, as: "branches" });
Skill.belongsToMany(Collage, { through: CollageSkill, as: "collages" });

// Collage - Course Relation
Collage.belongsToMany(Skill, { through: CollageSkill, as: "courses" });