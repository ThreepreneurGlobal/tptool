import { Op, Sequelize } from 'sequelize';

import Company from '../../models/company.js';
import Placement from '../../models/placement.js';
import PlacePosition from '../../models/place_position.js';
import User from '../../models/user.js';
import TryCatch, { ErrorHandler } from '../../utils/trycatch.js';


const adminDash = TryCatch(async (req, resp, next) => {
    let stats = {};

    const studentsLenPromise = User.findAll({ where: { status: true, role: 'user', designation: 'student' } });
    const companiesLenPromise = Company.findAll({ where: { status: true } });
    const placementsLenPromise = Placement.findAll({ where: { status: true } });
    const placePositions = await PlacePosition.findAll({
        where: { status: true }, limit: 6, order: [['created_at', 'DESC']], attributes: ['id', 'title'],
        include: [
            {
                model: Placement, foreignKey: 'placement_id', as: 'placement', attributes: ['id', 'exp_opening'],
                include: [
                    { model: Company, foreignKey: 'company_id', as: 'company', attributes: ['id', 'title', 'type', 'logo'] }
                ]
            }
        ]
    });

    const [studentsLen, companiesLen, placementsLen] = await Promise.all([studentsLenPromise, companiesLenPromise, placementsLenPromise]);
    const cardsData = [
        {
            title: 'Students',
            price: studentsLen?.length,
            perstangeValue: "18.89",
            badgeColor: "success",
            seriesData: [{
                name: "Students",
                data: [36, 21, 65, 22, 35, 50, 87, 98],
            }],
            color: '["--bs-success", "--bs-transparent"]'
        },
        {
            title: 'Companies',
            price: companiesLen?.length,
            perstangeValue: "24.07",
            badgeColor: "success",
            seriesData: [{
                name: "Companies",
                data: [36, 48, 10, 74, 35, 50, 70, 73],
            }],
            color: '["--bs-success", "--bs-transparent"]'
        },
        {
            title: 'Placements',
            price: placementsLen?.length,
            perstangeValue: "8.41",
            badgeColor: "success",
            seriesData: [{
                name: "Placements",
                data: [60, 14, 5, 60, 30, 43, 65, 84],
            }],
            color: '["--bs-success", "--bs-transparent"]'
        }
    ];
    const vacancies = placePositions?.map(item => ({
        id: item?.placement?.id, img: item?.placement?.company?.logo, title: item?.title,
        company: item?.placement?.company?.title,
        type: item?.placement?.company?.type, vacancy: item?.placement?.exp_opening,
    }));

    stats = { cardsData, vacancies };
    resp.status(200).json({ success: true, stats });
});


export default adminDash;