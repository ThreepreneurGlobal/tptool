import bcryptjs from 'bcryptjs';

import College from '../../models/college.js';
import Credential from '../../models/credential.js';
import { decryptData, encryptData } from '../../utils/hashing.js';
import TryCatch, { ErrorHandler } from '../../utils/trycatch.js';


export const getCredentials = TryCatch(async (req, resp, next) => {
    let credentials = await Credential.findAll({
        where: { status: true }, attributes: { exclude: ['db_user', 'db_pass', 'db_host', 'db_port', 'back_api_key', 'front_api_key', 'college_id'] },
        include: [{ model: College, foreignKey: 'college_id', as: 'college', attributes: ['id', 'name', 'reg_no', 'web', 'logo'] }],
    });

    credentials = credentials?.map(item => {
        const data = item.toJSON();
        data.db_name = decryptData(item?.db_name);
        return data;
    });
    resp.status(200).json({ success: true, credentials });
});


export const getCredentialById = TryCatch(async (req, resp, next) => {
    const credential = await Credential.findOne({
        where: { id: req.params.id, status: true }, attributes: { exclude: ['college_id', 'db_user', 'db_pass', 'db_host'] },
        include: [{ model: College, foreignKey: 'college_id', as: 'college', attributes: ['id', 'name', 'reg_no', 'web', 'logo', 'university', 'state', 'country'] }]
    });
    if (!credential) {
        return next(new ErrorHandler('RECORD NOT FOUND!', 404));
    };

    const data = credential.toJSON();
    data.db_name = decryptData(credential?.db_name);

    resp.status(200).json({ success: true, credential: data });
});


export const createCredential = TryCatch(async (req, resp, next) => {
    const { db_name, db_user, db_pass, db_port, db_host, back_host_url, back_api_key,
        front_host_url, front_api_key, last_maintenance_date, backup_frequency, college_id } = req.body;

    const exists = await Credential.findOne({ where: { college_id } });
    if (exists) {
        return next(new ErrorHandler('RECORD ALREADY EXISTS!', 400));
    };

    const db_name_hash = encryptData(db_name);
    const db_user_hash = encryptData(db_user);
    const db_pass_hash = encryptData(db_pass);
    const db_host_hash = encryptData(db_host);

    const credential = await Credential.create({
        db_name: db_name_hash, db_user: db_user_hash, db_pass: db_pass_hash, db_port, db_host: db_host_hash,
        back_host_url, back_api_key, front_host_url, front_api_key, last_maintenance_date, backup_frequency, college_id,
    });
    if (!credential) {
        return next(new ErrorHandler('RECORD NOT CREATED!', 400));
    };

    resp.status(201).json({ success: true, message: 'RECORD CREATED!' });
});



export const editCredential = TryCatch(async (req, resp, next) => {
    const { db_name, db_user, db_pass, db_port, db_host, back_host_url, back_api_key,
        front_host_url, front_api_key, last_maintenance_date, backup_frequency } = req.body;

    const credential = await Credential.findOne({ where: { id: req.params.id, status: true } });
    if (!credential) {
        return next(new ErrorHandler('CREDENTIAL NOT FOUND!'));
    };

    const db_name_hash = encryptData(db_name);
    const db_user_hash = encryptData(db_user);
    const db_pass_hash = encryptData(db_pass);
    const db_host_hash = encryptData(db_host);

    await credential.update({
        db_name: db_name_hash, db_user: db_user_hash, db_pass: db_pass_hash, db_port, db_host: db_host_hash,
        back_host_url, back_api_key, front_host_url, front_api_key, last_maintenance_date, backup_frequency,
    });

    resp.status(201).json({ success: true, message: 'RECORD UPDATED!' });
});




// CREDENTIAL - COLLEGE RELATION
Credential.belongsTo(College, { foreignKey: 'college_id', as: 'college' });
College.hasOne(Credential, { foreignKey: 'college_id', as: 'college' });
