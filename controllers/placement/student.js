import { Op } from "sequelize";
import Application from "../../models/application.js";
// import Company from "../../models/company.js";
import PlacePosition from "../../models/place_position.js";
import Placement from "../../models/placement.js";
import PositionSkill from "../../models/position_skill.js";
// import Skill from "../../models/skill.js";
import Student from "../../models/student.js";
import User from "../../models/user.js";
import UserSkill from "../../models/user_skill.js";
import TryCatch, { ErrorHandler } from "../../utils/trycatch.js";


// STUDENT ALL PLACEMENTS RECORDS
export const myPlacements = TryCatch(async (req, resp, next) => {
    const user = await User.findOne({
        where: { id: req.user.id, status: true, is_active: true }, attributes: ['id', 'name', 'email'],
        include: [
            {
                model: Student, foreignKey: 'user_id', as: 'student', where: { status: true, is_active: true },
                // include: [{
                //     model: Skill, as: 'skills', required: false, attributes: ['id', 'title'],
                //     through: { model: UserSkill, attributes: ['id', 'rating'] }
                // }],
            },
        ]
    });

    const user_skill_data = await UserSkill.findAll({ where: { student_id: user?.student?.id, status: true }, attributes: ['id', 'rating', 'skill_id'] });
    const userSkillIds = await user_skill_data.map(item => item?.skill_id);

    // const userSkillIds = user?.student?.skills?.map(item => item?.id);

    const placements = await Placement.findAll({
        where: { status: true, },
        attributes: ['id', 'title', 'type', 'place_status', 'reg_start_date', 'reg_end_date', 'rereg_end_date', 'company_id'], order: [['created_at', 'DESC']],
        include: [
            {
                model: PlacePosition, foreignKey: 'placement_id', as: 'positions',
                attributes: ['id', 'title', 'opening', 'courses', 'branches', 'batches'],
                // include: [
                //     {
                //         model: Skill, as: 'skills', where: { id: { [Op.in]: userSkillIds }, status: true }, required: true,
                //         through: { model: PositionSkill, attributes: [] }, attributes: ['id', 'title'],
                //     },
                // ]
            },
            // { model: Company, foreignKey: 'company_id', as: 'company', attributes: ['id', 'title', 'web'] }
        ]
    });

    let filteredPlacements = await Promise.all(placements?.map(async (placement) => {
        const positions = await Promise.all(placement?.positions?.map(async (position) => {
            const position_skills = await PositionSkill.findAll({ where: { position_id: position?.id }, attributes: ['id', 'skill_id'] });
            const skills = await Promise.all(position_skills?.map(async (item) => {
                const skill_promise = await fetch(process.env.SUPER_SERVER + '/v1/master/skill/get/' + item?.skill_id);
                const { skill } = await skill_promise.json();
                return { id: skill?.id, title: skill?.title, category: skill?.category };
            }));

            return { ...position.toJSON(), skills };
        }));

        const comp_promise = await fetch(process.env.SUPER_SERVER + '/v1/master/company/get/' + placement?.company_id);
        const { company: { id, title, web } } = await comp_promise.json();

        return { ...placement.toJSON(), positions, company: { id, title, web } };
    }));

    // Filter placements to remove positions that have no matching skills
    filteredPlacements = filteredPlacements?.map(placement => {
        const { course, branch, batch } = user?.student;
        const batch_dt = new Date(batch);
        const filteredPositions = placement?.positions?.filter(position =>
            position?.skills?.some(skill => userSkillIds?.includes(skill?.id)) && position?.branches?.includes(branch)
            && position?.batches?.includes(batch_dt.getFullYear().toString()) && position?.courses?.includes(course)
        );

        if (filteredPositions?.length > 0) {
            return { ...placement, positions: filteredPositions, };
        };
        return null;
    }).filter(placement => placement !== null);

    resp.status(200).json({ success: true, placements: filteredPlacements });
});


// STUDENT PLACEMENT SINGLE RECORD
export const myPlaceById = TryCatch(async (req, resp, next) => {
    const user = await User.findOne({
        where: { id: req.user.id, status: true, is_active: true, }, attributes: ['id', 'name', 'email'],
        include: [
            {
                model: Student, foreignKey: 'user_id', as: 'student', where: { status: true, is_active: true },
                // include: [{
                //     model: Skill, as: 'skills', required: false, attributes: ['id', 'title'],
                //     through: { model: UserSkill, attributes: ['id', 'rating'] }
                // }]
            },
        ]
    });
    const user_skill_data = await UserSkill.findAll({ where: { student_id: user?.student?.id, status: true }, attributes: ['id', 'rating', 'skill_id'] });
    const userSkillIds = await user_skill_data.map(item => item?.skill_id);

    const placement = await Placement.findOne({
        where: { id: req.params.id, status: true, },
        attributes: ['id', 'title', 'type', 'place_status', 'company_id', 'reg_start_date', 'reg_end_date', 'rereg_end_date', 'criteria', 'attach_student', 'selection_details'],
        include: [
            {
                model: PlacePosition, foreignKey: 'placement_id', as: 'positions',
                attributes: ['id', 'title', 'opening', 'courses', 'branches', 'batches'],
                // include: [
                //     {
                //         model: Skill, as: 'skills', where: { id: { [Op.in]: userSkillIds }, status: true }, required: true,
                //         through: { model: PositionSkill, attributes: [] }, attributes: ['id', 'title'],
                //     },
                // ]
            },
            // { model: Company, foreignKey: 'company_id', as: 'company', attributes: ['id', 'title'] }
        ]
    });
    if (!placement) {
        return next(new ErrorHandler('PLACEMENT NOT FOUND!', 404));
    };

    const comp_promise = await fetch(process.env.SUPER_SERVER + '/v1/master/company/get/' + placement?.company_id);
    const { company } = await comp_promise.json();

    const positions = await Promise.all(placement?.positions?.map(async (position) => {
        const position_skills = await PositionSkill.findAll({ where: { position_id: position?.id }, attributes: ['id', 'skill_id'] });
        const skills = await Promise.all(position_skills?.map(async (item) => {
            const skill_promise = await fetch(process.env.SUPER_SERVER + '/v1/master/skill/get/' + item?.skill_id);
            const { skill } = await skill_promise.json();
            return { id: skill?.id, title: skill?.title, category: skill?.category };
        }));

        return { ...position.toJSON(), skills };
    }));

    const my_apps = await Application.findAll({
        where: { placement_id: placement?.id, user_id: req.user.id, status: true },
        attributes: ['id', 'placement_id', 'position_id', 'app_status'],
    });

    const { course, batch, branch } = user?.student;
    const batch_dt = new Date(batch);
    // Filter positions to keep only those with at least one matching skill
    const filteredPositions = positions?.filter(position =>
        position?.skills?.some(skill => userSkillIds?.includes(skill?.id)) && position?.branches?.includes(branch)
        && position?.batches?.includes(batch_dt.getFullYear().toString()) && position?.courses?.includes(course)
    );

    if (filteredPositions?.length <= 0) {
        return next(new ErrorHandler('PLACEMENT NOT FOUND!', 404));
    };

    resp.status(200).json({ success: true, placement: { ...placement.toJSON(), company, positions: filteredPositions }, my_apps });
});

