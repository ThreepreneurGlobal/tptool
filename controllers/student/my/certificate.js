import fs from 'fs';
import Certificate from '../../../models/certificate.js';
import Student from '../../../models/student.js';
import User from '../../../models/user.js';
import TryCatch, { ErrorHandler } from '../../../utils/trycatch.js';

// Certificate.sync();

export const addCertificate = TryCatch(async (req, resp, next) => {
    const certificates = req?.files;

    const student = await Student.findOne({
        where: { user_id: req.user.id, status: true }, attributes: ['id', 'user_id']
    });
    if (!student) {
        return next(new ErrorHandler('INVALID STUDENT!', 403));
    };

    if (Array.isArray(certificates)) {
        for (const item of certificates) {
            const certificate = await Certificate.create({
                title: item?.originalname, url: item?.path, user_id: req.user.id, student_id: student?.id,
            });

            if (!certificate) {
                fs.rm(item?.path, () => console.log('DELETE FILE SUCCESSFULLY!'));
                return;
            };
        };
    };
    resp.status(201).json({ success: true, message: 'CERTIFICATE UPLOADED!' });
});


export const deleteCertificate = TryCatch(async (req, resp, next) => {
    const certificate = await Certificate.findOne({
        where: { id: req.body.id, user_id: req.user.id, status: true }
    });
    if (!certificate) {
        return next(new ErrorHandler('CERTIFICATE NOT FOUND!', 404));
    };

    await certificate.update({ status: false });
    resp.status(200).json({ success: true, message: 'CERTIFICATE DELETED!' });
});




//Certificate to Student Association
Student.hasMany(Certificate, { foreignKey: 'student_id', as: 'certificates' });
Certificate.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

//Certificate to User Association
User.hasMany(Certificate, { foreignKey: 'user_id', as: 'certificates' });
Certificate.belongsTo(User, { foreignKey: 'user_id', as: 'user' });