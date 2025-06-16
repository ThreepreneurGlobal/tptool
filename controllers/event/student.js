import { Op } from 'sequelize';

import Event from '../../models/event.js';
import EventApplication from '../../models/event_app.js';
import EventCompany from '../../models/event_company.js';
import { convertDateToString } from '../../utils/dateFeature.js';
import mailTransporter from '../../utils/mail.js';
import TryCatch, { ErrorHandler } from '../../utils/trycatch.js';


// CREATE EVENT APPLICATION
export const applyEvent = TryCatch(async (req, resp, next) => {
    const { name, email, mobile, college_name, batch, course, branch,
        current_yr, position, event_id, company_id, event_comp_id } = req.body;
    const resume = req.file.path;

    const exists = await EventApplication.findOne({ where: { [Op.or]: [{ email }, { mobile }], company_id, position, status: true } });
    if (exists) {
        return next(new ErrorHandler('APPLICATION ALREADY APPLIED!', 400));
    };
    const event = await Event.findOne({ where: { id: Number(event_id) }, attributes: ['id', 'title', 'category', 'start_date', 'end_date'] });

    const app = await EventApplication.create({
        name, email, mobile, college_name, batch, course, branch, current_yr, position, resume,
        event_id: event?.id, company_id: Number(company_id), event_comp_id: Number(event_comp_id),
    });
    if (!app) {
        return next(new ErrorHandler('APPLICATION NOT APPLIED!', 400));
    };

    const receiver = {
        from: "",
        to: app?.email,
        subject: `Application Received for ${app?.position} - ${event?.category}`,
        html: `
            <p>Dear <strong>${app?.name}</strong>,</p>

            <p style="text-align: justify;">Thank you for applying to <strong>${event?.title}</strong>, organized by <strong>${'Wainganga College of Engineering and Management, Nagpur'}</strong>. We have successfully received your application and are currently reviewing it.</p>
            <p>
                <strong>📅 Start Date:</strong> ${convertDateToString(event?.start_date)} <br>
                <strong>📅 End Date:  </strong> ${convertDateToString(event?.end_date)}
            </p>
            <p style="text-align: justify;">We appreciate your interest and enthusiasm in participating. This event is a great opportunity to showcase your skills, learn, and connect with like-minded peers. Our team will review your application, and we’ll notify you about the next steps soon.</p>
            <p>
                Best Regards, <br>
                <strong>futryoAI</strong>
            </p>
        `,
    };

    await mailTransporter.sendMail(receiver, (error, info) => {
        if (error) {
            return new ErrorHandler(error.message, 400);
        };
    });
    resp.status(201).json({ success: true, message: 'APPLICATION APPLIED!' });
});


// SINGLE EVENT RECORD
export const getUserEventById = TryCatch(async (req, resp, next) => {
    const event = await Event.findOne({
        where: { status: true, id: req.params.id },
        include: [{
            model: EventCompany, foreignKey: 'event_id', as: 'event_companies', attributes: { exclude: ['event_id'] }, where: { status: true },
            // include: [{ model: Company, foreignKey: 'company_id', as: 'company', attributes: ['id', 'title', 'logo'] }]
        }],
    });

    if (!event) {
        return next(new ErrorHandler('EVENT NOT FOUND!', 404));
    };

    const event_companies = await Promise.all(event?.event_companies?.map(async (event_comp) => {
        const comp_promise = await fetch(process.env.SUPER_SERVER + '/v1/master/company/get/' + event_comp?.company_id);
        const { company: { id, title, logo } } = await comp_promise.json();
        return { ...event_comp.toJSON(), company: { id, title, logo } };
    }));

    resp.status(200).json({ success: true, event: { ...event.toJSON(), event_companies } });
});



// Event-EventApp Relation
Event.hasMany(EventApplication, { foreignKey: 'event_id', as: 'event_apps' });
EventApplication.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

// EventCompany-EventApp Relation
EventCompany.hasMany(EventApplication, { foreignKey: 'event_comp_id', });
EventApplication.belongsTo(EventCompany, { foreignKey: 'event_comp_id', });
