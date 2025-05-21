import { Sequelize } from 'sequelize';
import Company from '../../models/company.js';


export const getCompanyTypeOpts = async () => {
    const data = await Company.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('type')), 'type']], raw: true,
    });

    const comp_types = data?.filter(item => item?.type !== null && item?.type !== '')
        .map(item => ({
            label: item?.type?.toUpperCase(),
            value: item?.type?.toLowerCase(),
        }));

    return comp_types;
};


export const getCompanyDomainOpts = async () => {
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
    return domain_opts;
};

