import { Sequelize } from "sequelize";

import Application from "../../models/application.js";
import PlacePosition from "../../models/place_position.js";



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

export const getAppPositionTypeOpts = async () => {
    const data = await PlacePosition.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('type')), 'type']], raw: true,
    });

    const position_types = data?.filter(item => item?.type !== null && item?.type !== '')
        .map(item => ({
            label: item?.type?.toUpperCase(),
            value: item?.type?.toLowerCase(),
        }));

    return position_types;
};


export const getAppPositionOpts = async () => {
    const data = await PlacePosition.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('title')), 'title']], raw: true,
    });

    const positions = data?.filter(item => item?.title !== null && item?.title !== '')
        .map(item => ({
            label: item?.title?.toUpperCase(),
            value: item?.title,
        }));

    return positions;
};


export const getAppCompanyOpts = async () => {
    const data = await Application.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('company_id')), 'company_id']], raw: true,
    });

    const company_ids = data?.filter(item => item?.company_id !== null && item?.company_id !== '');

    const companies = await Promise.all(company_ids?.map(async (item) => {
        const companyPromise = await fetch(process.env.SUPER_SERVER + '/v1/master/company/get/' + item?.company_id);
        const { company } = await companyPromise.json();
        return { value: company?.id, label: company?.title?.toUpperCase() };
    }));

    return companies;
};