import { Op, Sequelize } from 'sequelize';

import Application from '../../../models/application.js';
import Company from '../../../models/company.js';
import PlacePosition from '../../../models/place_position.js';
import Feedback from '../../../models/feedback.js';
import Placement from '../../../models/placement.js';
import Skill from '../../../models/skill.js';
import Student from '../../../models/student.js';
import User from '../../../models/user.js';
import TryCatch from '../../../utils/trycatch.js';
import { calculatePercentageChange } from './utils.js';


const adminDash = TryCatch(async (req, resp, next) => {
    const { time_period } = req.query;

    // ALL DATES
    const today = new Date();
    const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfPreviousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(startOfCurrentMonth - 1);

    // ALL DATE RANGE LABELS IN ARRAY
    const last7Days = [];
    const last10Months = [];
    const last12Months = [];
    const last10Years = [];
    const last9Hours = [];
    let date_range = [];

    // Last 7 Days
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        last7Days.push(date.toISOString().split('T')[0]);
    };

    // Last 10 Months
    for (let i = 0; i < 10; i++) {
        const date = new Date();
        date.setMonth(today.getMonth() - i);
        last10Months.push(date.toISOString().split('T')[0]);
    };

    // Last 12 Months
    for (let i = 0; i < 12; i++) {
        const date = new Date();
        date.setMonth(today.getMonth() - i);
        last12Months.push(date.toISOString().split('T')[0]);
    };

    // Last 10 Years
    for (let i = 0; i < 10; i++) {
        const date = new Date();
        date.setFullYear(today.getFullYear() - i);
        last10Years.push(date.toISOString().split('T')[0]);
    };

    // Last 9 Hours
    for (let i = 0; i < 9; i++) {
        const date = new Date();
        date.setHours(today.getHours() - i);
        last9Hours.push(date.toISOString().split('T')[0] + ' ' + date.getHours() + ':00:00'); // Store date and hour
    };

    // SET TIME PERIOD
    switch (time_period) {
        case 'week':
            date_range = last7Days;
            break;
        case 'month':
            date_range = last12Months;
            break;
        case 'year':
            date_range = last10Years;
            break;
        default:
            date_range = last7Days;
            break;
    };

    // SET INITIAL VALUES
    const app_received_time = new Array(last9Hours.length).fill(0);
    const col_line_chart = {
        placement: new Array(date_range.length).fill(0), application: new Array(date_range.length).fill(0),
        shortlist: new Array(date_range.length).fill(0), offer: new Array(date_range.length).fill(0),
    };

    // SET ALL PROMISES
    const studentsLenPromise = User.count({ where: { status: true, is_active: true, role: 'user', designation: 'student' } });
    const feedbacksLenPromise = Feedback.count({ where: { status: true } });
    const placementsLenPromise = Placement.count({ where: { status: true } });
    const applicationsLenPromise = Application.count({ where: { status: true } });
    const adminsPromise = User.findAll({
        where: { status: true, is_active: true, role: 'admin', designation: 'tp officer' }, attributes: ['id', 'name', 'city', 'avatar']
    });
    const placePositionsPromise = PlacePosition.findAll({
        include: [{
            // include: [{ model: Company, foreignKey: 'company_id', as: 'company', attributes: ['id', 'title', 'type', 'logo'] }], 
            model: Placement, foreignKey: 'placement_id', as: 'placement', attributes: ['id', 'company_id'],
        }], where: { status: true }, limit: 6, order: [['created_at', 'DESC']], attributes: ['id', 'title', 'opening'],
    });
    const latestPlacePositionsPromise = PlacePosition.findAll({
        where: { status: true }, order: [['created_at', 'DESC']], limit: 10, attributes: ['id', 'title', 'created_at'],
        include: [{
            // include: [{ model: Company, foreignKey: 'company_id', as: 'company', attributes: ['id', 'title', 'logo'] }],
            model: Placement, foreignKey: 'placement_id', as: 'placement', attributes: ['id', 'company_id'], where: { status: true }
        }]
    });
    const currentStudentCountPromise = Student.count({ where: { status: true, is_active: true, created_at: { [Op.gte]: startOfCurrentMonth } } });
    const previousStudentCountPromise = Student.count({ where: { status: true, is_active: true, created_at: { [Op.between]: [startOfPreviousMonth, endOfPreviousMonth] } } });
    const currentFeedbackCountPromise = Feedback.count({ where: { status: true, created_at: { [Op.gte]: startOfCurrentMonth } } });
    const previousFeedbackCountPromise = Feedback.count({ where: { status: true, created_at: { [Op.between]: [startOfPreviousMonth, endOfPreviousMonth] } } });
    const currentPlacementCountPromise = Placement.count({ where: { status: true, created_at: { [Op.gte]: startOfCurrentMonth } } });
    const previousPlacementCountPromise = Placement.count({ where: { status: true, created_at: { [Op.between]: [startOfPreviousMonth, endOfPreviousMonth] } } });
    const currentApplicationCountPromise = Application.count({ where: { status: true, created_at: { [Op.gte]: startOfCurrentMonth } } });
    const previousApplicationCountPromise = Application.count({ where: { status: true, created_at: { [Op.between]: [startOfPreviousMonth, endOfPreviousMonth] } } });
    // const companyActivityFeedPromise = Company.findAll({ attributes: ['id', 'title', 'type', 'updated_at'], where: { status: true }, order: [['updated_at', 'DESC']], limit: 10 });
    const studentActivityFeedPromise = User.findAll({ attributes: ['id', 'name', 'updated_at'], where: { role: 'user' }, order: [['updated_at', 'DESC']], limit: 10 });
    const placementActivityFeedPromise = Placement.findAll({ attributes: ['id', 'title', 'place_status', 'updated_at'], where: { status: true }, order: [['updated_at', 'DESC']], limit: 10 });
    // const skillActivityFeedPromise = Skill.findAll({
    //     attributes: ['id', 'title', 'updated_at'], where: { status: true }, order: [['updated_at', 'DESC']], limit: 10,
    //     // include: [{ model: User, foreignKey: 'user_id', as: 'user', attributes: ['id', 'name'] }]
    // });
    const applicationActivityFeedPromise = Application.findAll({
        include: [{
            model: PlacePosition, as: 'position', foreignKey: 'position_id', where: { status: true }, attributes: ['id', 'title']
        }, {
            model: User, foreignKey: 'user_id', as: 'user', attributes: ['id', 'name']
        }], attributes: ['id', 'app_status', 'updated_at'], where: { status: true }, order: [['updated_at', 'DESC']], limit: 10,
    });

    // CALL ALL PROMISES (skip skill activity feed)
    const [
        studentsLen, feedbacksLen, placementsLen, applicationsLen, admins, placePositions, latest_place_positions,
        currentStudentCount, previousStudentCount, currentFeedbackCount, previousFeedbackCount, currentPlacementCount,
        previousPlacementCount, currentApplicationCount, previousApplicationCount,
        studentActivityFeed, placementActivityFeed, applicationActivityFeed,
    ] = await Promise.all([
        studentsLenPromise, feedbacksLenPromise, placementsLenPromise, applicationsLenPromise, adminsPromise,
        placePositionsPromise, latestPlacePositionsPromise, currentStudentCountPromise, previousStudentCountPromise,
        currentFeedbackCountPromise, previousFeedbackCountPromise, currentPlacementCountPromise, previousPlacementCountPromise,
        currentApplicationCountPromise, previousApplicationCountPromise,
        studentActivityFeedPromise, placementActivityFeedPromise, applicationActivityFeedPromise,
    ]);

    // ARRANGE COLUMN LINE CHART VALUES
    const promises = date_range?.map(async (date, idx) => {
        let startDate, endDate;

        if (time_period === 'month') {
            startDate = new Date(date);
            startDate.setDate(1); // Start of the month
            endDate = new Date(date);
            endDate.setMonth(endDate.getMonth() + 1);
            endDate.setDate(0); // End of the month
            endDate.setHours(23, 59, 59, 999);
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

    // ARRANGE APPLICATION RECEIVED TIME
    const nineHrsPromise = last9Hours?.map(async (dateHour, idx) => {
        const startDate = new Date(dateHour);
        startDate.setMinutes(0, 0, 0);
        const endDate = new Date(dateHour);
        endDate.setMinutes(59, 59, 999);

        const hrs9AppCount = await Application.count({ where: { created_at: { [Op.between]: [startDate, endDate] } }, status: true });
        app_received_time[idx] = hrs9AppCount || 0;
    });
    await Promise.all(nineHrsPromise);

    // ARRANGE CARD DATA
    const studentBadge = calculatePercentageChange(currentStudentCount, previousStudentCount);
    const feedbackBadge = calculatePercentageChange(currentFeedbackCount, previousFeedbackCount);
    const placementBadge = calculatePercentageChange(currentPlacementCount, previousPlacementCount);
    const applicationBadge = calculatePercentageChange(currentApplicationCount, previousApplicationCount);

    let cards_data = {
        student: { count: studentsLen, percent: studentBadge, series: new Array(last10Months.length).fill(0) },
        feedback: { count: feedbacksLen, percent: feedbackBadge, series: new Array(last10Months.length).fill(0) },
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
        endDate.setHours(23, 59, 59, 999);

        const cardWhereCondition = { where: { created_at: { [Op.between]: [startDate, endDate] }, status: true } };
        const last10MonthStudentCountPromise = Student.count({ ...cardWhereCondition });
        const last10MonthFeedbackCountPromise = Feedback.count({ ...cardWhereCondition });
        const last10MonthPlacementCountPromise = Placement.count({ ...cardWhereCondition });
        const last10MonthApplicationCountPromise = Application.count({ ...cardWhereCondition });

        const [last10MonthStudentCount, last10MonthFeedbackCount, last10MonthPlacementCount, last10MonthApplicationCount] = await Promise.all([
            last10MonthStudentCountPromise, last10MonthFeedbackCountPromise, last10MonthPlacementCountPromise, last10MonthApplicationCountPromise,
        ]);

        cards_data.student.series[idx] = last10MonthStudentCount || 0;
        cards_data.feedback.series[idx] = last10MonthFeedbackCount || 0;
        cards_data.placement.series[idx] = last10MonthPlacementCount || 0;
        cards_data.application.series[idx] = last10MonthApplicationCount || 0;
    });
    await Promise.all(tenMonthsPromise);

    // SHOW RECENT ADDED JOBS
    const vacancies = await Promise.all(placePositions?.map(async (item) => {
        const promise = await fetch(process.env.SUPER_SERVER + '/v1/master/company/get/' + item?.placement?.company_id);
        const { company: { id, title, type, logo } } = await promise.json();

        return { id: item?.placement?.id, img: logo, title: item?.title, company: title, type, vacancy: item?.opening, };
    }));

    // SHOW ACTIVITY FEEDS
    const activity_feeds = [
        ...studentActivityFeed?.map(item => ({ grp: 'student', ...item.toJSON() })),
        // ...skillActivityFeed?.map(item => ({ grp: 'skill', ...item.toJSON() })),
        // ...companyActivityFeed?.map(item => ({ grp: 'company', ...item.toJSON() })),
        ...placementActivityFeed?.map(item => ({ grp: 'placement', ...item.toJSON() })),
        ...applicationActivityFeed?.map(item => ({ grp: 'application', ...item.toJSON() })),
    ];
    activity_feeds?.sort((a, b) => new Date(b?.updated_at) - new Date(a?.updated_at)).slice(0, 10);

    const latestPlacePositions = await Promise.all(latest_place_positions.map(async (place_position) => {
        const promise = await fetch(process.env.SUPER_SERVER + '/v1/master/company/get/' + place_position?.placement?.company_id);
        const { company: { id, title, logo } } = await promise.json();

        return { ...place_position.toJSON(), placement: { ...place_position.placement.toJSON(), company: { id, title, logo } } };
    }));

    // COMBINE ALL VALUES IN OBJECT
    const stats = {
        cards_data, vacancies, admins, col_line_chart, app_received_time,
        latest_place_positions: latestPlacePositions, activity_feeds,
    };
    resp.status(200).json({ success: true, stats });
});


export default adminDash;
