import { DataTypes } from 'sequelize';

import Connect from './index.js';


const Query = Connect.define('queries', {
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
    query_date: {
        type: DataTypes.STRING,
    },
    contact_email: {
        type: DataTypes.STRING,
        validate: { isEmail: { msg: 'INVALID MAIL ID!' } },
    },
    contact_mobile: {
        type: DataTypes.STRING,
    },
    resolved_notes: {
        type: DataTypes.TEXT,
    },
    resolved_at: {
        type: DataTypes.DATE,
    },
    user_id: {
        type: DataTypes.INTEGER,
    },
    college_id: {
        type: DataTypes.INTEGER,
    },
    resolved_by: {
        type: DataTypes.INTEGER,
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at',
});


export default Query;
