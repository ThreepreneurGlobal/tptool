const TryCatch = require("../middleware/TryCatch");
const DocumentModel = require("../models/document");
const Skill = require("../models/skill");
const UserSkill = require("../models/studentSkill");
const User = require("../models/user");
const ErrorHandler = require("../utils/errHandle");

// UserSkill.sync({ force: true, alter: true });


exports.addSkill = TryCatch(async (req, resp, next) => {
    const { skillIds } = req.body;
    if (!Array.isArray(skillIds)) {
        return next(new ErrorHandler("SELECT AT LEAST ONE SKILL!", 203));
    };

    //Check Existing Courses
    const existSkill = await UserSkill.findAll({ where: { skillId: skillIds, orgId: req.user.orgId, status: true, userId: req.user.id } });
    if (existSkill.length > 0) {
        return next(new ErrorHandler("Skill Already Exists!", 400));
    }
    // Skill Id's
    const existIds = existSkill.map((item) => item.skillId);
    // Create New Skill after Checking Existing Id's
    const newSkills = skillIds.filter(skillId => !existIds.includes(skillId));

    await Promise.all(newSkills.map(async (skillId) => {
        try {
            const existingSkill = await UserSkill.findOne({ where: { skillId, orgId: req.user.orgId, status: true, userId: req.user.id } });
            if (!existingSkill) {
                return UserSkill.create({ skillId, orgId: req.user.orgId, userId: req.user.id });
            };
        } catch (error) {
            console.error(error.message);
        }
    }));

    resp.status(201).json({ success: true, message: 'SKILLS ADDED SUCCESSFULLY...' });
});


// Student and Skill Association
Skill.belongsToMany(User, { through: UserSkill, as: "users" });
User.belongsToMany(Skill, { through: UserSkill, as: "skills" });