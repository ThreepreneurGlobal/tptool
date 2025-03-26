import fs from 'fs';
import { col, fn, Op, Sequelize } from 'sequelize';

import Company from '../../models/company.js';
import CompanySkill from '../../models/company_skill.js';
import Placement from '../../models/placement.js';
import Skill from '../../models/skill.js';
import TryCatch, { ErrorHandler } from '../../utils/trycatch.js';
import { getCompanyDomainOpts, getCompanyTypeOpts, getCompanyWorkOpts } from '../../utils/opt/company.js';
import { getSkillsOpts } from '../../utils/opt/skill.js';


export const createCompany = TryCatch(async (req, resp, next) => {
    const {
        title, description, reg_no, phone, phone_alt, email, email_alt, type, team_size,
        work_domains, work_types, web, facebook, linkedin, youtube, instagram, skills,
    } = req.body;
    const logo = req.file?.path;

    const existed = await Company.findOne({ where: { [Op.or]: [{ title }, { reg_no }, { email }], status: true } });
    if (existed) {
        return next(new ErrorHandler('COMPANY ALREADY EXISTS!', 400));
    };

    const company = await Company.create({
        title: title?.toLowerCase(), description, reg_no, phone, phone_alt, email, email_alt, logo: logo ? logo : null,
        type: type?.toLowerCase(), team_size, work_domains: work_domains?.map(item => item?.toLowerCase()),
        work_types: work_types?.map(item => item?.toLowerCase()), web, facebook, linkedin, youtube, instagram,
    });

    if (!company) {
        return next(new ErrorHandler('COMPANY NOT CREATED!', 500));
    };

    if (Array.isArray(skills) && skills.length > 0) {
        await Promise.all(skills?.map(async (skill) => {
            await CompanySkill.create({ skill_id: Number(skill), company_id: company?.id });
        }));
    };

    resp.status(201).json({ success: true, message: 'COMPANY CREATED...' });
});


export const getCompanies = TryCatch(async (req, resp, next) => {
    const { type, work_type, work_domain } = req.query;
    const where = { status: true };
    if (type) { where.type = type; };
    if (work_type) {
        const work_type_array = Array.isArray(work_type) ? work_type : [work_type];
        const workTypeConditions = work_type_array?.map(item => {
            return fn('JSON_CONTAINS', col('work_types'), JSON.stringify(item));
        });
        where[Op.or] = workTypeConditions;
    };
    if (work_domain) {
        const domain_array = Array.isArray(work_domain) ? work_domain : [work_domain];
        const domainConditions = domain_array?.map(item => {
            return fn('JSON_CONTAINS', col('work_domains'), JSON.stringify(item));
        });
        where[Op.or] = domainConditions;
    };

    const companies = await Company.findAll({
        where, attributes: ['id', 'title', 'reg_no', 'email', 'phone', 'type', 'web', 'logo'],
    });
    resp.status(200).json({ success: true, companies });
});


export const getCompanyById = TryCatch(async (req, resp, next) => {
    const company = await Company.findOne({
        where: { id: req.params.id, status: true },
        include: [
            {
                model: Skill, through: { model: CompanySkill, attributes: [] },
                as: 'skills', attributes: ['id', 'title', 'category']
            }
        ]
    });
    if (!company) {
        return next(new ErrorHandler('COMPANY NOT FOUND!', 404));
    };

    resp.status(200).json({ success: true, company });
});


export const editCompany = TryCatch(async (req, resp, next) => {
    const {
        title, description, reg_no, phone, phone_alt, email, email_alt, type, team_size,
        work_domains, work_types, web, facebook, linkedin, youtube, instagram, skills,
    } = req.body;
    const logo = req.file?.path;

    const company = await Company.findOne({
        where: { id: req.params.id, status: true },
    });
    if (!company) {
        return next(new ErrorHandler('COMPANY NOT FOUND!', 404));
    };

    if (company?.logo && logo) {
        fs.rm(company?.logo, () => console.log('OLD COMPANY LOGO DELETED!'));
    };

    await company.update({
        title: title?.toLowerCase(), description, reg_no, phone, phone_alt, email, email_alt, type: type?.toLowerCase(),
        team_size, web, facebook, linkedin, youtube, instagram, logo: logo ? logo : company?.logo,
        work_domains: work_domains?.map(item => item?.toLowerCase()), work_types: work_types?.map(item => item?.toLowerCase()),
    });

    //Exist Skill
    const existSkills = await CompanySkill.findAll({
        where: { company_id: company?.id }, attributes: ['skill_id', 'id']
    });
    const existSkillIds = existSkills.map(skill => skill?.skill_id);

    const newSkillIds = Array.isArray(skills) ? skills?.map(skill => Number(skill)) : [];
    const skillsToAdd = newSkillIds?.filter(skillId => !existSkillIds?.includes(skillId));
    const skillsToRemove = existSkillIds?.filter(skillId => !newSkillIds?.includes(skillId));

    //Remove Old Skills
    if (skillsToRemove?.length > 0) {
        await CompanySkill.destroy({ where: { company_id: company?.id, skill_id: skillsToRemove } });
    };

    //Add New Skills
    if (skillsToAdd?.length > 0) {
        await Promise.all(skillsToAdd?.map(async (skillId) => {
            await CompanySkill.create({ company_id: company.id, skill_id: skillId });
        }));
    };

    resp.status(200).json({ success: true, message: 'COMPANY UPDATED...' });
});


export const createCompanyOpts = TryCatch(async (req, resp, next) => {
    const [types, works, domains, skills] = await Promise.all([
        getCompanyTypeOpts(), getCompanyWorkOpts(), getCompanyDomainOpts(), getSkillsOpts()
    ]);

    const company_opts = { types, works, domains, skills };
    resp.status(200).json({ success: true, company_opts });
});


export const filterCompanyOpts = TryCatch(async (req, resp, next) => {
    const [types, work_types, domains] = await Promise.all([
        getCompanyTypeOpts(), getCompanyWorkOpts(), getCompanyDomainOpts()
    ]);

    const filter_opts = { types, work_types, domains };
    resp.status(200).json({ success: true, filter_opts });
});


// Placement-Company Relation
Placement.belongsTo(Company, { foreignKey: 'company_id', as: 'company', targetKey: 'id' });
Company.hasMany(Placement, { foreignKey: 'company_id', as: 'placements' });