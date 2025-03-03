import fs from 'fs';
import { Sequelize, where } from 'sequelize';

import Company from '../../models/company.js';
import PlacePosition from '../../models/place_position.js';
import PositionSkill from '../../models/position_skill.js';
import Placement from '../../models/placement.js';
import Skill from '../../models/skill.js';
import User from '../../models/user.js';
import TryCatch, { ErrorHandler } from '../../utils/trycatch.js';
import { getPlaceDriveOpts, getPlacePositionOpts, getPlaceStatusOpts } from '../../utils/opt/place.js';
import { getSkillsOpts } from '../../utils/opt/skill.js';
import { getCompanyOpts } from '../../utils/opt/company.js';



export const getPlacements = TryCatch(async (req, resp, next) => {
    const placements = await Placement.findAll({
        where: { status: true, }, order: [['created_at', 'DESC']],
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


export const getPlacementById = TryCatch(async (req, resp, next) => {
    const placement = await Placement.findOne({
        where: { status: true, id: req.params.id },
        include: [
            { model: User, foreignKey: 'user_id', as: 'user', attributes: ['id', 'name'], },
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


export const createPlacement = TryCatch(async (req, resp, next) => {
    const {
        title, type, place_status, status_details, selection_details, criteria, other_details,
        contact_per, company_contact, reg_sdate, reg_edate, reg_stime, reg_etime, rereg_edate, rereg_etime,
        reg_details, ctc, stipend, add_comment, history, company_id, positions,
    } = req.body;
    const attach_student = req.files?.['attach_student']?.[0]?.path || null;
    const attach_tpo = req.files?.['attach_tpo']?.[0]?.path || null;

    const placement = await Placement.create({
        title, type, place_status, status_details, selection_details, criteria, other_details,
        contact_per, company_contact, reg_sdate, reg_edate, reg_stime, reg_etime, rereg_edate, rereg_etime,
        reg_details, ctc, stipend, add_comment, history, company_id: Number(company_id),
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


export const editPlacement = TryCatch(async (req, resp, next) => {
    const {
        title, type, place_status, status_details, selection_details, criteria, other_details,
        contact_per, company_contact, reg_sdate, reg_edate, reg_stime, reg_etime, rereg_edate, rereg_etime,
        reg_details, ctc, stipend, add_comment, history, company_id, positions,
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
        title, type, place_status, status_details, selection_details, criteria, other_details,
        contact_per, company_contact, reg_sdate, reg_edate, reg_stime, reg_etime, rereg_edate, rereg_etime,
        reg_details, ctc, stipend, add_comment, history, company_id: Number(company_id), attach_tpo: attach_tpo ? attach_tpo :
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
                    const existingSkills = await PositionSkill.findAll({ where: { position_id: existPosition?.id, status: true } });
                    const existingSkillIds = existingSkills?.map(skill => skill?.skill_id);
                    const newSkillIds = [...new Set(skills)]?.filter(skill => Number.isInteger(Number(skill)));

                    const skillsToRemove = existingSkills?.filter(skill => !newSkillIds?.includes(skill?.skill_id));
                    for (const skill of skillsToRemove) {
                        await skill.update({ status: false });
                    };

                    const skillsToAdd = newSkillIds?.filter(skill => !existingSkillIds?.includes(skill));
                    for (const skill of skillsToAdd) {
                        await PositionSkill.upsert({
                            skill_id: Number(skill), placement_id: placement?.id, position_id: Number(existPosition?.id)
                        });
                    };
                };
            } else {
                const newPosition = await PlacePosition.create({
                    title, type, opening, placement_id: placement?.id, company_id: Number(company_id),
                });
                if (!newPosition) {
                    // return next(new ErrorHandler('PLACEMENT POSITION NOT CREATED!', 400));
                    return;
                };

                for (const skill of skills) {
                    await PositionSkill.upsert({
                        skill_id: Number(skill), placement_id: Number(placement?.id), position_id: Number(newPosition?.id),
                    });
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


export const getPlaceOptions = TryCatch(async (req, resp, next) => {
    const [statuses, drives, position_types, skills, companies] = await Promise.all([
        getPlaceStatusOpts(), getPlaceDriveOpts(), getPlacePositionOpts(), getSkillsOpts(), getCompanyOpts()
    ]);

    const place_options = { statuses, drives, position_types, skills, companies };
    resp.status(200).json({ success: true, place_options });
});



// Placement-Position Relation
Placement.hasMany(PlacePosition, { foreignKey: 'placement_id', as: 'positions' });
PlacePosition.belongsTo(Placement, { foreignKey: 'placement_id', as: 'placement' });

// Placement-User Relation
Placement.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Placement, { foreignKey: 'user_id', as: 'placements' });