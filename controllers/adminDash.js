const TryCatch = require("../middleware/TryCatch");
const Application = require("../models/aplication");
const User = require("../models/user");


exports.getAdminStats = TryCatch(async (req, resp, next) => {
    let adminStat = {};

    const studentsPromise = User.findAll({ where: { status: true, orgId: req.user.orgId, role: 'user' } });
    const applicationsPromise = Application.findAll({ where: { status: true, orgId: req.user.orgId } });
    const approveAppsPromise = Application.findAll({ where: { status: true, orgId: req.user.orgId, app_status: 'offers' } });
    const rejectAppsPromise = Application.findAll({ where: { status: true, orgId: req.user.orgId, app_status: 'registered but not approved' } });
    
    const [students, applications, approve_apps, reject_apps] = await Promise.all([
        studentsPromise, applicationsPromise, approveAppsPromise, rejectAppsPromise
    ]);

    adminStat = {
        students_count: students.length, applications_count: applications.length, approve_apps_count: approve_apps.length,
        reject_apps_count: reject_apps.length
    };
    resp.status(200).json({ success: true, adminStat });
});