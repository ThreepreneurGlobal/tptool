import Company from '../../models/company.js';
import Event from '../../models/event.js';
import EventApplication from '../../models/event_app.js';
import EventCompany from '../../models/event_company.js';
import User from '../../models/user.js';
import { convertDateToString } from '../../utils/dateFeature.js';
import mailTransporter from '../../utils/mail.js';
import { getCompanyOpts } from '../../utils/opt/company.js';
import { getBranchOpts, getCourseOpts, getPositionOpts } from '../../utils/opt/event.js';
import TryCatch, { ErrorHandler } from '../../utils/trycatch.js';

// Event.sync({ alter: true, force: true });
// EventCompany.sync({ alter: true, force: true });
// EventApplication.sync({ alter: true, force: true });


export const getEvents = TryCatch(async (req, resp, next) => {
    const { category } = req.query;

    const where = { status: true };
    if (category) { where.category = category; };

    const events = await Event.findAll({
        where, attributes: { exclude: ['company_id', 'description', 'user_id', 'status', 'updated_at'] },
        include: [{
            model: EventCompany, foreignKey: 'event_id', as: 'event_companies', attributes: ['id'], where: { status: true },
            include: [{ model: Company, foreignKey: 'company_id', as: 'company', attributes: ['id', 'title', 'logo'] }]
        }],
    });

    resp.status(200).json({ success: true, events });
});


export const getEventById = TryCatch(async (req, resp, next) => {
    const event = await Event.findOne({
        where: { status: true, id: req.params.id }, attributes: { exclude: ['company_id'] },
        include: [{
            model: EventCompany, foreignKey: 'event_id', as: 'event_companies', attributes: { exclude: ['company_id', 'event_id'] }, where: { status: true },
            include: [{ model: Company, foreignKey: 'company_id', as: 'company', attributes: ['id', 'title', 'logo'] }]
        }],
    });

    if (!event) {
        return next(new ErrorHandler('EVENT NOT FOUND!', 404));
    };

    resp.status(200).json({ success: true, event });
});


export const createEvent = TryCatch(async (req, resp, next) => {
    const { title, description, category, start_date, end_date, companies } = req.body;

    const exists = await Event.findOne({ where: { title, category, start_date, end_date } });
    if (exists) {
        return next(new ErrorHandler('EVENT ALREADY CREATED!', 400));
    };

    const event = await Event.create({ title, description, category, start_date, end_date, user_id: req.user.id });
    if (!event) {
        return next(new ErrorHandler('EVENT NOT CREATED!', 400));
    };

    for (const company of companies) {
        const { positions, batches, courses, branches, company_id } = company;
        const create = await EventCompany.create({ positions, batches, courses, branches, company_id, event_id: event?.id });
        if (!create) {
            return new ErrorHandler('EVENT COMPANY NOT CREATED!', 400);
        };
    };

    // SEND EMAIL FOR ALL COLLEGE STUDENTS!
    const users = await User.findAll({ where: { status: true, is_active: true, role: 'user' }, attributes: ['id', 'name', 'email'] });
    const receiver = {
        from: "",
        to: users?.map(item => item?.email),
        subject: `Application for ${app?.position}.`,
        html: `
            <p>Dear Students,</p>

            <p style="text-align: justify;">We are excited to announce <strong>${event?.title}</strong>, an amazing opportunity for all students of Your College! This event falls under the <strong>${event?.category}</strong> and promises a great experience filled with learning, fun, and networking.</p>
            <p>
                <strong>📅 Start Date:</strong> ${convertDateToString(event?.start_date)} <br>
                <strong>📅 End Date:  </strong> ${convertDateToString(event?.end_date)}
            </p>

            <p>Don't miss out on this chance to be part of something exciting!</p>
            
            <p>
                Best Regards, <br>
                <strong>TPConnect</strong>
            </p>
        `,
    };
    await mailTransporter.sendMail(receiver, (error, info) => {
        if (error) {
            return new ErrorHandler(error.message, 400);
        };
    });
    resp.status(201).json({ success: true, message: 'EVENT CREATED!' });
});


