const { Op } = require("sequelize");
const TryCatch = require("../middleware/TryCatch");
const Org = require("../models/org");
const User = require("../models/user");
const University = require("../models/university");
const ErrorHandler = require("../utils/errHandle");

// Org.sync({ alter: true, force: true });

//Super Admin Controls
exports.createCollage = TryCatch(async (req, resp, next) => {
    const { title, reg_no, city, pin_code, email, universityId } = req.body;

    const [collage, created] = await Org.findOrCreate({
        where: { [Op.or]: [{ title }, { reg_no }] },
        defaults: { city, pin_code, email, universityId }
    });
    created ? resp.status(200).json({ success: true, message: `${collage.title} Created Successfully...` }) :
        resp.status(500).json({ success: false, message: `${collage.title} Already Exists!` });
});

exports.getAllCollages = TryCatch(async (req, resp, next) => {
    const collages = await Org.findAll({
        where: { status: true },
        include: [
            { model: University, foreignKey: "universityId", as: "university", attributes: ["id", "title"] }
        ],
        attributes: { exclude: ["universityId"] }
    });
    if (collages.length === 0) {
        return next(new ErrorHandler("No Collages Found", 404));
    };

    resp.status(200).json({ success: true, collages: collages.reverse() });
});


// Admin Controls
exports.myCollage = TryCatch(async (req, resp, next) => {
    const collage = await Org.findOne({ where: { id: req.user.orgId, status: true } });

    resp.status(200).json({ success: true, collage });
});

exports.updateCollage = TryCatch(async (req, resp, next) => {
    let collage = await Org.findOne({ where: { id: req.user.orgId, status: true } });
    const { description, address, city, state, pin_code, phone, email, branches } = req.body;

    await collage.update({ description, address, city, state, pin_code, phone, email, branches });
    resp.status(200).json({ success: true, message: "Collage Profile Updated Successfully..." });
});

//User to Collage Association
Org.hasMany(User, { foreignKey: "orgId", as: "students" });
User.belongsTo(Org, { foreignKey: "orgId", as: "collage" });

//User to Organisation Association
University.hasMany(Org, { foreignKey: "universityId", as: "collages" });
Org.belongsTo(University, { foreignKey: "universityId", as: "university" });