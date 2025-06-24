import { Sequelize } from "sequelize";
// import Company from "../../models/company.js";
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


export const getPlaceCompanyOpts = async () => {
    const apiObj = {};
    const ids = await Placement.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('company_id')), 'company_id']], raw: true,
    });

    // const api = await Company.findAll({ where: { id: ids?.map(i=> i?.company_id), status: true }, attributes: ['id', 'title', 'type'] });
    // api?.forEach((item) => {
    //     if (!apiObj[item?.type]) {
    //         apiObj[item?.type] = { label: item?.type?.toUpperCase(), options: [] };
    //     };
    //     apiObj[item?.type]?.options?.push({ label: item?.title?.toUpperCase(), value: item?.id });
    // });

    await Promise.all(ids?.map(async (item) => {
        const companyPromise = await fetch(process.env.SUPER_SERVER + '/v1/master/company/get/' + item?.company_id);
        const { company } = await companyPromise.json();

        if (!apiObj[company?.type]) {
            apiObj[company?.type] = { label: company?.type?.toUpperCase(), options: [] };
        };
        apiObj[company?.type]?.options?.push({ label: company?.title?.toUpperCase(), value: company?.id });
    }));

    const companies = Object.values(apiObj);
    return companies;
};


export const getPlaceTypeOpts = async () => {
    const data = await Placement.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('type')), 'type']], raw: true,
    });

    const types = data?.filter(item => item?.type !== null && item?.type !== '')
        .map(item => ({
            label: item?.type?.toUpperCase(),
            value: item?.type?.toLowerCase(),
        }));
    return types;
};


export const getPlaceDateRange = async () => {
    const minResult = await Placement.findOne({
        attributes: [[Sequelize.fn('MIN', Sequelize.col('reg_start_date')), 'minDate']], where: { status: true }
    });
    const maxRegResult = await Placement.findOne({
        attributes: [[Sequelize.fn('MAX', Sequelize.col('reg_end_date')), 'maxRegDate']], where: { status: true }
    });
    const maxReRegResult = await Placement.findOne({
        attributes: [[Sequelize.fn('MAX', Sequelize.col('rereg_end_date')), 'maxReRegDate']], where: { status: true }
    });

    const maxRegDate = new Date(maxRegResult.get('maxRegDate'));
    const maxReRegDate = new Date(maxReRegResult.get('maxReRegDate'));
    const minDate = minResult ? minResult.get('minDate') : null;
    const maxDate = maxReRegDate === null ? maxRegDate : maxRegDate > maxReRegDate ? maxRegDate : maxReRegDate;

    return { min: minDate, max: maxDate };
};

export const getPlaceCourseOpts = async () => {
    const data = await PlacePosition.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('courses')), 'courses']], raw: true,
    });

    const courses = data?.flatMap(item => {
        const parsedCourses = item ? JSON.parse(item?.courses):[];
        return parsedCourses?.length > 0 ? parsedCourses?.map(course => ({ label: course?.toUpperCase(), value: course, })):[];
    });
    return [...new Map(courses?.map(item => [item?.value, item])).values()];
};

export const getPlaceBranchOpts = async () => {
    const data = await PlacePosition.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('branches')), 'branches']], raw: true,
    });

    const branches = data?.flatMap(item => {
        const parsedBranches = item ? JSON.parse(item?.branches) : [];
        return parsedBranches?.length > 0 ? parsedBranches?.map(branch => ({ label: branch?.toUpperCase(), value: branch, })) : [];
    });
    return [...new Map(branches?.map(item => [item?.value, item])).values()];
};
