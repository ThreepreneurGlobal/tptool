import { Op } from 'sequelize';
import Application from '../../models/application.js';
import Company from '../../models/company.js';
import PlacePosition from '../../models/place_position.js';
import Placement from '../../models/placement.js';
import TryCatch, { ErrorHandler } from '../../utils/trycatch.js';



export const createApplication = TryCatch(async (req, resp, next) => {
    const { placement_id, position_id, company_id } = req.body;
    const exists = await Application.findOne({
        where: { [Op.and]: [{ placement_id }, { position_id }, { company_id }, { user_id: req.user.id }] },
    });
    if (exists) {
        return next(new ErrorHandler('ALREADY APPLIED!', 400));
    };

    await Application.create({ placement_id, position_id, company_id, user_id: req.user.id });
    resp.status(201).json({ success: true, message: 'APPLICATION APPLIED' });
});


export const myApplications = TryCatch(async (req, resp, next) => {
    const applications = await Application.findAll({
        where: { status: true, user_id: req.user.id }, order: [['created_at', 'DESC']],
        attributes: { exclude: ['placement_id', 'position_id', 'user_id', 'company_id', 'status'] },
        include: [
            { model: PlacePosition, foreignKey: 'position_id', as: 'position', attributes: ['id', 'title', 'type', 'opening'], },
            { model: Placement, foreignKey: 'placement_id', as: 'placement', attributes: ['id', 'title', 'type'], },
            { model: Company, foreignKey: 'company_id', as: 'company', attributes: ['id', 'title', 'web'], },
        ]
    });

    resp.status(200).json({ success: true, applications });
});

export const myAppById = TryCatch(async (req, resp, next) => {
    const application = await Application.findOne({
        where: { status: true, id: req.params.id, user_id: req.user.id }, order: [['created_at', 'DESC']],
        attributes: { exclude: ['placement_id', 'position_id', 'user_id', 'company_id', 'status'] },
        include: [
            { model: PlacePosition, foreignKey: 'position_id', as: 'position', attributes: ['id', 'title', 'type', 'opening'], },
            { model: Placement, foreignKey: 'placement_id', as: 'placement', attributes: ['id', 'title', 'type'], },
            { model: Company, foreignKey: 'company_id', as: 'company', attributes: ['id', 'title', 'web'], },
        ]
    });
    
    if (!application) {
        return next(new ErrorHandler('APPLICATION NOT FOUND!', 404));
    };
    resp.status(200).json({ success: true, application });
});