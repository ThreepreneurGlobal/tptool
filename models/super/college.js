import { DataTypes } from 'sequelize';

import SuperConnect from './index.js';


const College = SuperConnect.define('colleges', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
    },
    reg_no: {
        type: DataTypes.STRING,
    },
    contact: {
        type: DataTypes.STRING,
    },
    email: {
        type: DataTypes.STRING,
        validate: {
            isEmail: { msg: 'INVALID MAIL ID!' },
        },
    },
    description: {
        type: DataTypes.TEXT,
    },
    web: {
        type: DataTypes.STRING,
        validate: {
            isUrl: { msg: 'INVALID WEBSITE URL!' },
        },
    },
    logo: {
        type: DataTypes.TEXT,
    },
    type: {
        type: DataTypes.ENUM('govt', 'private', 'autonomous'),
    },
    college_id: {
        type: DataTypes.STRING,
    },
    university: {
        type: DataTypes.STRING,
    },
    address: { type: DataTypes.TEXT, },
    city: { type: DataTypes.STRING, },
    state: { type: DataTypes.STRING, },
    country: { type: DataTypes.STRING, },
    pin_code: {
        type: DataTypes.STRING,
    },
    establish_yr: {
        type: DataTypes.DATE,
    },
    principal_name: {
        type: DataTypes.STRING,
    },
    principal_contact: {
        type: DataTypes.STRING,
    },
    principal_email: {
        type: DataTypes.STRING,
        validate: {
            isEmail: { msg: 'INVALID MAIL ID!' },
        },
    },
    facebook: {
        type: DataTypes.TEXT,
        validate: { isUrl: { msg: 'INVALID FACEBOOK PROFILE URL!' } },
    },
    twitter: {
        type: DataTypes.TEXT,
        validate: { isUrl: { msg: 'INVALID TWITTER PROFILE URL!' } },
    },
    instagram: {
        type: DataTypes.TEXT,
        validate: { isUrl: { msg: 'INVALID INSTAGRAM PROFILE URL!' } },
    },
    linkedin: {
        type: DataTypes.TEXT,
        validate: { isUrl: { msg: 'INVALID LINKEDIN PROFILE URL!' } },
    },
    youtube: {
        type: DataTypes.TEXT,
        validate: { isUrl: { msg: 'INVALID YOUTUBE PROFILE URL!' } },
    },
    valid_from: {
        type: DataTypes.DATE,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at',
});


export default College;
