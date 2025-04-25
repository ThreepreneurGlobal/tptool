import { Op } from 'sequelize';

import Application from '../../../models/application.js';
import Company from '../../../models/company.js';
import PlacePosition from '../../../models/place_position.js';
import Placement from '../../../models/placement.js';
import Skill from '../../../models/skill.js';
import Student from '../../../models/student.js';
import User from '../../../models/user.js';
import TryCatch from '../../../utils/trycatch.js';
import { calculatePercentageChange } from './utils.js';


const adminDash = TryCatch(async (req, resp, next) => {
    const { time_period } = req.query;

    const today = new Date();
    const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfPreviousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(startOfCurrentMonth - 1);

    const last7Days = [];
    const last10Months = [];
    const last6Months = [];
    const last5Years = [];
    const last9Hours = [];
    let date_range = [];

    // Last 7 Days
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        last7Days.push(date.toISOString().split('T')[0]);
    };

    // Last 10 Days
    for (let i = 0; i < 10; i++) {
        const date = new Date();
        date.setMonth(today.getMonth() - i);
        last10Months.push(date.toISOString().split('T')[0]);
    };

    // Last 6 Months
    for (let i = 0; i < 6; i++) {
        const date = new Date();
        date.setMonth(today.getMonth() - i);
        last6Months.push(date.toISOString().split('T')[0]);
    };

    // Last 5 Years
    for (let i = 0; i < 5; i++) {
        const date = new Date();
        date.setFullYear(today.getFullYear() - i);
        last5Years.push(date.toISOString().split('T')[0]);
    };

    // Last 9 Hours
    for (let i = 0; i < 9; i++) {
        const date = new Date();
        date.setHours(today.getHours() - i);
        last9Hours.push(date.toISOString().split('T')[0] + ' ' + date.getHours() + ':00:00'); // Store date and hour
    };

    switch (time_period) {
        case 'week':
            date_range = last7Days;
            break;
        case 'month':
            date_range = last6Months;
            break;
        case 'year':
            date_range = last5Years;
            break;
        default:
            date_range = last7Days;
            break;
    };

    const app_received_time = new Array(last9Hours.length).fill(0);
    const col_line_chart = {
        placement: new Array(date_range.length).fill(0), application: new Array(date_range.length).fill(0),
        shortlist: new Array(date_range.length).fill(0), offer: new Array(date_range.length).fill(0),
    };

    const studentsLenPromise = User.count({ where: { status: true, is_active: true, role: 'user', designation: 'student' } });
    const companiesLenPromise = Company.count({ where: { status: true } });
    const placementsLenPromise = Placement.count({ where: { status: true } });
    const applicationsLenPromise = Application.count({ where: { status: true } });
    const adminsPromise = User.findAll({
        where: { status: true, is_active: true, role: 'admin', designation: 'tp officer' }, attributes: ['id', 'name', 'city', 'avatar']
    });
    const placePositionsPromise = PlacePosition.findAll({
        include: [{
            include: [{
                model: Company, foreignKey: 'company_id', as: 'company', attributes: ['id', 'title', 'type', 'logo']
            }], model: Placement, foreignKey: 'placement_id', as: 'placement', attributes: ['id'],
        }], where: { status: true }, limit: 6, order: [['created_at', 'DESC']], attributes: ['id', 'title', 'opening'],
    });
    const latestPlacePositionsPromise = PlacePosition.findAll({
        where: { status: true }, order: [['created_at', 'DESC']], limit: 10, attributes: ['id', 'title', 'created_at'],
        include: [{
            include: [{
                model: Company, foreignKey: 'company_id', as: 'company', attributes: ['id', 'title', 'logo']
            }], model: Placement, foreignKey: 'placement_id', as: 'placement', attributes: ['id'], where: { status: true }
        }]
    });
    const currentStudentCountPromise = Student.count({ where: { status: true, is_active: true, created_at: { [Op.gte]: startOfCurrentMonth } } });
    const previousStudentCountPromise = Student.count({ where: { status: true, is_active: true, created_at: { [Op.between]: [startOfPreviousMonth, endOfPreviousMonth] } } });
    const currentCompanyCountPromise = Company.count({ where: { status: true, created_at: { [Op.gte]: startOfCurrentMonth } } });
    const previousCompanyCountPromise = Company.count({ where: { status: true, created_at: { [Op.between]: [startOfPreviousMonth, endOfPreviousMonth] } } });
    const currentPlacementCountPromise = Placement.count({ where: { status: true, created_at: { [Op.gte]: startOfCurrentMonth } } });
    const previousPlacementCountPromise = Placement.count({ where: { status: true, created_at: { [Op.between]: [startOfPreviousMonth, endOfPreviousMonth] } } });
    const currentApplicationCountPromise = Application.count({ where: { status: true, created_at: { [Op.gte]: startOfCurrentMonth } } });
    const previousApplicationCountPromise = Application.count({ where: { status: true, created_at: { [Op.between]: [startOfPreviousMonth, endOfPreviousMonth] } } });
    const companyActivityFeedPromise = Company.findAll({ attributes: ['id', 'title', 'type', 'updated_at'], where: { status: true }, order: [['updated_at', 'DESC']], limit: 10 });
    const studentActivityFeedPromise = User.findAll({ attributes: ['id', 'name', 'updated_at'], where: { role: 'user' }, order: [['updated_at', 'DESC']], limit: 10 });
    const placementActivityFeedPromise = Placement.findAll({ attributes: ['id', 'title', 'place_status', 'updated_at'], where: { status: true }, order: [['updated_at', 'DESC']], limit: 10 });
    const skillActivityFeedPromise = Skill.findAll({
        attributes: ['id', 'title', 'updated_at'], where: { status: true }, order: [['updated_at', 'DESC']], limit: 10,
        // include: [{ model: User, foreignKey: 'user_id', as: 'user', attributes: ['id', 'name'] }]
    });
    const applicationActivityFeedPromise = Application.findAll({
        include: [{
            model: PlacePosition, as: 'position', foreignKey: 'position_id', where: { status: true }, attributes: ['id', 'title']
        }, {
            model: User, foreignKey: 'user_id', as: 'user', attributes: ['id', 'name']
        }], attributes: ['id', 'app_status', 'updated_at'], where: { status: true }, order: [['updated_at', 'DESC']], limit: 10,
    });

    const [
        studentsLen, companiesLen, placementsLen, applicationsLen, admins, placePositions, latest_place_positions,
        currentStudentCount, previousStudentCount, currentCompanyCount, previousCompanyCount, currentPlacementCount,
        previousPlacementCount, currentApplicationCount, previousApplicationCount, skillActivityFeed, companyActivityFeed,
        studentActivityFeed, placementActivityFeed, applicationActivityFeed,
    ] = await Promise.all([
        studentsLenPromise, companiesLenPromise, placementsLenPromise, applicationsLenPromise, adminsPromise,
        placePositionsPromise, latestPlacePositionsPromise, currentStudentCountPromise, previousStudentCountPromise,
        currentCompanyCountPromise, previousCompanyCountPromise, currentPlacementCountPromise, previousPlacementCountPromise,
        currentApplicationCountPromise, previousApplicationCountPromise, skillActivityFeedPromise, companyActivityFeedPromise,
        studentActivityFeedPromise, placementActivityFeedPromise, applicationActivityFeedPromise,
    ]);

    const promises = date_range?.map(async (date, idx) => {
        let startDate, endDate;

        if (time_period === 'month') {
            startDate = new Date(date);
            startDate.setDate(1); // Start of the month
            endDate = new Date(date);
            endDate.setMonth(endDate.getMonth() + 1);
            endDate.setDate(0); // End of the month
        } else if (time_period === 'year') {
            startDate = new Date(date);
            startDate.setMonth(0, 1); // Start of the year
            endDate = new Date(date);
            endDate.setFullYear(endDate.getFullYear() + 1);
            endDate.setDate(0); // End of the year
        } else {
            startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
        };

        const colChartWhereCondition = { where: { created_at: { [Op.between]: [startDate, endDate] }, status: true } };
        const [colChartPlacements, colChartApplications, colChartShortlistApps, colChartOfferApps] = await Promise.all([
            Placement.count({ ...colChartWhereCondition }), Application.count({ ...colChartWhereCondition }),
            Application.count({ where: { created_at: { [Op.between]: [startDate, endDate] }, app_status: 'shortlisted' } }),
            Application.count({ where: { app_status: 'offer released', created_at: { [Op.between]: [startDate, endDate] }, }, })
        ]);

        col_line_chart.placement[idx] = colChartPlacements || 0;
        col_line_chart.application[idx] = colChartApplications || 0;
        col_line_chart.shortlist[idx] = colChartShortlistApps || 0;
        col_line_chart.offer[idx] = colChartOfferApps || 0;
    });
    await Promise.all(promises);

    const nineHrsPromise = last9Hours?.map(async (dateHour, idx) => {
        const startDate = new Date(dateHour);
        startDate.setMinutes(0, 0, 0);
        const endDate = new Date(dateHour);
        endDate.setMinutes(59, 59, 999);

        const hrs9AppCount = await Application.count({ where: { created_at: { [Op.between]: [startDate, endDate] } }, status: true });
        app_received_time[idx] = hrs9AppCount || 0;
    });
    await Promise.all(nineHrsPromise);

    const studentBadge = calculatePercentageChange(currentStudentCount, previousStudentCount);
    const companyBadge = calculatePercentageChange(currentCompanyCount, previousCompanyCount);
    const placementBadge = calculatePercentageChange(currentPlacementCount, previousPlacementCount);
    const applicationBadge = calculatePercentageChange(currentApplicationCount, previousApplicationCount);

    let cards_data = {
        student: { count: studentsLen, percent: studentBadge, series: new Array(last10Months.length).fill(0) },
        company: { count: companiesLen, percent: companyBadge, series: new Array(last10Months.length).fill(0) },
        placement: { count: placementsLen, percent: placementBadge, series: new Array(last10Months.length).fill(0) },
        application: { count: applicationsLen, percent: applicationBadge, series: new Array(last10Months.length).fill(0) },
    };

    const tenMonthsPromise = last10Months?.map(async (date, idx) => {
        let startDate, endDate;
        startDate = new Date(date);
        startDate.setDate(1); // Start of the month
        endDate = new Date(date);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0); // End of the month

        const cardWhereCondition = { where: { created_at: { [Op.between]: [startDate, endDate] }, status: true } };
        const last10MonthStudentCountPromise = Student.count({ ...cardWhereCondition });
        const last10MonthCompanyCountPromise = Company.count({ ...cardWhereCondition });
        const last10MonthPlacementCountPromise = Placement.count({ ...cardWhereCondition });
        const last10MonthApplicationCountPromise = Application.count({ ...cardWhereCondition });

        const [last10MonthStudentCount, last10MonthCompanyCount, last10MonthPlacementCount, last10MonthApplicationCount] = await Promise.all([
            last10MonthStudentCountPromise, last10MonthCompanyCountPromise, last10MonthPlacementCountPromise, last10MonthApplicationCountPromise,
        ]);

        cards_data.student.series[idx] = last10MonthStudentCount || 0;
        cards_data.company.series[idx] = last10MonthCompanyCount || 0;
        cards_data.placement.series[idx] = last10MonthPlacementCount || 0;
        cards_data.application.series[idx] = last10MonthApplicationCount || 0;
    });
    await Promise.all(tenMonthsPromise);

    const vacancies = placePositions?.map(item => ({
        id: item?.placement?.id, img: item?.placement?.company?.logo, title: item?.title,
        company: item?.placement?.company?.title,
        type: item?.placement?.company?.type,
        vacancy: item?.opening,
    }));

    const activity_feeds = [
        ...studentActivityFeed?.map(item => ({ grp: 'student', ...item.toJSON() })),
        ...skillActivityFeed?.map(item => ({ grp: 'skill', ...item.toJSON() })),
        ...companyActivityFeed?.map(item => ({ grp: 'company', ...item.toJSON() })),
        ...placementActivityFeed?.map(item => ({ grp: 'placement', ...item.toJSON() })),
        ...applicationActivityFeed?.map(item => ({ grp: 'application', ...item.toJSON() })),
    ];
    activity_feeds?.sort((a, b) => new Date(b?.updated_at) - new Date(a?.updated_at)).slice(0, 10);

    const stats = {
        cards_data, vacancies, admins, col_line_chart, app_received_time, latest_place_positions,
        activity_feeds,
    };
    resp.status(200).json({ success: true, stats });
});


export default adminDash;
