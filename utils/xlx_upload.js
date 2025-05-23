import multer from 'multer';
import path from 'path';


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});


const xlxUpload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const exts = ['.xlsx', '.xls'];
        const extName = path.extname(file.originalname).toLowerCase();
        if (!exts.includes(extName)) {
            return cb(new ErrorHandler("ONLY EXCEL FILE ALLOWED!", 403));
        };

        // OPTIONALLY, YOU CAN CHECK FILE CONTENT TYPE
        const allowedMimeTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(new Error('INVALID FILE TYPE. ONLY EXCEL FILES ARE ALLOWED.'));
        }

        // PASS THE FILE IF IT MEETS THE VALIDATION CRITERIA
        cb(null, true);
    }
});


export default xlxUpload;
