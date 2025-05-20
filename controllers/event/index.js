import Company from '../../models/company.js';
import Event from '../../models/event.js';
import EventApplication from '../../models/event_app.js';
import EventCompany from '../../models/event_company.js';
import User from '../../models/user.js';
import { convertDateToString } from '../../utils/dateFeature.js';
import mailTransporter from '../../utils/mail.js';
import { getCompanyOpts } from '../../utils/opt/company.js';
import { getBranchOpts, getCategoryOpts, getCourseOpts, getPositionOpts } from '../../utils/opt/event.js';
import TryCatch, { ErrorHandler } from '../../utils/trycatch.js';

// Event.sync({ alter: true, force: true });
// EventCompany.sync({ alter: true, force: true });
// EventApplication.sync({ alter: true, force: true });

// ALL EVENTS RECORDS
export const getEvents = TryCatch(async (req, resp, next) => {
    const { category } = req.query;

    const where = { status: true };
    if (category) { where.category = category; };

    let events = await Event.findAll({
        where, attributes: { exclude: ['description', 'user_id', 'status', 'updated_at'] },
        include: [{
            model: EventCompany, foreignKey: 'event_id', as: 'event_companies', attributes: ['id'], where: { status: true },
            // include: [{ model: Company, foreignKey: 'company_id', as: 'company', attributes: ['id', 'title', 'logo'] }]
        }],
    });

    events = await Promise.all(events.map(async (event) => {
        const comp_promise = await fetch(process.env.SUPER_SERVER + '/v1/master/company/get/' + event?.company_id);
        const { company: { id, title, logo } } = await comp_promise.json();
        return { ...event.toJSON(), company: { id, title, logo } };
    }));

    resp.status(200).json({ success: true, events });
});


// SINGLE EVENT RECORD
export const getEventById = TryCatch(async (req, resp, next) => {
    const event = await Event.findOne({
        where: { status: true, id: req.params.id },
        include: [{
            model: EventCompany, foreignKey: 'event_id', as: 'event_companies', attributes: { exclude: ['company_id', 'event_id'] }, where: { status: true },
            // include: [{ model: Company, foreignKey: 'company_id', as: 'company', attributes: ['id', 'title', 'logo'] }]
        }],
    });

    if (!event) {
        return next(new ErrorHandler('EVENT NOT FOUND!', 404));
    };

    const comp_promise = await fetch(process.env.SUPER_SERVER + '/v1/master/company/get/' + event?.company_id);
    const { company: { id, title, logo } } = await comp_promise.json();

    resp.status(200).json({ success: true, event: { ...event.toJSON(), company: { id, title, logo } } });
});


