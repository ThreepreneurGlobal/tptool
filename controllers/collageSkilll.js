const CollageSkill = require("../models/collageSkill");
const Collage = require("../models/org");
const Skill = require("../models/skill");
const TryCatch = require("../middleware/TryCatch");
const ErrorHandler = require("../utils/errHandle");

// CollageSkill.sync();

exports.addBranchInCollage = TryCatch(async (req, resp, next) => {
    const { skillId } = req.body;

    const exists = await CollageSkill.findOne({ where: { skillId, collageId: req.user.orgId, status: true } });
    if (exists) {
        return next(new ErrorHandler("Branch Already Exists!"));
    }

    await CollageSkill.create({ skillId, collageId: req.user.orgId });
    resp.status(200).json({ success: true, message: "Branch Added Successfully..." });
});

exports.addCourseInCollage = TryCatch(async (req, resp, next) => {
    const { skillId } = req.body;

    const exists = await CollageSkill.findOne({ where: { skillId, collageId: req.user.orgId, status: true } });
    if (exists) {
        return next(new ErrorHandler("Course Already Exists!"));
    }

    await CollageSkill.create({ skillId, collageId: req.user.orgId });
    resp.status(200).json({ success: true, message: "Course Added Successfully..." });
});


// Collage - Branch Relation
Collage.belongsToMany(Skill, { through: CollageSkill, as: "branches" });
Skill.belongsToMany(Collage, { through: CollageSkill, as: "collages" });

// Collage - Course Relation
Collage.belongsToMany(Skill, { through: CollageSkill, as: "courses" });