const { Op } = require("sequelize");
const TryCatch = require("../middleware/TryCatch");
const Company = require("../models/company");
const ErrorHandler = require("../utils/errHandle");

exports.getAllCompanies = TryCatch(async (req, resp, next) => {
    const companies = await Company.findOne({ where: { status: true, } });

    resp.status(200).json({ success: true, companies });
});

exports.createComp = TryCatch(async (req, resp, next) => {
    const { title, description, type, team_size, email, mobile, locations, web, facebook, instagram, youtube, linkedin, techs, features } = req.body;
    // const logo = req.files;  // Logo Upload Pending

    const [company, created] = await Org.findOrCreate({
        where: { [Op.or]: [{ title }, { type }, { email }] },
        defaults: { description, team_size, mobile, locations, web, facebook, instagram, youtube, linkedin, techs, features }
    });
    created ? resp.status(200).json({ success: true, message: `${company.title} Created Successfully...` }) :
        resp.status(500).json({ success: false, message: `${company.title} Already Exists!` });
});