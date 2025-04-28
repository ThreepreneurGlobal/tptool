import { DataTypes } from 'sequelize';

import Connect from './index.js';


const Experience = Connect.define('experiences', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true
    },
    position: {
        type: DataTypes.STRING,
    },
    org_name: {
        type: DataTypes.STRING,
    },
    location: {
        type: DataTypes.STRING,
    },
    start_date: {
        type: DataTypes.DATE,
    },
    end_date: {
        type: DataTypes.DATE,
    },
    work_type: {
        type: DataTypes.ENUM('hybrid', 'office', 'online'),
    },
    certificate: {
        type: DataTypes.TEXT,
    },
    category: {
        type: DataTypes.ENUM('job', 'internship', 'volenteer'),
    },
    user_id: {
        type: DataTypes.INTEGER,
    },
    student_id: {
        type: DataTypes.INTEGER,
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }
}, {
    timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at'
});


export default Experience;