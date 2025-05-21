import { Op } from 'sequelize';
import Skill from '../../models/skill.js';
import { getSkillCategoriesOpts, getSkillsOpts, getSkillSubCategoriesOpts } from '../../utils/options/skill.js';
import TryCatch, { ErrorHandler } from '../../utils/trycatch.js';



export const getSkills = TryCatch(async (req, resp, next) => {
    const skills = await Skill.findAll({ where: { status: true } });

    resp.status(200).json({ success: true, skills });
});


export const getSkillById = TryCatch(async (req, resp, next) => {
    const skill = await Skill.findOne({ where: { status: true, id: req.params.id } });
    if (!skill) {
        return next(new ErrorHandler('SKILL NOT FOUND!', 404));
    };

    resp.status(200).json({ success: true, skill });
});


export const createSkill = TryCatch(async (req, resp, next) => {
    const { title, short_name, description, category, sub_category } = req.body;
    const exists = await Skill.findOne({ where: { [Op.or]: [{ title }, { short_name }] } });
    if (exists) {
        return next(new ErrorHandler('SKILL ALREADY EXISTS!', 400));
    };

    const skill = await Skill.create({
        title, short_name, description, category, sub_category, user_id: req.user.id,
    });

    if (!skill) {
        return next(new ErrorHandler('SKILL NOT CREATED!', 400));
    };
    resp.status(200).json({ success: true, message: 'SKILL CREATED!' });
});



export const editSkill = TryCatch(async (req, resp, next) => {
    const { title, short_name, description, category, sub_category } = req.body;
    const skill = await Skill.findOne({ where: { status: true, id: req.params.id } });
    if (!skill) {
        return next(new ErrorHandler('SKILL NOT FOUND!', 404));
    };

    const update = await skill.update({ title, short_name, description, category, sub_category });
    if (!update) {
        return next(new ErrorHandler('SKILL NOT UPDATED!', 400));
    };

    resp.status(200).json({ success: true, message: 'SKILL UPDATED!' });
});


// OPTIONS
export const getGrpSkillOpts = TryCatch(async (req, resp, next) => {
    const skills = await getSkillsOpts();

    resp.status(200).json({ success: true, skills });
});


export const getCreateSkillOpts = TryCatch(async (req, resp, next) => {
    const [categories, sub_categories] = await
        Promise.all([getSkillCategoriesOpts(), getSkillSubCategoriesOpts()]);

    resp.status(200).json({ success: true, opts: { categories, sub_categories } });
});
