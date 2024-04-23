const TryCatch = require("../middleware/TryCatch");
const Company = require("../models/company");
const ErrorHandler = require("../utils/errHandle");

// Company.sync({ alter: true, force: true });

exports.getAllCompanies = TryCatch(async (req, resp, next) => {
    const companies = await Company.findAll({
        where: { status: true },
        attributes: ["id", "title", "email", "locations", "reg_no", "type",]
    });

    resp.status(200).json({ success: true, companies });
});

exports.getAllDDCompanies = TryCatch(async (req, resp, next) => {
    let apiObj={};
    const api = await Company.findAll({
        where: { status: true },
        attributes: ["id", "title", "type",]
    });
    if (api.length === 0) {
        return next(new ErrorHandler("Companies Not Found!", 404));
    };
    api.forEach((item) => {
        if (!apiObj[item.type]) {
            apiObj[item.type] = { label: item.type.toUpperCase(), options: [] }
        };
        apiObj[item.type].options.push({ label: item.title.toUpperCase(), value: item.id });
    });
    const companies = Object.values(apiObj);
    resp.status(200).json({ success: true, companies });
});

exports.createComp = TryCatch(async (req, resp, next) => {
    const { title, description, reg_no, address, city, state, country, pin_code, phone, email, type,
        sub_type, team_size, web, facebook, linkedin, instagram, youtube, locations, features } = req.body;
    // const logo = req.files;  // Logo Upload Pending

    const [company, created] = await Company.findOrCreate({
        where: { reg_no },
        defaults: {
            title, description, address, city, state, country, pin_code, phone, email, type,
            sub_type, team_size, web, facebook, linkedin, instagram, youtube, locations, features
        }
    });

    created ? resp.status(200).json({ success: true, message: `${company.title} Created Successfully...` }) :
        resp.status(500).json({ success: false, message: `${company.title} Already Exists!` });
});


exports.getCompById = TryCatch(async (req, resp, next) => {
    const company = await Company.findOne({ where: { status: true, id: req.params.id } });
    if (!company) {
        return next(new ErrorHandler("Company Not Found!", 404));
    };

    resp.status(200).json({ success: true, company });
});

exports.addLocationCompany = TryCatch(async (req, resp, next) => {
    const { locations } = req.body;
    let company = await Company.findOne({ where: { status: true, id: req.params.id } });
    if (!company) {
        return next(new ErrorHandler("Company Not Found!", 404));
    };

    for (const item of locations) {
        const existLoc = company.locations.find(loc => (
            loc.city === item.city && loc.state === item.state
        ));
        if (existLoc) { return next(new ErrorHandler("Location Already Exists!", 404)); };
    };

    company.locations = company.locations.concat(locations);
    await company.save();
    resp.status(200).json({ success: true, message: "Location Added in Company Successfully..." });
});


exports.removeLocation = TryCatch(async (req, resp, next) => {
    const { city, state } = req.body;
    let company = await Company.findOne({ where: { status: true, id: req.params.id } });
    if (!company) {
        return next(new ErrorHandler("Company Not Found!", 404));
    };

    company.locations = company.locations.filter(loc => (
        loc.city !== city || loc.state !== state
    ));
    await company.save();
    resp.status(200).json({ success: true, message: "Location Removed in Company Successfully..." });
});


exports.updateCompany = TryCatch(async (req, resp, next) => {
    const { description, address, city, state, country, pin_code, phone, email, type,
        sub_type, team_size, web, facebook, linkedin, instagram, youtube } = req.body;
    let company = await Company.findOne({ where: { status: true, id: req.params.id } });
    if (!company) {
        return next(new ErrorHandler("Company Not Found!", 404));
    };

    await company.update({
        description, address, city, state, country, pin_code, phone, email, type,
        sub_type, team_size, web, facebook, linkedin, instagram, youtube
    });
    resp.status(200).json({ success: true, message: "Company Updated Successfully..." });
});