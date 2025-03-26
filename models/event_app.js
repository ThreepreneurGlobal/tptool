import { DataTypes } from 'sequelize';

import Connect from '../utils/connect.js';


const EventApplication = Connect.define('event_apps', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
    },
    email: {
        type: DataTypes.STRING,
    },
    mobile: {
        type: DataTypes.STRING,
    },
    college_name: {
        type: DataTypes.STRING,
    },
    batch: {
        type: DataTypes.DATE,
    },
    course: {
        type: DataTypes.STRING,
    },
    branch: {
        type: DataTypes.STRING,
    },
    current_yr: {
        type: DataTypes.STRING,
    },
    position: {
        type: DataTypes.STRING,
    },
    resume: {
        type: DataTypes.TEXT,
    },
    event_id: {
        type: DataTypes.INTEGER,
    },
    company_id: {
        type: DataTypes.INTEGER,
    },
    event_comp_id: {
        type: DataTypes.INTEGER,
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }
}, {
    timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at',
});


export default EventApplication;