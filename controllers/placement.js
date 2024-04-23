const TryCatch = require("../middleware/TryCatch");
const Company = require("../models/company");
const Placement = require("../models/placement");
const User = require("../models/user");
const Org = require("../models/org");
const PlacePosition = require("../models/placePosition");
const PlaceSkill = require("../models/placeSkill");
const Skill = require("../models/skill");
const ErrorHandler = require("../utils/errHandle");

// Placement.sync({ force: true, alt: true });
// PlacePosition.sync({ force: true, alt: true });
// PlaceSkill.sync({ force: true, alt: true });


exports.getAllPlacements = TryCatch(async (req, resp, next) => {
    const placements = await Placement.findAll({
        where: { status: true },
        include: [
            { model: PlacePosition, foreignKey: "placementId", as: "positions", attributes: ["locations", "id", "title", "type"] },
            { model: Skill, through: PlaceSkill, as: "courses", attributes: ["id", "title", "short_name", "sub_category"] },
            { model: Company, foreignKey: "companyId", as: "company", attributes: ["id", "title"] },
            { model: Org, foreignKey: "collageId", as: "collage", attributes: ["id", "title", "city", "state"] },
        ],
        attributes: { exclude: ["userId", "companyId", "status", "created_at", "updated_at", "collageId"] }
    });

    resp.status(200).json({ success: true, placements });
});

exports.getCollagePlacement = TryCatch(async (req, resp, next) => {
    const placements = await Placement.findAll({
        where: { status: true, collageId: req.user.orgId },
        include: [
            { model: PlacePosition, foreignKey: "placementId", as: "positions", attributes: ["locations", "id", "title", "type"] },
            { model: Skill, through: PlaceSkill, as: "courses", attributes: ["id", "title"] },
            { model: Company, foreignKey: "companyId", as: "company", attributes: ["id", "title"] },
        ],
        attributes: { exclude: ["userId", "companyId", "status", "created_at", "updated_at"] }
    });

    resp.status(200).json({ success: true, placements });
});

exports.getCollagePlacementById = TryCatch(async (req, resp, next) => {
    const placement = await Placement.findOne({
        where: { id: req.params.id, status: true, collageId: req.user.orgId },
        include: [
            { model: PlacePosition, foreignKey: "placementId", as: "positions", attributes: ["locations", "id", "title", "type"] },
            { model: Skill, through: PlaceSkill, as: "courses", attributes: ["id", "title", "short_name", "sub_category"] },
            { model: Company, foreignKey: "companyId", as: "company" },
            { model: User, foreignKey: "userId", as: "admin", attributes: ["id", "name", "email"] },
        ],
    });

    resp.status(200).json({ success: true, placement });
});


exports.addPlacement = TryCatch(async (req, resp, next) => {
    const { title, type, exp_opening, place_status, status_details, selection_details, other_details,
        contact_per, company_contact, reg_stime, reg_sdate, reg_etime, reg_edate, rereg_etime, rereg_edate,
        reg_details, add_comment, history, companyId, positions, skillIds, criteria } = req.body;
    const attach_student = `${process.env.HOST_URL}/${req.files['attach_student'][0].path}`;
    const attach_tpo = `${process.env.HOST_URL}/${req.files['attach_tpo'][0].path}`;

    const placement = await Placement.create({
        title, type, exp_opening, place_status, status_details, selection_details, other_details, contact_per,
        company_contact, reg_stime, reg_sdate, reg_etime, reg_edate, rereg_etime, rereg_edate, reg_details,
        add_comment, history, criteria, companyId, userId: req.user.id, collageId: req.user.orgId, attach_student, attach_tpo,
    });

    if (placement) {
        // Positions
        try {
            for (const position of positions) {
                const { title, type, locations } = position;
                await PlacePosition.create({ title, type, locations, companyId, placementId: placement.id, userId: req.user.id });
            };
        } catch (error) {
            return next(new ErrorHandler("Position Not Added...!", 500));
        }

        // Skills
        if (!Array.isArray(skillIds)) {
            return next(new ErrorHandler("Select at Least one Course!", 203));
        };
        //Check Existing Courses
        const existCourses = await PlaceSkill.findAll({ where: { skillId: skillIds, companyId, status: true } });
        if (existCourses.length > 0) {
            return next(new ErrorHandler("Course Already Exists!", 400));
        }
        // Course Id's
        const existIds = existCourses.map((course) => course.skillId);
        // Create New Courses after Checking Existing Id's
        const newCourses = skillIds.filter(skillId => !existIds.includes(skillId));
        await Promise.all(newCourses.map(async (skillId) => {
            try {
                const existingCourse = await PlaceSkill.findOne({ where: { skillId, companyId, status: true } });
                if (!existingCourse) {
                    return PlaceSkill.create({ skillId, companyId, placementId: placement.id, userId: req.user.id });
                };
            } catch (error) {
                console.error(error.message);
            }
        }));
    };

    resp.status(201).json({ success: true, message: 'Placement Created Successfully...' });
});



// Association Placement and Positions
Placement.hasMany(PlacePosition, { foreignKey: "placementId", as: "positions" });
PlacePosition.belongsTo(Placement, { foreignKey: "placementId", as: "placements" });

//Association Placement and Company
Placement.belongsTo(Company, { foreignKey: "companyId", as: "company" });
Company.hasMany(Placement, { foreignKey: "companyId", as: "placements" });

//Association Placement and User
Placement.belongsTo(User, { foreignKey: "userId", as: "admin" });
User.hasMany(Placement, { foreignKey: "userId", as: "placements" });

//Association Placement and User
Placement.belongsTo(Org, { foreignKey: "collageId", as: "collage" });
Org.hasMany(Placement, { foreignKey: "collageId", as: "placements" });

//Association Placement to Skills
Placement.belongsToMany(Skill, { through: PlaceSkill, as: "courses" });
Skill.belongsToMany(Placement, { through: PlaceSkill, as: "placements" });