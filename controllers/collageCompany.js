const CollageCompany = require("../models/collageCompany");
const Collage = require("../models/org");
const Company = require("../models/company");
const TryCatch = require("../middleware/TryCatch");
const ErrorHandler = require("../utils/errHandle");

// CollageCompany.sync({ alter: true, force: true });

exports.addCompanyInCollage = TryCatch(async (req, resp, next) => {
    const { companyIds } = req.body;
    if (!Array.isArray(companyIds)) {
        return next(new ErrorHandler("Select at Least one Company!", 203));
    };

    //Check Existing Companies
    const existCompanies = await CollageCompany.findAll({ where: { companyId: companyIds, collageId: req.user.orgId, status: true } });
    if (existCompanies.length > 0) {
        return next(new ErrorHandler("Companies Already Exists!", 400));
    }
    // Company Id's
    const existIds = existCompanies.map((item) => item.companyId);
    // Create New Companies after Checking Existing Id's
    const newCompanies = companyIds.filter(item => !existIds.includes(item));

    await Promise.all(newCompanies.map(async (companyId) => {
        try {
            const existingCompany = await CollageCompany.findOne({ where: { companyId, collageId: req.user.orgId, status: true } });
            if (!existingCompany) {
                return CollageCompany.create({ companyId, collageId: req.user.orgId });
            } else {
                return next(new ErrorHandler("Company Already Exists!", 400));
            };
        } catch (error) {
            console.error(error.message);
        }
    }));

    resp.status(200).json({ success: true, message: "Company Added Successfully..." });
});



// Collage - Company Relation
Collage.belongsToMany(Company, { through: CollageCompany, as: "companies" });
Company.belongsToMany(Collage, { through: CollageCompany, as: "collages" });