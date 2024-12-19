import { Op, Sequelize } from 'sequelize';

import Company from '../models/company.js';
import CompanySkill from '../models/company_skill.js';
import PositionSkill from '../models/position_skill.js';
import PlacePosition from '../models/place_position.js';
import Skill from '../models/skill.js';
import TryCatch, { ErrorHandler } from '../utils/trycatch.js';


export const createSkill = TryCatch(async (req, resp, next) => {
    const { title, short_name, description, category, sub_category } = req.body;

    const existed = await Skill.findOne({ where: { [Op.or]: [{ title }, { short_name }, { category }] } });
    if (existed) {
        return next(new ErrorHandler('Technology Already Created!', 400));
    };

    await Skill.create({ title, short_name, description, category, sub_category });
    resp.status(201).json({ success: true, message: 'Technology Created...' });
});


export const editSkill = TryCatch(async (req, resp, next) => {
    const { title, short_name, description, category, sub_category } = req.body;

    const skill = await Skill.findOne({ where: { id: req.params.id, status: true } });
    if (!skill) {
        return next(new ErrorHandler('Technology Not Found!', 404));
    };

    await skill.update({ title, short_name, description, category, sub_category });
    resp.status(201).json({ success: true, message: 'Technology Updated...' });
});


export const getSkills = TryCatch(async (req, resp, next) => {
    const skills = await Skill.findAll({
        where: { status: true }, attributes: { exclude: ['status', 'created_at', 'updated_at'] }
    });

    if (skills.length <= 0) {
        return next(new ErrorHandler('Technologies Not Found!', 404));
    };

    resp.status(200).json({ success: true, skills });
});


export const getSkillById = TryCatch(async (req, resp, next) => {
    const skill = await Skill.findOne({ where: { id: req.params.id, status: true } });
    if (!skill) {
        return next(new ErrorHandler('Technology Not Found!', 404));
    };

    resp.status(201).json({ success: true, skill });
});


export const getSkillsOpts = TryCatch(async (req, resp, next) => {
    const apiObj = {};
    const api = await Skill.findAll({
        where: { status: true }, attributes: ['id', 'title', 'category']
    });
    if (api.length <= 0) {
        return next(new ErrorHandler('Technologies Not Found!', 404));
    };

    api?.forEach((item) => {
        if (!apiObj[item?.category]) {
            apiObj[item?.category] = { label: item?.category?.toUpperCase(), options: [] };
        };
        apiObj[item?.category]?.options?.push({ label: item?.title?.toUpperCase(), value: item?.id });
    });

    const skills = Object.values(apiObj);
    resp.status(200).json({ success: true, skills });
});


export const getCategoriesOpts = TryCatch(async (req, resp, next) => {
    const data = await Skill.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('category')), 'category']], raw: true,
    });

    const categories = data?.filter(item => item?.category !== null && item?.category !== '')
        .map(item => ({
            label: item?.category?.toUpperCase(),
            value: item?.category
        }));

    resp.status(200).json({ success: true, categories });
});


export const getSubCategoriesOpts = TryCatch(async (req, resp, next) => {
    const data = await Skill.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('sub_category')), 'sub_category']], raw: true,
    });

    const categories = data?.filter(item => item?.sub_category !== null && item?.sub_category !== '')
        .map(item => ({
            label: item?.sub_category?.toUpperCase(),
            value: item?.sub_category
        }));

    resp.status(200).json({ success: true, categories });
});


// Company-Skill Relation
Company.belongsToMany(Skill, { through: CompanySkill, as: 'skills', foreignKey: 'company_id', otherKey: 'skill_id' });
Skill.belongsToMany(Company, { through: CompanySkill, as: 'companies', foreignKey: 'skill_id', otherKey: 'company_id' });

// Position-Skill Relation
PlacePosition.belongsToMany(Skill, { through: PositionSkill, as: 'skills', foreignKey: 'position_id', otherKey: 'skill_id' });
Skill.belongsToMany(PlacePosition, { through: PositionSkill, as: 'positions', foreignKey: 'skill_id', otherKey: 'position_id' });

// User-Skill Relation
// Company.belongsToMany(Skill, { through: CompanySkill, as: 'skills' });
// Skill.belongsToMany(Company, { through: CompanySkill, as: 'companies' });