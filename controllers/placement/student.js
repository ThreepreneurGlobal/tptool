import { Op } from "sequelize";
import Company from "../../models/company.js";
import PlacePosition from "../../models/place_position.js";
import Placement from "../../models/placement.js";
import PositionSkill from "../../models/position_skill.js";
import Skill from "../../models/skill.js";
import Student from "../../models/student.js";
import User from "../../models/user.js";
import UserSkill from "../../models/user_skill.js";
import TryCatch, { ErrorHandler } from "../../utils/trycatch.js";
import Application from "../../models/application.js";



export const myPlacements = TryCatch(async (req, resp, next) => {
    const user = await User.findOne({
        where: { id: req.user.id, status: true, is_active: true }, attributes: ['id', 'name', 'email'],
        include: [
            {
                model: Student, foreignKey: 'user_id', as: 'student', where: { status: true, is_active: true },
                include: [{
                    model: Skill, as: 'skills', required: false, attributes: ['id', 'title'],
                    through: { model: UserSkill, attributes: ['id', 'rating'] }
                }],
            },
        ]
    });
    const userSkillIds = user?.student?.skills?.map(item => item?.id);

    const placements = await Placement.findAll({
        where: { status: true, },
        attributes: ['id', 'title', 'type', 'place_status', 'reg_sdate', 'reg_edate', 'rereg_edate'], order: [['created_at', 'DESC']],
        include: [
            {
                model: PlacePosition, foreignKey: 'placement_id', as: 'positions', attributes: ['id', 'title', 'opening'],
                include: [
                    {
                        model: Skill, as: 'skills', where: { id: { [Op.in]: userSkillIds }, status: true }, required: true,
                        through: { model: PositionSkill, attributes: [] }, attributes: ['id', 'title'],
                    },
                ]
            },
            { model: Company, foreignKey: 'company_id', as: 'company', attributes: ['id', 'title', 'web'] }
        ]
    });

    // Filter placements to remove positions that have no matching skills
    const filteredPlacements = placements?.map(placement => {
        const filteredPositions = placement?.positions?.filter(position =>
            position?.skills?.some(skill => userSkillIds?.includes(skill?.id)));
        if (filteredPositions?.length > 0) {
            return { ...placement.toJSON(), positions: filteredPositions, };
        };
        return null;
    }).filter(placement => placement !== null);

    resp.status(200).json({ success: true, placements: filteredPlacements });
});


export const myPlaceById = TryCatch(async (req, resp, next) => {
    const user = await User.findOne({
        where: { id: req.user.id, status: true, is_active: true, }, attributes: ['id', 'name', 'email'],
        include: [
            {
                model: Student, foreignKey: 'user_id', as: 'student', where: { status: true, is_active: true },
                include: [{
                    model: Skill, as: 'skills', required: false, attributes: ['id', 'title'],
                    through: { model: UserSkill, attributes: ['id', 'rating'] }
                }]
            },
        ]
    });
    const userSkillIds = user?.student?.skills?.map(item => item?.id);

    const placement = await Placement.findOne({
        where: { id: req.params.id, status: true, },
        attributes: ['id', 'title', 'type', 'place_status', 'reg_sdate', 'reg_edate', 'rereg_edate', 'criteria', 'attach_student', 'selection_details'],
        include: [
            {
                model: PlacePosition, foreignKey: 'placement_id', as: 'positions', attributes: ['id', 'title', 'opening'],
                include: [
                    {
                        model: Skill, as: 'skills', where: { id: { [Op.in]: userSkillIds }, status: true }, required: true,
                        through: { model: PositionSkill, attributes: [] }, attributes: ['id', 'title'],
                    },
                ]
            },
            { model: Company, foreignKey: 'company_id', as: 'company', attributes: ['id', 'title'] }
        ]
    });
    if (!placement) {
        return next(new ErrorHandler('PLACEMENT NOT FOUND!', 404));
    };

    const my_apps = await Application.findAll({
        where: { placement_id: placement?.id, user_id: req.user.id, status: true },
        attributes: ['id', 'placement_id', 'position_id', 'app_status'],
    });

    // Filter positions to keep only those with at least one matching skill
    const filteredPositions = placement?.positions?.filter(position =>
        position?.skills?.some(skill => userSkillIds?.includes(skill?.id)));

    if (filteredPositions?.length <= 0) {
        return next(new ErrorHandler('PLACEMENT NOT FOUND!', 404));
    };

    resp.status(200).json({ success: true, placement: { ...placement.toJSON(), positions: filteredPositions }, my_apps });
});

