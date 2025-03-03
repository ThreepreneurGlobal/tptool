import { DataTypes } from 'sequelize';

import Connect from '../utils/connect.js';


const Project = Connect.define('projects', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
    },
    url: {
        type: DataTypes.TEXT,
    },
    prev_img: {
        type: DataTypes.TEXT,
    },
    project_status: {
        type: DataTypes.ENUM('processing', 'pending', 'completed', 'cancelled'),
        defaultValue: 'processing',
    },
    description: {
        type: DataTypes.TEXT,
    },
    rating: {
        type: DataTypes.FLOAT(10, 2),
    },
    skills: {
        type: DataTypes.TEXT,
        get: function () {
            return JSON.parse(this.getDataValue("skills"));
        },
        set: function (value) {
            return this.setDataValue("skills", JSON.stringify(value));
        },
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
    timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at',
});


export default Project;