const multer = require("multer");
const path = require("path");
const ErrorHandler = require("./errHandle");


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "upload");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});


const xlxUpload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const exts = ['.xlsx', '.xls'];
        const extName = path.extname(file.originalname).toLowerCase();
        if (!exts.includes(extName)) {
            return cb(new ErrorHandler("Only Excel File Allowed!", 403));
        };
        // Optionally, you can check file content type
        const allowedMimeTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(new Error('Invalid file type. Only Excel files are allowed.'));
        }

        // Pass the file if it meets the validation criteria
        cb(null, true);
    }
});

module.exports = xlxUpload;