import fs from 'fs';
import { Op, Sequelize } from 'sequelize';

import Company from '../models/company.js';
import CompanySkill from '../models/company_skill.js';
import Placement from '../models/placement.js';
import Skill from '../models/skill.js';
import TryCatch, { ErrorHandler } from '../utils/trycatch.js';


export const createCompany = TryCatch(async (req, resp, next) => {
    const {
        title, description, reg_no, phone, phone_alt, email, email_alt, type, team_size,
        work_domains, work_types, web, facebook, linkedin, youtube, instagram, skills,
    } = req.body;
    console.log(req.body);
    const logo = req.file?.path;

    const existed = await Company.findOne({ where: { [Op.or]: [{ title }, { reg_no }, { email }] } });
    if (existed) {
        return next(new ErrorHandler('Company Already Exists!', 400));
    };

    const company = await Company.create({
        title, description, reg_no, phone, phone_alt, email, email_alt, type, team_size, work_domains,
        work_types, web, facebook, linkedin, youtube, instagram, logo: logo ? logo : null,
    });

    if (!company) {
        return next(new ErrorHandler('Company Not Created!', 500));
    };

    if (Array.isArray(skills) && skills.length > 0) {
        await Promise.all(skills?.map(async (skill) => {
            await CompanySkill.create({ skill_id: Number(skill), company_id: company?.id });
        }));
    };

    resp.status(201).json({ success: true, message: 'Company Created...' });
});


export const getCompanies = TryCatch(async (req, resp, next) => {
    const companies = await Company.findAll({
        where: { status: true },
        attributes: ['id', 'title', 'reg_no', 'email', 'phone', 'type', 'web', 'logo'],
    });

    if (companies.length <= 0) {
        return next(new ErrorHandler('Companies Not Found!', 404));
    };

    resp.status(200).json({ success: true, companies });
});


export const getCompanyById = TryCatch(async (req, resp, next) => {
    const company = await Company.findOne({
        where: { id: req.params.id, status: true },
        include: [
            {
                model: Skill, through: { model: CompanySkill, attributes: ['id'] },
                as: 'skills', attributes: ['id', 'title', 'category']
            }
        ]
    });
    if (!company) {
        return next(new ErrorHandler('Company Not Found!', 404));
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
        return next(new ErrorHandler('Company Not Found!', 404));
    };

    if (company?.logo && logo) {
        fs.rm(company?.logo, () => console.log('OLD COMPANY LOGO DELETED!'));
    };

    await company.update({
        title, description, reg_no, phone, phone_alt, email, email_alt, type, team_size, work_domains,
        work_types, web, facebook, linkedin, youtube, instagram, logo: logo ? logo : company?.logo,
    });

    //Exist Skill
    const existSkills = await CompanySkill.findAll({
        where: { company_id: company.id }, attributes: ['skill_id', 'id']
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

    resp.status(200).json({ success: true, message: 'Company Updated...' });
});


export const companyTypeOpts = TryCatch(async (req, resp, next) => {
    const data = await Company.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('type')), 'type']], raw: true,
    });

    const comp_types = data?.filter(item => item?.type !== null && item?.type !== '')
        .map(item => ({
            label: item?.type?.toUpperCase(),
            value: item?.type
        }));
    resp.status(200).json({ success: true, comp_types });
});


export const companyWorkOpts = TryCatch(async (req, resp, next) => {
    const data = await Company.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('work_types')), 'work_types']], raw: true,
    });

    const rawData = data?.map(item => item?.work_types).filter(Boolean)
        .flatMap(types => {
            try {
                const parseData = JSON.parse(types);
                if (Array.isArray(parseData)) {
                    return parseData?.filter(type => type && type?.trim() !== '');
                };
                return [];
            } catch (error) {
                console.error(error);
                return [];
            }
        })
        .filter((value, idx, self) => self.indexOf(value) === idx);

    const work_opts = rawData?.map(type => ({ label: type?.toUpperCase(), value: type }));
    resp.status(200).json({ success: true, work_opts });
});


export const companyDomainOpts = TryCatch(async (req, resp, next) => {
    const data = await Company.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('work_domains')), 'work_domains']], raw: true,
    });

    const rawData = data?.map(item => item?.work_domains).filter(Boolean)
        .flatMap(domains => {
            try {
                const parseData = JSON.parse(domains);
                if (Array.isArray(parseData)) {
                    return parseData?.filter(domain => domain && domain?.trim() !== '');
                };
                return [];
            } catch (error) {
                console.error(error);
                return [];
            }
        })
        .filter((value, idx, self) => self.indexOf(value) === idx);

    const domain_opts = rawData?.map(domain => ({ label: domain?.toUpperCase(), value: domain }));
    resp.status(200).json({ success: true, domain_opts });
});


export const companyOpts = TryCatch(async (req, resp, next) => {
    const apiObj = {};
    const api = await Company.findAll({ where: { status: true }, attributes: ['id', 'title', 'type'] });
    if (api.length <= 0) {
        return next(new ErrorHandler('Companies Not Found!', 404));
    };

    api?.forEach((item) => {
        if (!apiObj[item?.type]) {
            apiObj[item?.type] = { label: item?.type?.toUpperCase(), options: [] };
        };
        apiObj[item?.type]?.options?.push({ label: item?.title?.toUpperCase(), value: item?.id });
    });

    const companies = Object.values(apiObj);
    resp.status(200).json({ success: true, companies });
});



// Placement-Company Relation
Placement.belongsTo(Company, { foreignKey: 'company_id', as: 'company', targetKey: 'id' });
Company.hasMany(Placement, { foreignKey: 'company_id', as: 'placements' });