import multer from 'multer';
import { rm } from 'fs';
import path from 'path';
import { promisify } from 'util';


const rmAsync = promisify(rm);


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "upload");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10000000 },
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|pdf/;
        const mimeType = fileTypes.test(file.mimetype);
        const extName = fileTypes.test(path.extname(file.originalname));

        if (mimeType && extName) {
            return cb(null, true);
        };
        cb(null, false);
    }
});


const uploadFile = async (exist_file, file_handle, txt_handle) => {
    let logo;

    if (file_handle && (exist_file || exist_file === null)) {
        await rmAsync(exist_file).catch(err => console.error(err?.message));
        console.log('OLD FILE DELETED!');
        logo = file_handle;
    } else if (txt_handle === null && file_handle === null && exist_file) {
        await rmAsync(exist_file).catch(err => console.error(err?.message));
        console.log('OLD FILE DELETED!');
        logo = null;
    } else if (typeof txt_handle === 'string') {
        logo = exist_file;
    };

    return logo;
};


export { uploadFile };
export default upload;