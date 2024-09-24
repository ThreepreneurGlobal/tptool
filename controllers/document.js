const { rm } = require("fs");
const TryCatch = require("../middleware/TryCatch");
const DocumentModel = require("../models/document");
const User = require("../models/user");
const ErrorHandler = require("../utils/errHandle");


// DocumentModel.sync();

exports.uploadDocument = TryCatch(async (req, resp, next) => {
    const { title, type } = req.body;
    const url = req.file?.path;

    await DocumentModel.create({ title, type, url, userId: req.user.id });
    resp.status(200).json({ success: true, message: 'DOCUMENT UPLOADED SUCCESSFULLY...' });
});


exports.deleteDocument = TryCatch(async (req, resp, next) => {
    const document = await DocumentModel.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!document) {
        return next(new ErrorHandler("Document Not Found!", 404));
    };

    if (document.url) {
        rm(document.url, () => { console.log('OLD FILE REMOVED SUCCESSFULLY...'); });
    };
    await document.update({ status: false });
    resp.status(200).json({ success: true, message: 'DOCUMENT DELETED SUCCESSFULLY...' });
});


// Document and User Association
User.hasMany(DocumentModel, { foreignKey: "userId", as: "id_prfs" });
User.hasMany(DocumentModel, { foreignKey: "userId", as: "certificates" });

DocumentModel.belongsTo(User, { foreignKey: "userId", as: "owner" });