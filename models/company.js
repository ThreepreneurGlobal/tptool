import { DataTypes } from 'sequelize';

import Connect from './index.js';


const Company = Connect.define('companies', {
    id: {
        type: DataTypes.INTEGER,
        unique: true,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING,
    },
    type: {
        type: DataTypes.STRING,
    },
    description: {
        type: DataTypes.TEXT,
    },
    reg_no: {
        type: DataTypes.STRING,
    },
    contact: {
        type: DataTypes.STRING,
    },
    contact_alt: {
        type: DataTypes.STRING,
    },
    email: {
        type: DataTypes.STRING,
    },
    email_alt: {
        type: DataTypes.STRING,
    },
    logo: {
        type: DataTypes.TEXT,
    },
    team_size: {
        type: DataTypes.INTEGER,
    },
    work_domains: {
        type: DataTypes.TEXT,
        get: function () {
            return JSON.parse(this.getDataValue('work_domains'));
        },
        set: function (values) {
            return this.setDataValue('work_domains', JSON.stringify(values));
        },
    },
    work_types: {
        type: DataTypes.TEXT,
        get: function () {
            return JSON.parse(this.getDataValue('work_types'));
        },
        set: function (values) {
            return this.setDataValue('work_types', JSON.stringify(values));
        },
    },
    web: {
        type: DataTypes.TEXT('tiny'),
    },
    facebook: {
        type: DataTypes.TEXT('tiny'),
    },
    linkedin: {
        type: DataTypes.TEXT('tiny'),
    },
    youtube: {
        type: DataTypes.TEXT('tiny'),
    },
    instagram: {
        type: DataTypes.TEXT('tiny'),
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at',
});


export default Company;
