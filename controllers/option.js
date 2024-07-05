const TryCatch = require("../middleware/TryCatch");
const ErrorHandler = require("../utils/errHandle");
const Option = require("../models/option");

// Option.sync({ alter: true, force: true });

exports.getAllOpts = TryCatch(async (req, resp, next) => {
    const options = await Option.findAll({ where: { status: true } });

    resp.status(200).json({ success: true, options });
});

exports.getOptById = TryCatch(async (req, resp, next) => {
    const option = await Option.findOne({ where: { id: req.params.id, status: true } });

    resp.status(200).json({ success: true, option });
});

exports.createOption = TryCatch(async (req, resp, next) => {
    const { title, category, color } = req.body;

    const exist = await Option.findOne({ where: { title: title?.toLowerCase(), category: category?.toLowerCase(), status: true } });
    if (exist) return next(new ErrorHandler(`${exist?.title?.toUpperCase()} ALREADY EXISTS!`, 400));

    const option = await Option.create({ title: title?.toLowerCase(), category: category?.toLowerCase(), color });
    if (req.user.role !== "super") {
        await option.update({ userId: req.user.id });
    }
    resp.status(201).json({ success: true, message: 'OPTION CREATED SUCCESSFULLY.' });
});

exports.getDrpOpts = TryCatch(async (req, resp, next) => {
    const { category } = req.query;
    const options = await Option.findAll({ where: { status: true, category } });

    resp.status(200).json({ success: true, options });
});

exports.editOpt = TryCatch(async (req, resp, next) => {
    const { title, category, color } = req.body;
    
    const option = await Option.findOne({ where: { id: req.params.id, status: true } });
    if (!option) return next(new ErrorHandler("Option Not Found!", 404));

    await option.update({ title, category, color });
    resp.status(201).json({ success: true, message: 'OPTION UPDATED SUCCESSFULLY.' });
});