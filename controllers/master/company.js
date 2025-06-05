import { rm } from 'fs';
import { fn, Op } from 'sequelize';
import { promisify } from 'util';
import Company from '../../models/company.js';
import TryCatch, { ErrorHandler } from '../../utils/trycatch.js';
import { getCompanyDomainOpts, getCompanyTypeOpts } from '../../utils/options/company.js';
import { uploadFile } from '../../utils/upload.js';


const rmAsync = promisify(rm);

export const createCompany = TryCatch(async (req, resp, next) => {
    const {
        title, type, description, reg_no, contact, contact_alt, email, email_alt, team_size,
        work_domains, work_types, web, facebook, linkedin, youtube, instagram,
    } = req.body;
    const logo = req.file?.path;

    const exists = await Company.findOne({ where: { [Op.or]: [{ email }, { title }] } });
    if (exists) {
        return next(new ErrorHandler('COMPANY ALREADY EXISTS!', 400));
    };

    const company = await Company.create({
        title, type, description, reg_no, contact, contact_alt, email, email_alt, team_size,
        instagram, logo, work_domains: work_domains?.map(item => item?.toLowerCase()) || null,
        work_types: work_types?.map(item => item?.toLowerCase()) || null, web, facebook, linkedin, youtube,
    });
    if (!company) {
        return next(new ErrorHandler('COMPANY NOT CREATED!', 400));
    };

    resp.status(201).json({ success: true, message: 'COMPANY CREATED!' });
});


export const editCompany = TryCatch(async (req, resp, next) => {
    const {
        title, type, description, reg_no, contact, contact_alt, email, email_alt, team_size,
        work_domains, work_types, web, facebook, linkedin, youtube, instagram, logo: logo_txt,
    } = req.body;
    const logo_file = req.file?.path;

    const company = await Company.findOne({ where: { id: req.params.id, status: true } });
    if (!company) {
        return next(new ErrorHandler('COMPANY NOT FOUND!', 404));
    };

    // if ((company?.logo && logo_file && typeof logo_file === 'object') || (company?.logo && logo === null && logo_txt === null)) {
    //     rm(company?.logo, (error) => {
    //         if (error) {
    //             console.error(error.message);
    //         };
    //         console.log('COMPANY OLD LOGO DELETED!');
    //     });
    // };

    const logo = await uploadFile(company?.logo, logo_file, logo_txt);

    await company.update({
        title, type, description, reg_no, contact, contact_alt, email, email_alt, team_size,
        instagram, logo, work_domains: work_domains?.map(item => item?.toLowerCase()),
        work_types: work_types?.map(item => item?.toLowerCase()), web, facebook, linkedin, youtube,
    });
    resp.status(200).json({ success: true, message: 'COMPANY UPDATED!' });
});


export const getCompanies = TryCatch(async (req, resp, next) => {
    const { type, work_domain, work_type } = req.query;
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

    const companies = await Company.findAll({ where });
    resp.status(200).json({ success: true, companies });
});


export const getCompanyById = TryCatch(async (req, resp, next) => {
    const company = await Company.findOne({ where: { id: req.params.id, status: true } });
    if (!company) {
        return next(new ErrorHandler('COMPANY NOT FOUND!', 404));
    };

    resp.status(200).json({ success: true, company });
});


export const getCompanyOpts = TryCatch(async (req, resp, next) => {
    const apiObj = {};
    const api = await Company.findAll({ where: { status: true }, attributes: ['id', 'title', 'type'] });
    // if (api.length <= 0) {
    //     return [];
    // };

    api?.forEach((item) => {
        if (!apiObj[item?.type]) {
            apiObj[item?.type] = { label: item?.type?.toUpperCase(), options: [] };
        };
        apiObj[item?.type]?.options?.push({ label: item?.title?.toUpperCase(), value: item?.id });
    });

    const companies = Object.values(apiObj);
    resp.status(200).json({ success: true, companies });
});


export const getCompCreateOpts = TryCatch(async (req, resp, next) => {
    const [types, domains] = await Promise.all([getCompanyTypeOpts(), getCompanyDomainOpts()]);

    resp.status(200).json({ success: true, opts: { types, domains } })
});