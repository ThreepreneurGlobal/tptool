import fs from 'fs';
import { Sequelize } from 'sequelize';

import Company from '../models/company.js';
import PlacePosition from '../models/place_position.js';
import PositionSkill from '../models/position_skill.js';
import Placement from '../models/placement.js';
import Skill from '../models/skill.js';
import User from '../models/user.js';
import TryCatch, { ErrorHandler } from '../utils/trycatch.js';



export const getPlacements = TryCatch(async (req, resp, next) => {
    const placements = await Placement.findAll({
        where: { status: true, },
        include: [
            {
                model: PlacePosition, foreignKey: 'placement_id', as: 'positions', attributes: ['id', 'title'],
                include: [{
                    model: Skill, as: 'skills', required: false, attributes: ['id', 'title'],
                    through: { model: PositionSkill, attributes: ['id'] }
                }]
            },
        ]
    });

    if (placements.length <= 0) {
        return next(new ErrorHandler('Placements Not Found!', 404));
    };

    resp.status(200).json({ success: true, placements });
});


export const getPlacementById = TryCatch(async (req, resp, next) => {
    const placement = await Placement.findOne({
        where: { status: true, id: req.params.id },
        include: [
            { model: User, foreignKey: 'user_id', as: 'user', attributes: ['id', 'name'] },
            {
                model: Company, foreignKey: 'company_id', as: 'company',
                attributes: ['id', 'title', 'phone', 'email', 'web', 'logo']
            },
            {
                model: PlacePosition, foreignKey: 'placement_id', as: 'positions', attributes: ['id', 'title', 'type'],
                include: [{
                    model: Skill, through: { model: PositionSkill, attributes: ['id'] },
                    as: 'skills', required: false, attributes: ['id', 'title', 'category'],
                }],
            },
        ]
    });

    if (!placement) {
        return next(new ErrorHandler('Placement Not Found!', 404));
    };

    resp.status(200).json({ success: true, placement });
});


export const createPlacement = TryCatch(async (req, resp, next) => {
    const {
        title, type, exp_opening, place_status, status_details, selection_details, criteria, other_details,
        contact_per, company_contact, reg_sdate, reg_edate, reg_stime, reg_etime, rereg_edate, rereg_etime,
        reg_details, ctc, stipend, add_comment, history, company_id, positions,
    } = req.body;
    const attach_student = req.files?.['attach_student']?.[0]?.path || null;
    const attach_tpo = req.files?.['attach_tpo']?.[0]?.path || null;

    const placement = await Placement.create({
        title, type, exp_opening, place_status, status_details, selection_details, criteria, other_details,
        contact_per, company_contact, reg_sdate, reg_edate, reg_stime, reg_etime, rereg_edate, rereg_etime,
        reg_details, ctc, stipend, add_comment, history, company_id: Number(company_id),
        attach_student: attach_student ? attach_student : null, attach_tpo: attach_tpo ? attach_tpo : null,
    });

    if (!placement) {
        return next(new ErrorHandler('Placement Not Created!', 500));
    };

    if (Array.isArray(positions) && positions.length > 0) {
        await Promise.all(positions.map(async (position) => {
            const { title, type, skills } = position;
            const placePosition = await PlacePosition.create({ title, type, placement_id: placement.id, company_id: Number(company_id) });
            if (!placePosition) {
                return new ErrorHandler('Placement Position Not Created!', 400);
            };

            const uniqueSkillIds = [...new Set(skills)].filter(skill => Number.isInteger(Number(skill)));
            if (uniqueSkillIds.length > 0) {
                await Promise.all(uniqueSkillIds.map(async (skill) => {
                    await PositionSkill.create({ skill_id: Number(skill), placement_id: placement.id, position_id: placePosition?.id });
                }));
            };
        }));
    };

    resp.status(201).json({ success: true, message: 'Placement Created...' });
});


