const { rm } = require("fs");
const TryCatch = require("../middleware/TryCatch");
const University = require("../models/university");
const User = require("../models/user");
const Collage = require("../models/org");
const ErrorHandler = require("../utils/errHandle");

// University.sync();

exports.createUniversity = TryCatch(async (req, resp, next) => {
    const { title, reg_no, city, pin_code, email, state, phone, country } = req.body;
    const logo = req.file && req.file.path;

    const [university, created] = await University.findOrCreate({
        where: { reg_no },
        defaults: { city, pin_code, email, state, country, phone, title, logo: logo ? logo : null }
    });
    created ? resp.status(200).json({ success: true, message: `${university.title?.toUpperCase()} Created Successfully...` }) :
        resp.status(500).json({ success: false, message: `${university.title?.toUpperCase()} Already Exists!` });
});

exports.updateUniversity = TryCatch(async (req, resp, next) => {
    const { description, address, phone, web, facebook, linkedin, youtube, instagram } = req.body;
    const logo = req.file && req.file.path;
    let university = await University.findOne({ where: { id: req.params.id, status: true } });
    if (!university) {
        return next(new ErrorHandler("University Not Found!", 404));
    };
    if (university.logo && logo) {
        rm(university.logo, () => { console.log("OLD FILE REMOVED SUCCESSFULLY..."); });
    };

    await university.update({ description, address, phone, web, facebook, linkedin, youtube, instagram, logo: logo ? logo : university.logo });
    resp.status(200).json({ success: true, message: `${university?.title?.toUpperCase()} Updated Successfully...`, });
});

exports.getUniversityById = TryCatch(async (req, resp, next) => {
    let university = await University.findOne({ where: { id: req.params.id, status: true } });
    if (!university) {
        return next(new ErrorHandler("University Not Found!", 404));
    };

    resp.status(200).json({ success: true, university });
});

exports.getAllUniversities = TryCatch(async (req, resp, next) => {
    let apiObj = {};
    const api = await University.findAll({
        where: { status: true },
    });
    if (api.length === 0) {
        return next(new ErrorHandler("No Universities Found", 404));
    };
    api.forEach((item) => {
        if (!apiObj[item.state]) {
            apiObj[item.state] = { label: item?.state?.toUpperCase(), options: [] };
        };
        apiObj[item.state].options.push({ label: item?.title?.toUpperCase(), value: item?.id });
    });
    const universities = Object.values(apiObj);
    resp.status(200).json({ success: true, universities });
});

exports.getGenAllUni = TryCatch(async (req, resp, next) => {
    const universities = await University.findAll({
        where: { status: true },
        include: [
            { model: Collage, foreignKey: "universityId", as: "collages", attributes: ["title", "city", "id", "pin_code"] }
        ]
    });

    resp.status(200).json({ success: true, universities });
});