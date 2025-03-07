import { Op } from 'sequelize';

import Company from '../models/company.js';
import CompanySkill from '../models/company_skill.js';
import PlacePosition from '../models/place_position.js';
import PositionSkill from '../models/position_skill.js';
import Skill from '../models/skill.js';
import User from '../models/user.js';
import UserSkill from '../models/user_skill.js';
import { getSkillCategoriesOpts, getSkillsOpts, getSkillSubCategoriesOpts } from '../utils/opt/skill.js';
import { toLowerCaseFields } from '../utils/strFeature.js';
import TryCatch, { ErrorHandler } from '../utils/trycatch.js';
import Student from '../models/student.js';


export const createSkill = TryCatch(async (req, resp, next) => {
    const { title, short_name, description, category, sub_category } = toLowerCaseFields(req.body);

    const existed = await Skill.findOne({ where: { [Op.or]: [{ title }, { short_name }] } });
    if (existed) {
        return next(new ErrorHandler('SKILL ALREADY CREATED!', 400));
    };

    await Skill.create({ title, short_name, description, category, sub_category, user_id: req.user.id });
    resp.status(201).json({ success: true, message: 'SKILL CREATED...' });
});


export const editSkill = TryCatch(async (req, resp, next) => {
    const { title, short_name, description, category, sub_category } = req.body;

    const skill = await Skill.findOne({ where: { id: req.params.id, status: true } });
    if (!skill) {
        return next(new ErrorHandler('SKILL NOT FOUND!', 404));
    };

    await skill.update({ title, short_name, description, category, sub_category });
    resp.status(201).json({ success: true, message: 'SKILL UPDATED...' });
});


export const getSkills = TryCatch(async (req, resp, next) => {
    const skills = await Skill.findAll({
        where: { status: true }, attributes: { exclude: ['status', 'created_at', 'updated_at'] }
    });

    resp.status(200).json({ success: true, skills });
});


export const getSkillById = TryCatch(async (req, resp, next) => {
    const skill = await Skill.findOne({ where: { id: req.params.id, status: true } });
    if (!skill) {
        return next(new ErrorHandler('SKILL NOT FOUND!', 404));
    };

    resp.status(201).json({ success: true, skill });
});


export const getSkillOpts = TryCatch(async (req, resp, next) => {
    const [categories, sub_categories] = await Promise.all([
        getSkillCategoriesOpts(), getSkillSubCategoriesOpts()
    ]);

    const skill_opts = { categories, sub_categories };
    resp.status(201).json({ success: true, skill_opts });
});


export const addSkillOpts = TryCatch(async (req, resp, next) => {
    const skill_opts = await getSkillsOpts();

    resp.status(201).json({ success: true, skill_opts });
});



// Company-Skill Relation
Company.belongsToMany(Skill, { through: CompanySkill, as: 'skills', foreignKey: 'company_id', otherKey: 'skill_id' });
Skill.belongsToMany(Company, { through: CompanySkill, as: 'companies', foreignKey: 'skill_id', otherKey: 'company_id' });

// Position-Skill Relation
PlacePosition.belongsToMany(Skill, { through: PositionSkill, as: 'skills', foreignKey: 'position_id', otherKey: 'skill_id' });
Skill.belongsToMany(PlacePosition, { through: PositionSkill, as: 'positions', foreignKey: 'skill_id', otherKey: 'position_id' });

// User-Skill Relation
User.belongsToMany(Skill, { through: UserSkill, as: 'skills', foreignKey: 'user_id', otherKey: 'skill_id' });
Skill.belongsToMany(User, { through: UserSkill, as: 'users', foreignKey: 'skill_id', otherKey: 'user_id' });

// Student-Skill Relation
Student.belongsToMany(Skill, { through: UserSkill, as: 'skills', foreignKey: 'student_id', otherKey: 'skill_id' });
Skill.belongsToMany(Student, { through: UserSkill, as: 'students', foreignKey: 'skill_id', otherKey: 'student_id' });