import { Op } from 'sequelize';

import Company from '../models/company.js';
import CompanySkill from '../models/company_skill.js';
import PlacePosition from '../models/place_position.js';
import PositionSkill from '../models/position_skill.js';
import Skill from '../models/skill.js';
import { getSkillCategoriesOpts, getSkillSubCategoriesOpts } from '../utils/opt/skill.js';
import { toLowerCaseFields } from '../utils/strFeature.js';
import TryCatch, { ErrorHandler } from '../utils/trycatch.js';


export const createSkill = TryCatch(async (req, resp, next) => {
    const { title, short_name, description, category, sub_category } = toLowerCaseFields(req.body);

    const existed = await Skill.findOne({ where: { [Op.or]: [{ title }, { short_name }] } });
    if (existed) {
        return next(new ErrorHandler('Skill Already Created!', 400));
    };

    await Skill.create({ title, short_name, description, category, sub_category });
    resp.status(201).json({ success: true, message: 'Skill Created...' });
});


export const editSkill = TryCatch(async (req, resp, next) => {
    const { title, short_name, description, category, sub_category } = req.body;

    const skill = await Skill.findOne({ where: { id: req.params.id, status: true } });
    if (!skill) {
        return next(new ErrorHandler('Skill Not Found!', 404));
    };

    await skill.update({ title, short_name, description, category, sub_category });
    resp.status(201).json({ success: true, message: 'Skill Updated...' });
});


export const getSkills = TryCatch(async (req, resp, next) => {
    const skills = await Skill.findAll({
        where: { status: true }, attributes: { exclude: ['status', 'created_at', 'updated_at'] }
    });

    // if (skills.length <= 0) {
    //     return next(new ErrorHandler('Skills Not Found!', 404));
    // };

    resp.status(200).json({ success: true, skills });
});


export const getSkillById = TryCatch(async (req, resp, next) => {
    const skill = await Skill.findOne({ where: { id: req.params.id, status: true } });
    if (!skill) {
        return next(new ErrorHandler('Skill Not Found!', 404));
    };

    resp.status(201).json({ success: true, skill });
});


export const getSkillOpts = TryCatch(async (req, resp, next) => {
    const categories = await getSkillCategoriesOpts();
    const sub_categories = await getSkillSubCategoriesOpts();

    const skill_opts = { categories, sub_categories };
    resp.status(201).json({ success: true, skill_opts });
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