export const editPlacement = TryCatch(async (req, resp, next) => {
    const {
        title, type, exp_opening, place_status, status_details, selection_details, criteria, other_details,
        contact_per, company_contact, reg_sdate, reg_edate, reg_stime, reg_etime, rereg_edate, rereg_etime,
        reg_details, ctc, stipend, add_comment, history, company_id, positions,
    } = req.body;
    const attach_student = req.files['attach_student'] && req.files['attach_student'][0].path;
    const attach_tpo = req.files['attach_tpo'] && req.files['attach_tpo'][0].path;

    const placement = await Placement.findOne({
        where: { id: req.params.id, status: true, },
    });
    if (!placement) {
        return next(new ErrorHandler('Placement Not Found!', 404));
    };

    if (placement?.attach_tpo && attach_tpo) {
        fs.rm(placement?.attach_tpo, () => console.log('ATTACT TPO OLD FILE DELETED!'));
    };
    if (placement?.attach_student && attach_student) {
        fs.rm(placement?.attach_student, () => console.log('ATTACT STUDENT OLD FILE DELETED!'));
    };

    await placement.update({
        title, type, exp_opening, place_status, status_details, selection_details, criteria, other_details,
        contact_per, company_contact, reg_sdate, reg_edate, reg_stime, reg_etime, rereg_edate, rereg_etime,
        reg_details, ctc, stipend, add_comment, history, company_id: Number(company_id), attach_tpo: attach_tpo ? attach_tpo :
            placement?.attach_tpo, attach_student: attach_student ? attach_student : placement?.attach_student,
    });

    // Position
    const existPositions = await PlacePosition.findAll({ where: { status: true, placement_id: placement?.id } });
    if (Array.isArray(positions) && positions.length > 0) {
        for (const position of positions) {
            const { title, type, skills } = position;
            const exist = existPositions?.find(p => p?.id === position?.id);
            if (exist) {
                await exist.update({ title, type });

                //Skill
                const existSkills = await PositionSkill.findAll({ where: { placement_id: placement.id, position_id: position?.id, status: true } });
                const existSkillIds = existSkills?.map(skill => skill?.skill_id);
                const skillToRemove = existSkills.filter(skill => !skills?.include(skill?.skill_id));

                for (const skill of skillToRemove) {
                    await skill.destroy();
                };

                const skillToAdd = skills?.filter(skill => !existSkillIds?.includes(skill));
                for (const skill of skillToAdd) {
                    await PositionSkill.create({ skill_id: skill, placement_id: placement.id, position_id: position?.id });
                };
            } else {
                // New Placement Position
                const placePosition = await PlacePosition.create({ title, type, placement_id: placement.id, company_id: Number(company_id) });
                if (!placePosition) {
                    return new ErrorHandler('Placement Position Not Created!', 400);
                };

                const uniqueSkillIds = [...new Set(skills)].filter(skill => Number.isInteger(Number(skill)));
                if (uniqueSkillIds.length > 0) {
                    await Promise.all(uniqueSkillIds.map(async (skill) => {
                        await PositionSkill.create({ skill_id: Number(skill), placement_id: placement.id, position_id: placePosition?.id });
                    }));
                };
            };
        };
    };

    const positionsToDelete = existPositions?.filter(p => !positions?.some(pos => pos?.id === p?.id));
    for (const position of positionsToDelete) {
        const skills = await PositionSkill.findAll({ where: { status: true, position_id: position?.id } });
        for (const skill of skills) {
            const deleteSkill = await skill.destroy();
            if (!deleteSkill) return new ErrorHandler('Placement Position Skill Not Deleted!', 400);
        };
        const deletePosition = await position.destroy();
        if (!deletePosition) return new ErrorHandler('Placement Position Not Deleted!', 400);
    };
});


export const getStatusOpts = TryCatch(async (req, resp, next) => {
    const data = await Placement.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('place_status')), 'place_status']], raw: true,
    });

    const status_opts = data?.filter(item => item?.place_status !== null && item?.place_status !== '')
        .map(item => ({
            label: item?.place_status?.toUpperCase(),
            value: item?.place_status
        }));

    resp.status(200).json({ success: true, status_opts });
});


export const getDriveOpts = TryCatch(async (req, resp, next) => {
    const data = await Placement.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('type')), 'type']], raw: true,
    });

    const types = data?.filter(item => item?.type !== null && item?.type !== '')
        .map(item => ({ label: item?.type?.toUpperCase(), value: item?.type }));

    resp.status(200).json({ success: true, types });
});


export const getPositionOpts = TryCatch(async (req, resp, next) => {
    const data = await PlacePosition.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('type')), 'type']], raw: true,
    });

    const types = data?.filter(item => item?.type !== null && item?.type !== '')
        .map(item => ({ label: item?.type?.toUpperCase(), value: item?.type }));

    resp.status(200).json({ success: true, types });
});



// Placement-Position Relation
Placement.hasMany(PlacePosition, { foreignKey: 'placement_id', as: 'positions' });
PlacePosition.belongsTo(Placement, { foreignKey: 'placement_id', as: 'placement' });

// Placement-User Relation
Placement.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Placement, { foreignKey: 'user_id', as: 'placements' });