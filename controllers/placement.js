const { rm } = require("fs");
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

    resp.status(200).json({ success: true, placements: placements.reverse() });
});

exports.getPlacementById = TryCatch(async (req, resp, next) => {
    const placement = await Placement.findOne({
        where: { id: req.params.id, status: true },
        include: [
            { model: PlacePosition, foreignKey: "placementId", as: "positions", attributes: ["locations", "id", "title", "type"] },
            { model: Skill, through: PlaceSkill, as: "courses", attributes: ["id", "title", "short_name", "sub_category"] },
            { model: Company, foreignKey: "companyId", as: "company" },
            { model: User, foreignKey: "userId", as: "admin", attributes: ["id", "name", "email"] },
            { model: Org, foreignKey: "collageId", as: "collage", attributes: ["id", "title", "city", "state", "phone", "email", "logo", "web"] },
        ],
    });

    resp.status(200).json({ success: true, placement });
});

exports.getCollagePlacement = TryCatch(async (req, resp, next) => {
    const placements = await Placement.findAll({
        where: { status: true, collageId: req.user.orgId, },
        include: [
            { model: PlacePosition, foreignKey: "placementId", as: "positions", attributes: ["locations", "id", "title", "type"] },
            { model: Skill, through: PlaceSkill, as: "courses", attributes: ["id", "short_name"] },
            { model: Company, foreignKey: "companyId", as: "company", attributes: ["id", "title"] },
        ],
        attributes: { exclude: ["userId", "companyId", "status", "created_at", "updated_at"] }
    });

    resp.status(200).json({ success: true, placements: placements.reverse() });
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
    const attach_student = req.files['attach_student'] && req.files['attach_student'][0].path;
    const attach_tpo = req.files['attach_tpo'] && req.files['attach_tpo'][0].path;

    const placement = await Placement.create({
        title, type, exp_opening, place_status, status_details, selection_details, other_details, contact_per,
        company_contact, reg_stime, reg_sdate, reg_etime, reg_edate, rereg_etime, rereg_edate, reg_details,
        add_comment, history, criteria, companyId, userId: req.user.id, collageId: req.user.orgId,
        attach_student: attach_student ? attach_student : null, attach_tpo: attach_tpo ? attach_tpo : null,
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

        // Remove Duplicate from SkillID's Array
        const uniqueSkillIds = [...new Set(skillIds)];
        await Promise.all(uniqueSkillIds.map(async (skillId) => {
            try {
                await PlaceSkill.create({ skillId, companyId, placementId: placement.id, userId: req.user.id });
            } catch (error) {
                console.error(error.message);
            }
        }));
    };

    resp.status(201).json({ success: true, message: 'Placement Created Successfully...' });
});

exports.updatePlacement = TryCatch(async (req, resp, next) => {
    const placement = await Placement.findOne({ where: { status: true, id: req.params.id } });
    if (!placement) {
        return next(new ErrorHandler("Placement Not Found!", 404));
    };

    const { title, type, exp_opening, place_status, status_details, selection_details, other_details,
        contact_per, company_contact, reg_stime, reg_sdate, reg_etime, reg_edate, rereg_etime, rereg_edate,
        reg_details, add_comment, history, companyId, positions, skillIds, criteria } = req.body;
    const attach_student = req.files['attach_student'] && req.files['attach_student'][0].path;
    const attach_tpo = req.files['attach_tpo'] && req.files['attach_tpo'][0].path;

    if (attach_student && placement?.attach_student) {
        rm(placement?.attach_student, () => { console.log("OLD STUDENT FILE DELETED..."); });
    };
    if (attach_tpo && placement?.attach_tpo) {
        rm(placement?.attach_tpo, () => { console.log("OLD TPO FILE DELETED..."); });
    };

    await placement.update({
        title, type, exp_opening, place_status, status_details, selection_details, other_details, contact_per,
        company_contact, reg_stime, reg_sdate, reg_etime, reg_edate, rereg_etime, rereg_edate, reg_details,
        add_comment, history, criteria, companyId, userId: req.user.id, collageId: req.user.orgId,
        attach_student: attach_student ? attach_student : placement?.attach_student,
        attach_tpo: attach_tpo ? attach_tpo : placement?.attach_tpo,
    });

    const existingPositions = await PlacePosition.findAll({ where: { placementId: placement?.id } });

    // Update, delete, or add positions based on the request
    for (const pos of positions) {
        const existPosition = existingPositions.find(p => p.id === pos.id);
        if (existPosition) {
            existPosition.title = pos.title;
            existPosition.type = pos.type;
            existPosition.locations = pos.locations;

            await existPosition.save();
        } else {
            await PlacePosition.create({
                title: pos.title, type: pos.type, locations: pos.locations,
                companyId, placementId: placement.id
            });
        };
    };

    // Delete positions that are not in the updated list
    const positionsToDelete = existingPositions.filter(p => !positions.some(pos => pos.id === p.id));
    for (const pos of positionsToDelete) {
        await pos.destroy();
    };

    // Handle skills (assuming PlaceSkill model is correctly implemented)
    const existingSkills = await PlaceSkill.findAll({ where: { placementId: placement.id } });
    const existingSkillIds = existingSkills.map(skill => skill.skillId);

    // Remove skills that are not in the updated list
    const skillToRemove = existingSkills.filter(skill => !skillIds.includes(skill.skillId));
    for (const skill of skillToRemove) {
        await skill.destroy();
    };

    // Add new skills
    const skillToAdd = skillIds.filter(skillId => !existingSkillIds.includes(skillId));
    for (const skillId of skillToAdd) {
        await PlaceSkill.create({ skillId, companyId, placementId: placement.id });
    };

    resp.status(200).json({ success: true, message: "Placement Updated Successfully..." });
});

exports.deletePlacement = TryCatch(async (req, resp, next) => {
    const placement = await Placement.findOne({ where: { status: true, id: req.params.id } });
    if (!placement) {
        return next(new ErrorHandler("Placement Not Found!", 404));
    };
    const positions = await PlacePosition.findAll({ where: { placementId: placement?.id } });
    await Promise.all(positions.map(async (position) => {
        await position.update({ status: false });
    }));

    await placement.update({ status: false });
    resp.status(200).json({ success: true, message: "Placement Deleted Successfully..." });
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

//Association Placement and Collage
Placement.belongsTo(Org, { foreignKey: "collageId", as: "collage" });
Org.hasMany(Placement, { foreignKey: "collageId", as: "placements" });

//Association Placement to Skills
Placement.belongsToMany(Skill, { through: PlaceSkill, as: "courses" });
Skill.belongsToMany(Placement, { through: PlaceSkill, as: "placements" });