export const editEvent = TryCatch(async (req, resp, next) => {
    const { title, description, category, start_date, end_date, companies } = req.body;

    const event = await Event.findOne({
        where: { status: true, id: req.params.id }, attributes: { exclude: ['company_id'] },
        include: [{ model: EventCompany, foreignKey: 'event_id', as: 'event_companies' }],
    });
    if (!event) {
        return next(new ErrorHandler('EVENT NOT FOUND!', 404));
    };
    await event.update({ title, description, category, start_date, end_date });

    const existingCompanies = await EventCompany.findAll({ where: { event_id: event?.id, status: true } });
    const existingCompanyIds = existingCompanies?.map(item => item?.id);
    const reqCompanyIds = companies?.map(comp => Number(comp?.company_id)).filter(company_id => company_id !== undefined);
    const companyToDelete = existingCompanyIds?.filter(id => !reqCompanyIds?.includes(id));

    for (const company of companies) {
        const { id, positions, batches, courses, branches, company_id } = company;
        if (id) {
            const existCompany = existingCompanies?.find(comp => comp?.id === Number(id));
            if (existCompany) {
                await existCompany.update({ positions, batches, courses, branches, company_id });
            };
        } else {
            const create = await EventCompany.create({ positions, batches, courses, branches, company_id, event_id: event?.id });
            if (!create) {
                return new ErrorHandler('EVENT COMPANY NOT CREATED!', 400);
            };
        };
    };

    const deleteEventComp = await EventCompany.findOne({ where: { id: companyToDelete, status: true } });
    if (!deleteEventComp) {
        return next(new ErrorHandler('EVENT ORGANISATION NOT FOUND!', 404));
    };

    deleteEventComp.update({ status: false });
    resp.status(200).json({ success: true, message: 'EVENT UPDATED!' });
});


export const getEventApps = TryCatch(async (req, resp, next) => {
    const { category } = req.query;
    const where = { status: true };
    if (category) { where.category = category; };

    const event_apps = await EventApplication.findAll({
        include: [{
            model: Event, foreignKey: 'event_id', as: 'event', where, attributes: { exclude: ['description', 'user_id', 'status', 'created_at', 'updated_at'] }
        }, {
            model: EventCompany, foreignKey: 'event_comp_id', attributes: ['id'], include: [{ model: Company, foreignKey: 'company_id', as: 'company', attributes: ['id', 'title'] }]
        }], where: { status: true }, attributes: { exclude: ['event_id', 'company_id', 'event_comp_id'] }
    });
    resp.status(200).json({ success: true, event_apps });
});


export const getEventAppById = TryCatch(async (req, resp, next) => {
    const event_app = await EventApplication.findOne({
        include: [{
            model: Event, foreignKey: 'event_id', as: 'event', attributes: { exclude: ['description', 'user_id', 'status', 'created_at', 'updated_at'] }
        }, {
            model: EventCompany, foreignKey: 'event_comp_id', attributes: ['id'], include: [{ model: Company, foreignKey: 'company_id', as: 'company', attributes: ['id', 'title'] }]
        }], where: { id: req.params.id, status: true }, attributes: { exclude: ['event_id', 'company_id', 'event_comp_id'] },
    });
    if (!event_app) {
        return next(new ErrorHandler('EVENT APPLICATION NOT FOUND!', 404));
    };

    resp.status(200).json({ success: true, event_app });
});


export const getEventOpts = TryCatch(async (req, resp, next) => {
    const [
        positions, courses, branches, company_opts,
    ] = await Promise.all([
        getPositionOpts(), getCourseOpts(), getBranchOpts(), getCompanyOpts(),
    ]);

    const event_opts = { positions, courses, branches, company_opts };
    resp.status(200).json({ success: true, event_opts });
});



// Event-EventCompanyPostion Relation
Event.hasMany(EventCompany, { foreignKey: 'event_id', as: 'event_companies' });
EventCompany.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

// Application-EventCompanyPostion Relation
EventCompany.hasMany(EventApplication, { foreignKey: 'company_id', as: 'event_apps' });
EventApplication.belongsTo(EventCompany, { foreignKey: 'company_id', as: 'event_company' });

// Company-EventCompanyPostion Relation
Company.hasMany(EventCompany, { foreignKey: 'company_id', as: 'event_companies' });
EventCompany.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

EventCompany.hasMany(Company, { foreignKey: 'company_id', as: 'companies' });
Company.belongsTo(EventCompany, { foreignKey: 'company_id', as: 'event_company' });
