import { Sequelize } from "sequelize";

import Application from "../../models/application.js";



export const getAppStatusOpts = async () => {
    const data = await Application.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('app_status')), 'app_status']], raw: true,
    });

    const statuses = data?.filter(item => item?.app_status !== null && item?.app_status !== '')
        .map(item => ({
            label: item?.app_status?.toUpperCase(),
            value: item?.app_status,
        }));

    return statuses;
};