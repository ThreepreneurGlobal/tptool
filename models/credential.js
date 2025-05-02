import { DataTypes } from 'sequelize';

import Connect from './index.js';


const Credential = Connect.define('credentials', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true
    },
    db_name: {
        type: DataTypes.STRING,
    },
    db_user: {
        type: DataTypes.STRING,
    },
    db_pass: {
        type: DataTypes.STRING,
    },
    db_port: {
        type: DataTypes.INTEGER,
    },
    db_host: {
        type: DataTypes.STRING,
    },
    back_host_url: {
        type: DataTypes.STRING,
        validate: { isUrl: { msg: 'INVALID HOSTING URL!' } },
    },
    back_api_key: {
        type: DataTypes.STRING,
    },
    front_host_url: {
        type: DataTypes.STRING,
        validate: { isUrl: { msg: 'INVALID HOSTING URL!' } },
    },
    front_api_key: {
        type: DataTypes.STRING,
    },
    last_maintenance_date: {
        type: DataTypes.DATE,
    },
    backup_frequency: {
        type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly'),
        defaultValue: 'yearly',
    },
    college_id: {
        type: DataTypes.INTEGER,
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, { timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });


export default Credential;
