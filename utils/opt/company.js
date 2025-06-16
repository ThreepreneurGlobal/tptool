import { Sequelize } from "sequelize";

// import Company from "../../models/company.js";



export const getCompanyTypeOpts = async () => {
    // const data = await Company.findAll({
    //     attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('type')), 'type']], raw: true,
    // });

    // const comp_types = data?.filter(item => item?.type !== null && item?.type !== '')
    //     .map(item => ({
    //         label: item?.type?.toUpperCase(),
    //         value: item?.type
    //     }));

    // return comp_types;
};


export const getCompanyWorkOpts = async () => {
    // const data = await Company.findAll({
    //     attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('work_types')), 'work_types']], raw: true,
    // });

    // const rawData = data?.map(item => item?.work_types).filter(Boolean)
    //     .flatMap(types => {
    //         try {
    //             const parseData = JSON.parse(types);
    //             if (Array.isArray(parseData)) {
    //                 return parseData?.filter(type => type && type?.trim() !== '');
    //             };
    //             return [];
    //         } catch (error) {
    //             console.error(error);
    //             return [];
    //         }
    //     })
    //     .filter((value, idx, self) => self.indexOf(value) === idx);

    // const work_opts = rawData?.map(type => ({ label: type?.toUpperCase(), value: type }));

    // return work_opts;
};


export const getCompanyDomainOpts = async () => {
    // const data = await Company.findAll({
    //     attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('work_domains')), 'work_domains']], raw: true,
    // });

    // const rawData = data?.map(item => item?.work_domains).filter(Boolean)
    //     .flatMap(domains => {
    //         try {
    //             const parseData = JSON.parse(domains);
    //             if (Array.isArray(parseData)) {
    //                 return parseData?.filter(domain => domain && domain?.trim() !== '');
    //             };
    //             return [];
    //         } catch (error) {
    //             console.error(error);
    //             return [];
    //         }
    //     })
    //     .filter((value, idx, self) => self.indexOf(value) === idx);

    // const domain_opts = rawData?.map(domain => ({ label: domain?.toUpperCase(), value: domain }));

    // return domain_opts;
};


export const getCompanyOpts = async () => {
    // const apiObj = {};
    // const api = await Company.findAll({ where: { status: true }, attributes: ['id', 'title', 'type'] });
    // if (api.length <= 0) {
    //     return [];
    // };

    // api?.forEach((item) => {
    //     if (!apiObj[item?.type]) {
    //         apiObj[item?.type] = { label: item?.type?.toUpperCase(), options: [] };
    //     };
    //     apiObj[item?.type]?.options?.push({ label: item?.title?.toUpperCase(), value: item?.id });
    // });

    // const companies = Object.values(apiObj);
    // return companies;
};