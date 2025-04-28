import { DataTypes } from 'sequelize';

import Connect from './index.js';



const Notification = Connect.define('notifications', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
    },
    message: {
        type: DataTypes.TEXT,
    },
    email: {
        type: DataTypes.STRING,
    },
    attachment: {
        type: DataTypes.TEXT,
    },
    skill_based: {
        type: DataTypes.TEXT,
        get: function () {
            return JSON.parse(this.getDataValue("skill_based"));
        },
        set: function (value) {
            return this.setDataValue("skill_based", JSON.stringify(value));
        },
    },
    start_date: {
        type: DataTypes.DATE,
    },
    end_date: {
        type: DataTypes.DATE,
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    is_favorite: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    send_to_grp: {
        type: DataTypes.ENUM('user', 'admin', 'super'),
    },
    send_to: {
        type: DataTypes.INTEGER,
    },
    send_from: {
        type: DataTypes.INTEGER,
    },
    notification_type: {
        type: DataTypes.STRING,
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }
}, {
    timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at',
});



export default Notification;
