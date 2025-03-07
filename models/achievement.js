import { DataTypes } from 'sequelize';

import Connect from '../utils/connect.js';


const Achievement = Connect.define('achievements', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
    },
    description: {
        type: DataTypes.TEXT,
    },
    org_name: {
        type: DataTypes.STRING,
    },
    date: {
        type: DataTypes.DATE,
    },
    certificate: {
        type: DataTypes.TEXT,
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
    },
}, {
    timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at'
});


export default Achievement;