import fs from 'fs';

import Company from '../../models/company.js';
import PlacePosition from '../../models/place_position.js';
import Placement from '../../models/placement.js';
import PositionSkill from '../../models/position_skill.js';
import Skill from '../../models/skill.js';
import User from '../../models/user.js';
import { getCompanyOpts } from '../../utils/opt/company.js';
import { getPlaceCompanyOpts, getPlaceDriveOpts, getPlacePositionOpts, getPlaceStatusOpts } from '../../utils/opt/place.js';
import { getSkillsOpts } from '../../utils/opt/skill.js';
import TryCatch, { ErrorHandler } from '../../utils/trycatch.js';


// ALL PLACEMENTS RECORDS
export const getPlacements = TryCatch(async (req, resp, next) => {
    const { company_id, place_status } = req.query;
    const where = { status: true };
    if (company_id) { where.company_id = company_id; };
    if (place_status) { where.place_status = place_status; };

    const placements = await Placement.findAll({
        where, order: [['created_at', 'DESC']],
        include: [
            {
                model: PlacePosition, foreignKey: 'placement_id', as: 'positions', attributes: ['id', 'title', 'opening'],
                include: [
                    {
                        model: Skill, as: 'skills', required: false, attributes: ['id', 'title'],
                        through: { model: PositionSkill, attributes: [] }
                    },
                ]
            },
            { model: Company, foreignKey: 'company_id', as: 'company', attributes: ['id', 'title'] }
        ]
    });

    resp.status(200).json({ success: true, placements });
});


// SINGLE PLACEMENT RECORD
export const getPlacementById = TryCatch(async (req, resp, next) => {
    const placement = await Placement.findOne({
        where: { status: true, id: req.params.id },
        include: [
            { model: User, foreignKey: 'user_id', as: 'user', attributes: ['id', 'name', 'email'], where: { status: true }, },
            {
                model: Company, foreignKey: 'company_id', as: 'company', where: { status: true },
                attributes: ['id', 'title', 'phone', 'email', 'web', 'logo']
            },
            {
                model: PlacePosition, foreignKey: 'placement_id', as: 'positions', attributes: ['id', 'title', 'type', 'opening'],
                include: [{
                    model: Skill, through: { model: PositionSkill, attributes: [], where: { status: true } },
                    as: 'skills', required: false, attributes: ['id', 'title', 'category'],
                }], where: { status: true },
            },
        ]
    });

    if (!placement) {
        return next(new ErrorHandler('PLACEMENT NOT FOUND!', 404));
    };

    resp.status(200).json({ success: true, placement });
});


// CREATE PLACEMENT RECORD
export const createPlacement = TryCatch(async (req, resp, next) => {
    const {
        title, type, place_status, status_details, selection_details, criteria, other_details,
        contact_per, company_contact, reg_start_date, reg_end_date, rereg_end_date, reg_details,
        ctc, stipend, add_comment, history, company_id, positions,
    } = req.body;
    const attach_student = req.files?.['attach_student']?.[0]?.path || null;
    const attach_tpo = req.files?.['attach_tpo']?.[0]?.path || null;

    const placement = await Placement.create({
        title, type, place_status, status_details, selection_details, criteria, other_details,
        contact_per, company_contact, reg_start_date, reg_end_date, rereg_end_date, reg_details,
        ctc, stipend, add_comment, history, company_id: Number(company_id), user_id: req.user.id,
        attach_student: attach_student ? attach_student : null, attach_tpo: attach_tpo ? attach_tpo : null,
    });

    if (!placement) {
        return next(new ErrorHandler('PLACEMENT NOT CREATED!', 500));
    };

    if (Array.isArray(positions) && positions.length > 0) {
        await Promise.all(positions.map(async (position) => {
            const { title, type, skills, opening } = position;
            const placePosition = await PlacePosition.create({ title, type, opening, placement_id: placement.id, company_id: Number(company_id) });
            if (!placePosition) {
                return new ErrorHandler('PLACEMENT POSITION NOT CREATED!', 400);
            };

            const uniqueSkillIds = [...new Set(skills)].filter(skill => Number.isInteger(Number(skill)));
            if (uniqueSkillIds.length > 0) {
                await Promise.all(uniqueSkillIds.map(async (skill) => {
                    await PositionSkill.create({ skill_id: Number(skill), placement_id: placement.id, position_id: placePosition?.id });
                }));
            };
        }));
    };

    resp.status(201).json({ success: true, message: 'PLACEMENT CREATED...' });
});


