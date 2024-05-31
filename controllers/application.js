const TryCatch = require("../middleware/TryCatch");
const Application = require("../models/aplication");
const Company = require("../models/company");
const Org = require("../models/org");
const PlacePosition = require("../models/placePosition");
const Placement = require("../models/placement");
const Skill = require("../models/skill");
const Student = require("../models/student");
const User = require("../models/user");
const ErrorHandler = require("../utils/errHandle");

// Application.sync({ alter: true, force: true });


exports.getAllApps = TryCatch(async (req, resp, next) => {
    const apps = await Application.findAll({
        where: { status: true },
        include: [
            {
                model: Placement, foreignKey: "placementId", as: "placement", attributes: ["id", "title", "type", "exp_opening", "rereg_edate"], include: [
                    { model: PlacePosition, foreignKey: "placementId", as: "positions", attributes: ["id", "title"] }
                ]
            },
            { model: Company, foreignKey: "compId", as: "company", attributes: ["id", "title"] },
            { model: User, foreignKey: "userId", as: "user", attributes: ["id", "name", "email", "mobile"] },
            { model: Org, foreignKey: "orgId", as: "collage", attributes: ["id", "title", "city", "state"] },
        ],
        attributes: ['id', 'app_status', 'status_desc']
    });

    resp.status(200).json({ success: true, apps });
});

exports.getAllCollageApps = TryCatch(async (req, resp, next) => {
    const apps = await Application.findAll({
        where: { status: true, orgId: req.user.orgId },
        include: [
            {
                model: Placement, foreignKey: "placementId", as: "placement", attributes: ["id", "title", "type", "exp_opening", "rereg_edate"], include: [{
                    model: PlacePosition, foreignKey: "placementId", as: "positions", attributes: ["id", "title"]
                }]
            },
            { model: Company, foreignKey: "compId", as: "company", attributes: ["id", "title"] },
            {
                model: User, foreignKey: "userId", as: "user", attributes: ["id", "name", "email", "id_prf"],
                include: [
                    {
                        model: Student, foreignKey: "userId", as: "student", attributes: ['id', 'experience'],
                        include: [
                            { model: Skill, foreignKey: "branchId", as: "branch", attributes: ['id', 'short_name'], where: { sub_category: "branch" } },
                            { model: Skill, foreignKey: "courseId", as: "course", attributes: ['id', 'short_name'], where: { sub_category: ["degree", "master", "diploma"] } },
                        ]
                    }
                ]
            },
        ],
        attributes: ['id', 'app_status', 'status_desc'],
    });

    resp.status(200).json({ success: true, apps });
});

exports.getMyApps = TryCatch(async (req, resp, next) => {
    const apps = await Application.findAll({ where: { userId: req.user.id, status: true } });

    resp.status(200).json({ success: true, apps });
});

exports.getApplicationById = TryCatch(async (req, resp, next) => {
    const application = await Application.findOne({
        where: { id: req.params.id, status: true },
        include: [
            {
                model: Placement, foreignKey: "placementId", as: "placement", attributes: ['id', 'title', 'type'],
                include: [
                    { model: PlacePosition, foreignKey: "placementId", as: "positions", attributes: ["id", "title"] },
                ]
            },
            { model: Company, foreignKey: "compId", as: "company", attributes: ["id", "title", "locations", "type", "logo"] },
            {
                model: User, foreignKey: "userId", as: "user", attributes: ["id", "name", "email", "id_prf"],
                include: [
                    {
                        model: Student, foreignKey: "userId", as: "student", attributes: ['id', 'experience'],
                        include: [
                            { model: Skill, foreignKey: "branchId", as: "branch", attributes: ['id', 'short_name'], where: { sub_category: "branch" } },
                            { model: Skill, foreignKey: "courseId", as: "course", attributes: ['id', 'short_name'], where: { sub_category: ["degree", "master", "diploma"] } },
                        ]
                    }
                ]
            },
        ],
        attributes: { exclude: ["compId", "placementId"] }
    });
    if (!application) {
        return next(new ErrorHandler("Applications Not Found!", 404));
    };

    resp.status(200).json({ success: true, application });
});

exports.applyApp = TryCatch(async (req, resp, next) => {
    const { placementId, compId, positionId } = req.body;
    const existApp = await Application.findOne({ where: { positionId, userId: req.user.id } });
    if (existApp) {
        return next(new ErrorHandler("Application Already Exists!", 403));
    };

    await Application.create({ placementId, compId, positionId, userId: req.user.id, orgId: req.user.orgId });
    resp.status(201).json({ success: true, message: "Applied Application Successfully..." });
});

exports.updateApp = TryCatch(async (req, resp, next) => {
    const { app_status, status_desc } = req.body;
    const application = await Application.findOne({ where: { id: req.params.id, status: true }, });
    if (!application) {
        return next(new ErrorHandler("Applications Not Found!", 404));
    };

    await application.update({ app_status, status_desc });
    resp.status(200).json({ success: true, message: "Application Updated Successfully..." });
});

exports.jobOffers = TryCatch(async (req, resp, next) => {
    const applications = await Application.findAll({
        where: { status: true, app_status: 'offers' }, attributes: ['id', 'app_status', 'status_desc', 'status'],
        include: [
            {
                model: Placement, foreignKey: "placementId", as: "placement", attributes: ['id', 'title'], required: true,
                include: [{
                    model: PlacePosition, foreignKey: "placementId", as: "positions",
                    attributes: ['id', 'title', 'type'], where: { type: 'job', status: true }, required: true
                }]
            },
            { model: User, foreignKey: "userId", as: "user", attributes: ['id', 'name', 'email'] },
            { model: Company, foreignKey: "compId", as: "company", attributes: ['id', 'title', 'email'] }
        ]
    });

    resp.status(200).json({ success: true, applications });
});

exports.internOffers = TryCatch(async (req, resp, next) => {
    const applications = await Application.findAll({
        where: { status: true, app_status: 'offers' }, attributes: ['id', 'app_status', 'status_desc', 'status'],
        include: [
            {
                model: Placement, foreignKey: "placementId", as: "placement", attributes: ['id', 'title'], required: true,
                include: [{
                    model: PlacePosition, foreignKey: "placementId", as: "positions",
                    attributes: ['id', 'title', 'type'], where: { type: 'intern', status: true }, required: true
                }]
            },
            { model: User, foreignKey: "userId", as: "user", attributes: ['id', 'name', 'email'] },
            { model: Company, foreignKey: "compId", as: "company", attributes: ['id', 'title', 'email'] }
        ]
    });

    resp.status(200).json({ success: true, applications });
});


// Association Application and Placement
Application.belongsTo(Placement, { foreignKey: "placementId", as: "placement" });
Placement.hasMany(Application, { foreignKey: "placementId", as: "apps" });

// Association Application and Company
Application.belongsTo(Company, { foreignKey: "compId", as: "company" });
Company.hasMany(Application, { foreignKey: "compId", as: "apps" });

// Association Application and User
Application.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(Application, { foreignKey: "userId", as: "apps" });

// Association Application and Collage
Application.belongsTo(Org, { foreignKey: "orgId", as: "collage" });
Org.hasMany(Application, { foreignKey: "orgId", as: "apps" });