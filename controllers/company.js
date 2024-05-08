const { rm } = require("fs");
const TryCatch = require("../middleware/TryCatch");
const CollageCompany = require("../models/collageCompany");
const Company = require("../models/company");
const CompanySkill = require("../models/companySkill");
const Skill = require("../models/skill");
const ErrorHandler = require("../utils/errHandle");

// Company.sync({ alter: true, force: true });
// CollageCompany.sync({ alter: true, force: true });
// CompanySkill.sync({ force: true, alter: true });

exports.getAllCompanies = TryCatch(async (req, resp, next) => {
    const companies = await Company.findAll({
        where: { status: true },
        attributes: ["id", "title", "email", "locations", "reg_no", "type",]
    });

    resp.status(200).json({ success: true, companies });
});

exports.getAllDDCompanies = TryCatch(async (req, resp, next) => {
    let apiObj = {};
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
        sub_type, team_size, web, facebook, linkedin, instagram, youtube, locations, features, skillIds } = req.body;
    const logo = req.file.path;  // Logo Upload Pending

    const [company, created] = await Company.findOrCreate({
        where: { reg_no },
        defaults: {
            title, description, address, city, state, country, pin_code, phone, email, type,
            sub_type, team_size, web, facebook, linkedin, instagram, youtube, locations, features,
            userId: req.user.id, orgId: req.user.orgId, logo,
        }
    });

    if (company) {
        // Remove Duplicate from SkillID's Array
        const uniqueSkillIds = [...new Set(skillIds)];
        await Promise.all(uniqueSkillIds.map(async (skillId) => {
            try {
                await CompanySkill.create({ skillId, companyId: company.id, userId: req.user.id });
            } catch (error) {
                console.error(error.message);
            }
        }));
    };

    // Only for Collage Admin
    if (req.user.role === "admin") {
        await CollageCompany.create({ companyId: company.id, collageId: req.user.orgId });
    };

    created ? resp.status(200).json({ success: true, message: `${company.title?.toUpperCase()} Created Successfully...` }) :
        resp.status(500).json({ success: false, message: `${company.title?.toUpperCase()} Already Exists!` });
});


exports.getCompById = TryCatch(async (req, resp, next) => {
    const company = await Company.findOne({
        where: { status: true, id: req.params.id },
        include: [
            { model: Skill, through: CompanySkill, as: "skills", attributes: ["id", "title", "short_name"] }
        ]
    });
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
        if (existLoc) { return next(new ErrorHandler("Location Already Exists!", 403)); };
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
    const { description, address, city, state, country, pin_code, phone, email, type, sub_type,
        team_size, web, facebook, linkedin, instagram, youtube, locations, features, skillIds } = req.body;
        const logo = req.file.path;
    let company = await Company.findOne({ where: { status: true, id: req.params.id } });
    if (!company) {
        return next(new ErrorHandler("Company Not Found!", 404));
    };
    if(logo && company.logo){
        rm(company.logo, ()=>{
            console.log("OLD FILE REMOVED SUCCESSFULLY...");
        });
    };

    await company.update({
        description, address, city, state, country, pin_code, phone, email, type, logo,
        sub_type, team_size, web, facebook, linkedin, instagram, youtube, locations, features
    });

    const uniqueSkillIds = [...new Set(skillIds)];
    const existSkills = await CompanySkill.findAll({ where: { companyId: company.id } });
    const existSkillIds = existSkills.map((skill) => skill.id);

    const skillToAdd = uniqueSkillIds.filter(skillId => !existSkillIds.includes(skillId));
    const skillToRemove = uniqueSkillIds.filter(skillId => !uniqueSkillIds.includes(skillId));

    await Promise.all(skillToAdd.map(async (skillId) => {
        try {
            await CompanySkill.create({ skillId, companyId: company.id, userId: req.user.id });
        } catch (error) {
            console.error(error.message);
        }
    }));
    await CompanySkill.destroy({ where: { skillId: skillToRemove, companyId: company.id } });
    resp.status(200).json({ success: true, message: "Company Updated Successfully..." });
});


// Company and Skills Associations 
Company.belongsToMany(Skill, { through: CompanySkill, as: "skills" });
Skill.belongsToMany(Company, { through: CompanySkill, as: "companies" });