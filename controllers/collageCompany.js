const CollageCompany = require("../models/collageCompany");
const Collage = require("../models/org");
const Company = require("../models/company");
const TryCatch = require("../middleware/TryCatch");
const ErrorHandler = require("../utils/errHandle");

// CollageCompany.sync();

exports.addCompanyInCollage = TryCatch(async (req, resp, next) => {
    const { companyId } = req.body;

    const exists = await CollageCompany.findOne({ where: { companyId, collageId: req.user.orgId, status: true } });
    if (exists) {
        return next(new ErrorHandler("Company Already Exists!"));
    }

    await CollageCompany.create({ companyId, collageId: req.user.orgId });
    resp.status(200).json({ success: true, message: "Company Added Successfully..." });
});



// Collage - Company Relation
Collage.belongsToMany(Company, { through: CollageCompany, as: "companies" });
Company.belongsToMany(Collage, { through: CollageCompany, as: "collages" });