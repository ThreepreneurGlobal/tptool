import { Sequelize } from "sequelize";
import PlacePosition from "../../models/place_position.js";
import Placement from "../../models/placement.js";



export const getPlaceStatusOpts = async () => {
    const data = await Placement.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('place_status')), 'place_status']], raw: true,
    });

    const status_opts = data?.filter(item => item?.place_status !== null && item?.place_status !== '')
        .map(item => ({
            label: item?.place_status?.toUpperCase(),
            value: item?.place_status
        }));
    return status_opts;
};


export const getPlaceDriveOpts = async () => {
    const data = await Placement.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('type')), 'type']], raw: true,
    });

    const drive_types = data?.filter(item => item?.type !== null && item?.type !== '')
        .map(item => ({ label: item?.type?.toUpperCase(), value: item?.type }));

    return drive_types;
};


export const getPlacePositionOpts = async () => {
    const data = await PlacePosition.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('type')), 'type']], raw: true,
    });

    const position_types = data?.filter(item => item?.type !== null && item?.type !== '')
        .map(item => ({ label: item?.type?.toUpperCase(), value: item?.type }));

    return position_types;
};