// UPDATE PLACEMENT RECORD
export const editPlacement = TryCatch(async (req, resp, next) => {
    const {
        title, type, place_status, status_details, selection_details, criteria, other_details,
        contact_per, company_contact, reg_start_date, reg_end_date, rereg_end_date, reg_details,
        ctc, stipend, add_comment, history, company_id, positions,
    } = req.body;
    const attach_student = req.files['attach_student'] && req.files['attach_student'][0].path;
    const attach_tpo = req.files['attach_tpo'] && req.files['attach_tpo'][0].path;

    const placement = await Placement.findOne({
        where: { id: req.params.id, status: true, },
    });
    if (!placement) {
        return next(new ErrorHandler('PLACEMENT NOT FOUND!', 404));
    };

    if (placement?.attach_tpo && attach_tpo) {
        fs.rm(placement?.attach_tpo, () => console.log('ATTACT TPO OLD FILE DELETED!'));
    };
    if (placement?.attach_student && attach_student) {
        fs.rm(placement?.attach_student, () => console.log('ATTACT STUDENT OLD FILE DELETED!'));
    };

    await placement.update({
        title, type, place_status, status_details, selection_details, criteria, other_details, contact_per,
        company_contact, reg_start_date, reg_end_date, rereg_end_date, reg_details, ctc, stipend, add_comment,
        history, company_id: Number(company_id), attach_tpo: attach_tpo ? attach_tpo :
            placement?.attach_tpo, attach_student: attach_student ? attach_student : placement?.attach_student,
    });

    // POSITION
    if (positions) {
        const existingPositions = await PlacePosition.findAll({ where: { placement_id: placement?.id, status: true } });
        const existingPositionIds = existingPositions?.map(p => p?.id);
        const reqPositionIds = positions?.map(p => Number(p?.id)).filter(id => id !== undefined);
        const positionsToDelete = existingPositionIds?.filter(id => !reqPositionIds?.includes(id));

        for (const position of positions) {
            const { id, title, type, opening, skills = [] } = position;
            if (id) {
                const existPosition = existingPositions?.find(p => p?.id === Number(id));
                if (existPosition) {
                    await existPosition.update({ title, type, opening });

                    // SKILLS
                    const existingSkills = await PositionSkill.findAll({ where: { position_id: existPosition?.id, placement_id: placement?.id } });
                    const existTrueSkillIds = existingSkills?.filter(item => item?.status === true).map(item => item?.skill_id);
                    const existFalsSkillIds = existingSkills?.filter(item => item?.status === false).map(item => item?.skill_id);
                    const deleteSkills = existTrueSkillIds?.filter(id => !skills?.map(item => Number(item)).includes(id));
                    const newSkills = skills?.map(item => Number(item)).filter(id => !existTrueSkillIds?.includes(id)).filter(id => !existFalsSkillIds?.includes(id));

                    // MODIFY SKILL
                    for (const skill of deleteSkills) {
                        const record = await PositionSkill.findOne({ where: { skill_id: skill, position_id: existPosition?.id, placement_id: placement?.id, status: true } });
                        if (!record) return;
                        await record.update({ status: false });
                    };
                    for (const skill of newSkills) {
                        const record = await PositionSkill.create({ skill_id: skill, position_id: existPosition?.id, placement_id: placement?.id });
                        if (!record) return;
                    };
                    for (const skill of existFalsSkillIds) {
                        const record = await PositionSkill.findOne({ where: { skill_id: skill, position_id: existPosition?.id, placement_id: placement?.id, status: false } });
                        if (!record) return;
                        await record.update({ status: true });
                    };
                };
            } else {
                const newPosition = await PlacePosition.create({
                    title, type, opening, placement_id: placement?.id, company_id: Number(company_id),
                });
                if (!newPosition) return;

                for (const skill of skills) {
                    const record = await PositionSkill.upsert({
                        skill_id: Number(skill), placement_id: Number(placement?.id), position_id: Number(newPosition?.id),
                    });
                    if (!record) return;
                };
            };
        };

        for (const position of positionsToDelete) {
            await PositionSkill.update({ status: false }, { where: { position_id: position } });
            await PlacePosition.update({ status: false }, { where: { id: position } });
        };
    };

    resp.status(200).json({ success: true, message: 'PLACEMENT UPDATED...' });
});


// OPTIONS FOR CREATE PLACEMENT
export const getPlaceOptions = TryCatch(async (req, resp, next) => {
    const [statuses, drives, position_types, skills, companies] = await Promise.all([
        getPlaceStatusOpts(), getPlaceDriveOpts(), getPlacePositionOpts(), getSkillsOpts(), getCompanyOpts()
    ]);

    const place_options = { statuses, drives, position_types, skills, companies };
    resp.status(200).json({ success: true, place_options });
});


// OPTIONS FOR FILTER PLACEMENT
export const getPlaceFilterOpts = TryCatch(async (req, resp, next) => {
    const [companies, statuses] = await Promise.all([getPlaceCompanyOpts(), getPlaceStatusOpts()]);

    const filter_opts = { companies, statuses };
    resp.status(200).json({ success: true, filter_opts });
});



// Placement-Position Relation
Placement.hasMany(PlacePosition, { foreignKey: 'placement_id', as: 'positions' });
PlacePosition.belongsTo(Placement, { foreignKey: 'placement_id', as: 'placement' });

// Placement-User Relation
Placement.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Placement, { foreignKey: 'user_id', as: 'placements' });