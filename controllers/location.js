const TryCatch = require("../middleware/TryCatch");
const ErrorHandler = require("../utils/errHandle");
const Location = require("../models/location");

// Location.sync({ alter: true, force: true });


exports.getAllLocations = TryCatch(async (req, resp, next) => {
    const locations = await Location.findAll({ where: { status: true } });

    resp.status(200).json({ success: true, locations });
});

exports.getLocById = TryCatch(async (req, resp, next) => {
    const location = await Location.findOne({ where: { status: true, id: req.params.id } });
    if (!location) return next(new ErrorHandler("LOCATION NOT FOUND!", 404));

    resp.status(200).json({ success: true, location });
});

exports.createLocation = TryCatch(async (req, resp, next) => {
    const { city, state, country } = req.body;

    const exist = await Location.findOne({ where: { city: city?.toLowerCase(), state: state?.toLowerCase(), country: country?.toLowerCase() } });
    if (exist) return next(new ErrorHandler(`${exist?.city?.toUpperCase()} CITY ALREADY EXISTS!`, 400));

    const loc = await Location.create({ city: city?.toLowerCase(), state: state?.toLowerCase(), country: country?.toLowerCase() });
    if (req.user.role !== "super") {
        await loc.update({ userId: req.user.id });
    };

    resp.status(201).json({ success: true, message: 'CITY CREATED SUCCESSFULLY...' });
});