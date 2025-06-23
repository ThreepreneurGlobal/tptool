import { DataTypes } from 'sequelize';

import Connect from './index.js';


const PlacePosition = Connect.define('place_positions', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
    },
    type: {
        type: DataTypes.STRING,
    },
    opening: {
        type: DataTypes.INTEGER,
    },
    courses: {
        type: DataTypes.TEXT,
        get: function () {
            return JSON.parse(this.getDataValue('courses')) || [];
        },
        set: function (value) {
            return this.setDataValue('courses', JSON.stringify(value));
        }
    },
    branches: {
        type: DataTypes.TEXT,
        get: function () {
            return JSON.parse(this.getDataValue('branches')) || [];
        },
        set: function (value) {
            return this.setDataValue('branches', JSON.stringify(value));
        }
    },
    batches: {
        type: DataTypes.TEXT,
        get: function () {
            return JSON.parse(this.getDataValue('batches')) || [];
        },
        set: function (value) {
            return this.setDataValue('batches', JSON.stringify(value));
        }
    },
    placement_id: {
        type: DataTypes.INTEGER,
    },
    company_id: {
        type: DataTypes.INTEGER,
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }
}, {
    timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at'
});


export default PlacePosition;