// CREATE EVENT
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
        const create = await EventCompany.create({ positions, batches, courses, branches, company_id: Number(company_id), event_id: event?.id });
        if (!create) {
            return new ErrorHandler('EVENT COMPANY NOT CREATED!', 400);
        };
    };

    // SEND EMAIL FOR ALL COLLEGE STUDENTS!
    const users = await User.findAll({ where: { status: true, is_active: true, role: 'user' }, attributes: ['id', 'name', 'email'] });
    const receiver = {
        from: process.env.MAIL_USER,
        to: users?.map(item => item?.email),
        subject: `Join Us for ${event?.title} at Your College!`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>College Event Notification</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
                <table align="center" width="600" cellpadding="0" cellspacing="0"
                    style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background-color: #003366; padding: 20px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0;">College Event Alert</h1>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 20px;">
                            <h2 style="color: #333333;">🎉 You're Invited: <span style="color: #003366;">${event?.title}</span></h2>
                            <p style="color: #555555; font-size: 16px;">
                                Dear Student,<br><br>
                                We are excited to invite you to our upcoming event <strong>"${event?.title}"</strong> hosted
                                by the Our College.
                            </p>

                            <table cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                                <tr>
                                    <td style="padding: 10px 0;"><strong>📅 Event Start Date:</strong></td>
                                    <td style="padding: 10px 0;">${convertDateToString(event?.start_date)}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0;"><strong>🕔 Event End Date:</strong></td>
                                    <td style="padding: 10px 0;">${convertDateToString(event?.end_date)}</td>
                                </tr>
                            </table>

                            <p style="color: #555555; font-size: 16px;">
                                Join us for workshops, guest lectures, competitions, and networking with professionals in the tech
                                industry. Don't miss out on this chance to be part of something exciting!
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 14px; color: #888888;">
                            ©${new Date().getFullYear()} TPConnect. All rights reserved.
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `,
    };
    await mailTransporter.sendMail(receiver, (error, info) => {
        if (error) {
            return new ErrorHandler(error.message, 400);
        };
    });
    resp.status(201).json({ success: true, message: 'EVENT CREATED!' });
});


// UPDATE EVENT
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
    const reqCompanyIds = companies?.map(comp => Number(comp?.id)).filter(id => id !== undefined);
    const companyToDelete = existingCompanyIds?.filter(id => !reqCompanyIds?.includes(id));

    for (const company of companies) {
        const { id, positions, batches, courses, branches, company_id } = company;
        if (id) {
            const existCompany = existingCompanies?.find(comp => comp?.id === Number(id));
            if (existCompany) {
                await existCompany.update({ positions, batches, courses, branches, company_id: Number(company_id) });
            };
        } else {
            const create = await EventCompany.create({ positions, batches, courses, branches, company_id: Number(company_id), event_id: event?.id });
            if (!create) {
                return new ErrorHandler('EVENT COMPANY NOT CREATED!', 400);
            };
        };
    };

    for (const deleteComp of companyToDelete) {
        const deleteEventComp = await EventCompany.findOne({ where: { id: deleteComp, status: true } });
        if (deleteEventComp) {
            await deleteEventComp.update({ status: false });
        };
    };

    resp.status(200).json({ success: true, message: 'EVENT UPDATED!' });
});


// ALL EVENT APPLICATIONS
export const getEventApps = TryCatch(async (req, resp, next) => {
    const { category } = req.query;
    const where = { status: true };
    if (category) { where.category = category; };

    let event_apps = await EventApplication.findAll({
        include: [{
            model: Event, foreignKey: 'event_id', as: 'event', where, attributes: { exclude: ['description', 'user_id', 'status', 'created_at', 'updated_at'] }
        }, {
            model: EventCompany, foreignKey: 'event_comp_id', attributes: ['id'],
            // include: [{ model: Company, foreignKey: 'company_id', as: 'company', attributes: ['id', 'title'] }]
        }], where: { status: true }, attributes: { exclude: ['event_id', 'event_comp_id'] }
    });

    event_apps = await Promise.all(event_apps.map(async (app) => {
        const comp_promise = await fetch(process.env.SUPER_SERVER + '/v1/master/company/get/' + app?.company_id);
        const { company: { id, title, web } } = await comp_promise.json();
        return { ...app.toJSON(), company: { id, title, web } };
    }));
    resp.status(200).json({ success: true, event_apps });
});


// SINGLE EVENT APPLICATIONS
export const getEventAppById = TryCatch(async (req, resp, next) => {
    const event_app = await EventApplication.findOne({
        include: [{
            model: Event, foreignKey: 'event_id', as: 'event', attributes: { exclude: ['description', 'user_id', 'status', 'created_at', 'updated_at'] }
        }, {
            model: EventCompany, foreignKey: 'event_comp_id', attributes: ['id'],
            // include: [{ model: Company, foreignKey: 'company_id', as: 'company', attributes: ['id', 'title'] }]
        }], where: { id: req.params.id, status: true }, attributes: { exclude: ['event_id', 'event_comp_id'] },
    });
    if (!event_app) {
        return next(new ErrorHandler('EVENT APPLICATION NOT FOUND!', 404));
    };

    const comp_promise = await fetch(process.env.SUPER_SERVER + '/v1/master/company/get/' + event_app?.company_id);
    const { company: { id, title, web } } = await comp_promise.json();

    resp.status(200).json({ success: true, event_app: { ...event_app.toJSON(), company: { id, title, web } } });
});


// OPTIONS FOR CREATE EVENT
export const getEventOpts = TryCatch(async (req, resp, next) => {
    const [
        positions, courses, branches, company_opts,
    ] = await Promise.all([
        getPositionOpts(), getCourseOpts(), getBranchOpts(), getCompanyOpts(),
    ]);

    const event_opts = { positions, courses, branches, company_opts };
    resp.status(200).json({ success: true, event_opts });
});


// OPTIONS FOR FILTER EVENT
export const getEventFilterOpts = TryCatch(async (req, resp, next) => {
    const [categories] = await Promise.all([getCategoryOpts()]);

    const filter_opts = { categories };
    resp.status(200).json({ success: true, filter_opts });
});



// Event-EventCompanyPostion Relation
Event.hasMany(EventCompany, { foreignKey: 'event_id', as: 'event_companies' });
EventCompany.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

// Application-EventCompanyPostion Relation
EventCompany.hasMany(EventApplication, { foreignKey: 'company_id', as: 'event_apps' });
EventApplication.belongsTo(EventCompany, { foreignKey: 'company_id', as: 'event_company' });

// Company-EventCompanyPostion Relation
// Company.hasMany(EventCompany, { foreignKey: 'company_id', as: 'event_companies' });
// EventCompany.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

// EventCompany.hasMany(Company, { foreignKey: 'company_id', as: 'companies' });
// Company.belongsTo(EventCompany, { foreignKey: 'company_id', as: 'event_company' });
