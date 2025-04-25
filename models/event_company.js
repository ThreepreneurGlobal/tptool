import { DataTypes } from 'sequelize';

import Connect from './index.js';


const EventCompany = Connect.define('event_companies', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true,
    },
    positions: {
        type: DataTypes.TEXT,
        get: function () {
            return JSON.parse(this.getDataValue("positions")) || [];
        },
        set: function (value) {
            return this.setDataValue("positions", JSON.stringify(value));
        },
    },
    batches: {
        type: DataTypes.TEXT,
        get: function () {
            return JSON.parse(this.getDataValue("batches")) || [];
        },
        set: function (value) {
            return this.setDataValue("batches", JSON.stringify(value));
        },
    },
    courses: {
        type: DataTypes.TEXT,
        get: function () {
            return JSON.parse(this.getDataValue("courses")) || [];
        },
        set: function (value) {
            return this.setDataValue("courses", JSON.stringify(value));
        },
    },
    branches: {
        type: DataTypes.TEXT,
        get: function () {
            return JSON.parse(this.getDataValue("branches")) || [];
        },
        set: function (value) {
            return this.setDataValue("branches", JSON.stringify(value));
        },
    },
    company_id: {
        type: DataTypes.INTEGER,
    },
    event_id: {
        type: DataTypes.INTEGER,
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }
}, {
    timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at',
});


export default EventCompany;