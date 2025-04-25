import { DataTypes } from 'sequelize';

import SuperConnect from './index.js';


const SuperUser = SuperConnect.define('users', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    mobile: {
        type: DataTypes.STRING,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: { msg: 'INVALID MAIL ID!' },
        },
    },
    password: {
        type: DataTypes.STRING,
    },
    avatar: {
        type: DataTypes.TEXT,
    },
    address: { type: DataTypes.TEXT, },
    city: { type: DataTypes.STRING, },
    state: { type: DataTypes.STRING, },
    country: { type: DataTypes.STRING, },
    pin_code: {
        type: DataTypes.STRING,
    },
    designation: {
        type: DataTypes.STRING,
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
    otp: {
        type: DataTypes.STRING,
    },
    otp_valid: {
        type: DataTypes.DATE,
    },
    role: {
        type: DataTypes.ENUM('admin', 'super', 'user'),
        defaultValue: 'user',
    },
    college_id: {
        type: DataTypes.INTEGER,
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


export default SuperUser;
