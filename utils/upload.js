import multer from 'multer';
import path from 'path';


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        const originalname = path.parse(file.originalname).name;
        cb(null, originalname + Date.now() + path.extname(file.originalname));
    },
});


const upload = multer({
    storage,
    limits: { fileSize: 10000000 },
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/;
        const mimeType = fileTypes.test(file.mimetype);
        const extName = fileTypes.test(path.extname(file.originalname));

        if (mimeType && extName) {
            return cb(null, true);
        };
        cb(null, false);
    },
});


export default upload;