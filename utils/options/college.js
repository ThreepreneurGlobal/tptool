import Sequelize from 'sequelize';

import College from "../../models/college.js";


export const getCollegeOpts = async () => {
    const apiObj = {};
    const api = await College.findAll({
        where: { status: true }, attributes: ['id', 'name', 'state']
    });

    api?.forEach((item) => {
        if (!apiObj[item?.state]) {
            apiObj[item?.state] = { label: item?.state?.toUpperCase(), options: [] };
        };
        apiObj[item?.state]?.options?.push({ label: item?.name?.toUpperCase(), value: item?.id });
    });

    return Object.values(apiObj);
};


export const getUniversityOpts = async () => {
    const data = await College.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('university')), 'university']], raw: true,
    });

    const universities = data?.filter(item => item?.university !== null && item?.university !== '')
        .map(item => ({
            label: item?.university?.toUpperCase(),
            value: item?.university?.toLowerCase(),
        }));

    return universities;
};

