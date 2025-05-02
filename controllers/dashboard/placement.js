import { DataTypes, Op, Sequelize } from "sequelize";

import College from "../../models/college.js";
import Credential from "../../models/credential.js";
import SecondApplication from "../../models/second/application.js";
import SecondPlacement from "../../models/second/placement.js";
import { decryptData } from "../../utils/hashing.js";



const dashPlacement = async ({ time_period }) => {
    let placements_len = 0;
    let latest_placements = [];
    let max_place_colleges = [];

    const today = new Date();
    let date_range = [];
    const last7Days = [];
    const last12Months = [];
    const last10Years = [];
    const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Last 7 Days
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        last7Days.push(date.toISOString().split('T')[0]);
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

    const placement_chart = {
        placement: new Array(date_range?.length).fill(0), application: new Array(date_range?.length).fill(0),
        shortlist: new Array(date_range?.length).fill(0), offer: new Array(date_range?.length).fill(0),
    };

    const credentials = await Credential.findAll({
        where: { status: true, },
        include: [{ model: College, foreignKey: 'college_id', as: 'college', attributes: ['id', 'name', 'city'] }]
    });

    const placementPromises = credentials?.map(async (credential) => {
        const db_name = decryptData(credential?.db_name);
        const db_user = decryptData(credential?.db_user);
        const db_pass = decryptData(credential?.db_pass);
        const db_host = decryptData(credential?.db_host);
        
        const collegeDb = new Sequelize(db_name, db_user, db_pass, {
            host: db_host,
            dialect: 'mysql',
        });

        try {
            await collegeDb.authenticate();
            const CollegePlacement = SecondPlacement(collegeDb, DataTypes);
            const CollegeApplication = SecondApplication(collegeDb, DataTypes);

            // ALL PLACEMENT LENGTH
            const count = await CollegePlacement.count({ where: { status: true } });
            placements_len += count;

            // LATEST PLACEMENTS
            const collegePlacements = await CollegePlacement.findAll({
                where: { status: true }, order: [['created_at', 'DESC']], limit: 5,
                attributes: ['id', 'title', 'type', 'place_status', 'reg_start_date', 'reg_end_date', 'rereg_end_date', 'contact_per', 'created_at']
            });
            const placementsWithCollege = collegePlacements?.map(item => ({
                ...item?.get(), college: credential?.college?.name + ', ' + credential?.college?.city,
            }));
            latest_placements = latest_placements?.concat(placementsWithCollege);

            // PLACEMENT CHART
            const placeChartPromise = date_range?.map(async (date, idx) => {
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
                const [chartPlacement, chartApplication, chartShortlist, chartOffer] = await Promise.all([
                    CollegePlacement.count({ ...colChartWhereCondition }), CollegeApplication.count({ ...colChartWhereCondition }),
                    CollegeApplication.count({ where: { created_at: { [Op.between]: [startDate, endDate] }, app_status: 'shortlisted' } }),
                    CollegeApplication.count({ where: { app_status: 'offer released', created_at: { [Op.between]: [startDate, endDate] }, }, })
                ]);

                placement_chart.placement[idx] += chartPlacement || 0;
                placement_chart.application[idx] += chartApplication || 0;
                placement_chart.shortlist[idx] += chartShortlist || 0;
                placement_chart.offer[idx] += chartOffer || 0;
            });
            await Promise.all(placeChartPromise);

            // TOP PLACEMENT COLLEGES
            const placementsCount = await CollegePlacement.count({ where: { status: true } });
            const placeCountWithCollege = { count: placementsCount, college: credential?.college?.name };
            max_place_colleges?.unshift(placeCountWithCollege);
        } catch (error) {
            console.error(error?.message);
            return;
        }
    });

    await Promise.all(placementPromises);

    max_place_colleges = max_place_colleges?.sort((a, b) => b?.count - a?.count).slice(0, 3);

    return { placements_len, latest_placements, placement_chart, max_place_colleges, };
};


export default dashPlacement;
