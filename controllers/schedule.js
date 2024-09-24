const cron = require("node-cron");
const { Op } = require("sequelize");
const moment = require("moment");
const Placement = require("../models/placement");
const TryCatch = require("../middleware/TryCatch");


const autoUpdatePlace = TryCatch(async (req, resp, next) => {
    const today = moment().format('YYYY-MM-DD');
    let placements = await Placement.findAll({
        where: { status: true, rereg_edate: { [Op.lt]: today } }
    });

    for (const placement of placements) {
        await placement.update({ place_status: "closed" });
    };
    next();
});

cron.schedule('0 0 * * *', () => {
    autoUpdatePlace();
});