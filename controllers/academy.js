const TryCatch = require("../middleware/TryCatch");
const Academy = require("../models/academy");
const ErrorHandler = require("../utils/errHandle");

//Collage Academy Sessions Controller
// Academy.sync();

exports.createAcademy = TryCatch(async (req, resp, next) => {
    const { edu_year, sem, assignment, assignment_per, assignment_status, per, live_back, close_back, academic_status, studId, userId } = req.body;
    const marksheet = req.file && req.file.path;

    const existed = await Academy.findOne({ where: { edu_year, sem, studId, orgId: req.user.orgId } });
    if (existed) {
        return next(new ErrorHandler(("Academic Record Already Existed!", 403)));
    };

    await Academy.create({ edu_year, sem, assignment, assignment_per, assignment_status, per, live_back, close_back, marksheet: marksheet ? marksheet : null, academic_status, studId, orgId: req.user.orgId, userId });

    resp.status(201).json({ success: true, message: `Academy Record Created Successfully...` })
});

exports.getAllAcademy = TryCatch(async (req, resp, next) => {
    const academies = await Academy.findAll({ where: { status: true } });
    if (!academies) return next(new ErrorHandler("No Academic Session Available.", 404));

    resp.status(200).json({ success: true, academies });
});

exports.getAllCollageAcademy = TryCatch(async (req, resp, next) => {
    const academies = await Academy.findAll({ where: { status: true, orgId: req.user.orgId } });
    if (!academies) return next(new ErrorHandler("No Academic Session Available.", 404));

    resp.status(200).json({ success: true, academies });
});

exports.getAcademyById = TryCatch(async (req, resp, next) => {
    const academy = await Academy.findOne({ where: { status: true, id: req.params.id } });
    if (!academy) return next(new ErrorHandler("Academy Records Not Available.", 404));

    resp.status(200).json({ success: true, academy });
});

exports.updateAcademy = TryCatch(async (req, resp, next) => {
    const { assignment, assignment_per, assignment_status, per, live_back, close_back, marksheet, academic_status } = req.body;
    let academy = await Academy.findOne({ where: { status: true, id: req.params.id, orgId: req.user.orgId } });
    if (!academy) return next(new ErrorHandler("Academy Not Available.", 404));

    await academy.update({ assignment, assignment_per, assignment_status, per, live_back, close_back, marksheet, academic_status });
    resp.status(200).json({ success: true, message: "Academy Record Updated Successfully..." });
});

exports.deleteAcademy = TryCatch(async (req, resp, next) => {
    let academy = await Academy.findOne({ where: { status: true, id: req.params.id, orgId: req.user.orgId } });
    if (!academy) return next(new ErrorHandler("Academy Not Available.", 404));

    await academy.update({ status: false });
    resp.status(200).json({ success: true, message: "Academy Record Deleted Successfully..." });
});