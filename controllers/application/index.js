import Application from '../../models/application.js';
// import Company from '../../models/company.js';
import PlacePosition from '../../models/place_position.js';
import Placement from '../../models/placement.js';
import User from '../../models/user.js';
import { getAppCompanyOpts, getAppPositionOpts, getAppPositionTypeOpts, getAppStatusOpts } from '../../utils/opt/application.js';
import TryCatch, { ErrorHandler } from '../../utils/trycatch.js';


// ALL APPLICATIONS RECORD
export const getApplications = TryCatch(async (req, resp, next) => {
    const { app_status, position_type, company, position } = req.query;
    const where = { status: true };
    if (app_status) { where.app_status = app_status; };
    if (company) { where.company_id = company; };

    const include = [
        { model: PlacePosition, foreignKey: 'position_id', as: 'position', attributes: ['id', 'title', 'type', 'opening'], where: {}, },
        { model: Placement, foreignKey: 'placement_id', as: 'placement', attributes: ['id', 'title', 'type'], },
        { model: User, foreignKey: 'user_id', as: 'user', attributes: ['id', 'name', 'email', 'avatar'], where: { status: true, is_active: true } },
    ];

    if (position_type) { include[0].where.type = position_type; };
    if (position) { include[0].where.title = position };

    let applications = await Application.findAll({
        where, order: [['created_at', 'DESC']], include,
        attributes: { exclude: ['placement_id', 'position_id', 'user_id', 'status'] },
    });

    applications = await Promise.all(applications.map(async (app) => {
        const comp_promise = await fetch(process.env.SUPER_SERVER + '/v1/master/company/get/' + app?.company_id);
        const { company: { id, title, web } } = await comp_promise.json();
        return { ...app.toJSON(), company: { id, title, web } };
    }));

    resp.status(200).json({ success: true, applications });
});


// SINGLE APPLICATION RECORD
export const applicationById = TryCatch(async (req, resp, next) => {
    const application = await Application.findOne({
        where: { status: true, id: req.params.id },
        attributes: { exclude: ['placement_id', 'position_id', 'user_id'] },
        include: [
            { model: PlacePosition, foreignKey: 'position_id', as: 'position', attributes: ['id', 'title', 'type', 'opening'], },
            {
                model: Placement, foreignKey: 'placement_id', as: 'placement',
                attributes: ['id', 'title', 'type', 'place_status', 'selection_details', 'contact_per', 'reg_start_date', 'reg_end_date', 'rereg_end_date'],
            },
            { model: User, foreignKey: 'user_id', as: 'user', attributes: ['id', 'name', 'email', 'avatar'], where: { status: true, is_active: true } },
            // { model: Company, foreignKey: 'company_id', as: 'company', attributes: ['id', 'title'], },
        ],
    });
    if (!application) {
        return next(new ErrorHandler('APPLICATION NOT FOUND!', 404));
    };

    const comp_promise = await fetch(process.env.SUPER_SERVER + '/v1/master/company/get/' + application?.company_id);
    const { company: { id, title, web } } = await comp_promise.json();

    resp.status(200).json({ success: true, application: { ...application.toJSON(), company: { id, title, web } } });
});


// UPDATE APPLICATION
export const editApplication = TryCatch(async (req, resp, next) => {
    const { app_status, app_status_detail } = req.body;
    const application = await Application.findOne({ where: { status: true, id: req.params.id }, });
    if (!application) {
        return next(new ErrorHandler('APPLICATION NOT FOUND!', 404));
    };

    const shortlist_date = app_status === 'shortlisted' ? new Date() : application?.shortlist_date;
    const assessment_date = app_status === 'assessment' ? new Date() : application?.assessment_date;
    const interview_date = app_status === 'interview_scheduled' ? new Date() : application?.interview_date;
    const offer_date = app_status === 'offer_released' ? new Date() : application?.offer_date;
    const reject_date = app_status === 'rejected' ? new Date() : application?.reject_date;
    const joined_date = app_status === 'joined' ? new Date() : application?.joined_date;
    const withdrawn_date = app_status === 'withdrawn' ? new Date() : application?.withdrawn_date;

    await application.update({
        app_status, app_status_detail, shortlist_date, assessment_date,
        interview_date, offer_date, reject_date, joined_date, withdrawn_date,
    });
    resp.status(200).json({ success: true, message: 'APPLICATION UPDATED!' });
});


// DELETE APPLICATION
export const deleteApplication = TryCatch(async (req, resp, next) => {
    const application = await Application.findOne({ where: { status: true, id: req.params.id }, });
    if (!application) {
        return next(new ErrorHandler('APPLICATION NOT FOUND!', 404));
    };

    await application.update({ status: false });
    resp.status(200).json({ success: true, message: 'APPLICATION DELETED!' });
});


// APPLICATION FILTER OPTIONS
export const appFilterOpts = TryCatch(async (req, resp, next) => {
    const [statuses, position_types, positions, companies] = await Promise.all([
        getAppStatusOpts(), getAppPositionTypeOpts(), getAppPositionOpts(), getAppCompanyOpts()
    ]);

    const filter_opts = { statuses, position_types, positions, companies };
    resp.status(200).json({ success: true, filter_opts });
});




// Position-Applications Relation
Application.belongsTo(PlacePosition, { foreignKey: 'position_id', as: 'position' });
PlacePosition.hasMany(Application, { foreignKey: 'position_id', as: 'applications' });

// Placement-Applications Relation
Application.belongsTo(Placement, { foreignKey: 'placement_id', as: 'placement' });
Placement.hasMany(Application, { foreignKey: 'placement_id', as: 'applications' });

// User-Applications Relation
Application.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Application, { foreignKey: 'user_id', as: 'applications' });

// Company-Applications Relation
// Application.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
// Company.hasMany(Application, { foreignKey: 'company_id', as: 'applications' });
