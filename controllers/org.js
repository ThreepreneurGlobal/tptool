const { rm } = require('fs');
const TryCatch = require("../middleware/TryCatch");
const Org = require("../models/org");
const User = require("../models/user");
const University = require("../models/university");
const ErrorHandler = require("../utils/errHandle");
const CollageSkill = require("../models/collageSkill");
const Skill = require("../models/skill");
const Company = require("../models/company");
const CollageCompany = require("../models/collageCompany");

// Org.sync({ alter: true, force: true });

//Super Admin Controls
exports.createCollage = TryCatch(async (req, resp, next) => {
    const { title, reg_no, city, pin_code, email, universityId } = req.body;

    const [collage, created] = await Org.findOrCreate({
        where: { reg_no },
        defaults: { city, pin_code, email, universityId, title }
    });
    created ? resp.status(200).json({ success: true, message: `${collage.title?.toUpperCase()} Created Successfully...` }) :
        resp.status(500).json({ success: false, message: `${collage.title?.toUpperCase()} Already Exists!` });
});

exports.getAllCollages = TryCatch(async (req, resp, next) => {
    const collages = await Org.findAll({
        where: { status: true },
        include: [
            { model: University, foreignKey: "universityId", as: "university", attributes: ["id", "title"] }
        ],
        attributes: { exclude: ["universityId"] }
    });

    resp.status(200).json({ success: true, collages: collages.reverse() });
});

exports.getCollageById = TryCatch(async (req, resp, next) => {
    const collage = await Org.findOne({
        where: { status: true, id: req.params.id },
        include: [
            { model: University, foreignKey: "universityId", as: "university", attributes: ["title", "state", "id", "email", "logo"] },
            { model: User, foreignKey: "orgId", as: "admins", attributes: ["id", "name", "email", "id_prf", "designation"], where: { status: true, role: "admin" }, required: false },
            { model: Skill, through: CollageSkill, as: "branches", attributes: ["id", "title", "short_name", "sub_category"], where: { sub_category: "branch", status: true }, required: false },
            { model: Company, through: CollageCompany, as: "companies", attributes: ["id", "title", "email", "logo", "type", "phone"], where: { status: true }, required: false },
            { model: Skill, through: CollageSkill, as: "courses", attributes: ["id", "title", "short_name", "sub_category"], where: { sub_category: ["degree", "diploma", "master"], status: true }, required: false },
        ],
        attributes: {
            exclude: ["universityId"],
        }
    });
    if (!collage) {
        return next(new ErrorHandler("Collage Not Found", 404));
    };

    resp.status(200).json({ success: true, collage });
});

exports.getDropDownCollages = TryCatch(async (req, resp, next) => {
    const apiObj = {};
    const api = await Org.findAll({ where: { status: true } });

    api.forEach((item) => {
        if (!apiObj[item.city]) {
            apiObj[item.city] = { label: item?.city?.toUpperCase(), options: [] }
        };
        apiObj[item.city].options.push({ label: item?.title?.toUpperCase(), value: item?.id });
    });
    const collages = Object.values(apiObj);
    resp.status(200).json({ success: true, collages });
});


// Admin Controls
exports.updateCollage = TryCatch(async (req, resp, next) => {
    let collage = await Org.findOne({ where: { id: req.user.orgId, status: true } });
    const { description, address, city, state, country, pin_code, phone, facebook, instagram, linkedin, youtube, web } = req.body;
    const logo = req.file && req.file.path;
    if (logo && collage.logo) {
        rm(collage.logo, () => {
            console.log("OLD IMAGE DELETED...");
        });
    };

    await collage.update({ description, address, city, state, pin_code, phone, country, facebook, instagram, linkedin, youtube, web, logo: logo ? logo : collage.logo });
    resp.status(200).json({ success: true, message: "Collage Profile Updated Successfully..." });
});

exports.myCollage = TryCatch(async (req, resp, next) => {
    const collage = await Org.findOne({
        where: { status: true, id: req.user.orgId },
        include: [
            { model: University, foreignKey: "universityId", as: "university", attributes: ["title", "id", "state", "email", "logo", "city", "country"] },
            { model: Skill, through: CollageSkill, as: "branches", where: { sub_category: "branch", status: true }, required: false },
            { model: Company, through: CollageCompany, as: "companies", required: false },
            { model: Skill, through: CollageSkill, as: "courses", where: { sub_category: ["degree", "diploma", "master"], status: true }, required: false },
        ],
    });
    if (!collage) {
        return next(new ErrorHandler("Collage Not Found!", 404));
    }

    resp.status(200).json({ success: true, collage });
});




//User to Collage Association
Org.hasMany(User, { foreignKey: "orgId", as: "students" });
User.belongsTo(Org, { foreignKey: "orgId", as: "collage" });

Org.hasMany(User, { foreignKey: "orgId", as: "admins" });

//User to Organisation Association
University.hasMany(Org, { foreignKey: "universityId", as: "collages" });
Org.belongsTo(University, { foreignKey: "universityId", as: "university" });