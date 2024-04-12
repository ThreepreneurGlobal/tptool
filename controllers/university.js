const { Op } = require("sequelize");
const TryCatch = require("../middleware/TryCatch");
const University = require("../models/university");
const User = require("../models/user");
const Collage = require("../models/org");
const ErrorHandler = require("../utils/errHandle");

// University.sync();

exports.createUniversity = TryCatch(async (req, resp, next) => {
    const { title, reg_no, city, pin_code, email, state, phone } = req.body;

    const [university, created] = await University.findOrCreate({
        where: { [Op.or]: [{ title }, { reg_no }] },
        defaults: { city, pin_code, email, state, phone }
    });
    created ? resp.status(200).json({ success: true, message: `${university.title} Created Successfully...` }) :
        resp.status(500).json({ success: false, message: `${university.title} Already Exists!` });
});

exports.updateUniversity = TryCatch(async (req, resp, next) => {
    const { city, pin_code, email, state, phone } = req.body;
    let university = await University.findOne({ where: { id: req.params.id, status: true } });
    if (!university) {
        return next(new ErrorHandler("University Not Found!", 404));
    };

    await university.update({ city, pin_code, email, state, phone });
    resp.status(200).json({ success: true, message: `${university.title} Updated Successfully...` });
});

exports.getAllUniversities = TryCatch(async (req, resp, next) => {
    let apiObj = {};
    const api = await University.findAll({
        where: { status: true },
        // include: [
        //     { model: Collage, foreignKey: "universityId", as: "collages", attributes: ["title", "city", "id", "pin_code"] }
        // ]
    });
    if (api.length === 0) {
        return next(new ErrorHandler("No Universities Found", 404));
    };
    api.forEach((item) => {
        if (!apiObj[item.state]) {
            apiObj[item.state] = { label: item.state.toUpperCase(), options: [] };
        };
        apiObj[item.state].options.push({ label: item.title, value: item.id });
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