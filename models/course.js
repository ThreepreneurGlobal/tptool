import { DataTypes } from 'sequelize';

import Connect from './index.js';


const Course = Connect.define('courses_branches', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
    },
    course_name: {
        type: DataTypes.STRING,
    },
    course_code: {
        type: DataTypes.STRING,
    },
    course_type: {
        type: DataTypes.ENUM('diploma', 'ug', 'pg', 'phd'),
    },
    course_description: {
        type: DataTypes.TEXT,
    },
    branch_name: {
        type: DataTypes.STRING,
    },
    branch_code: {
        type: DataTypes.STRING,
    },
    branch_description: {
        type: DataTypes.TEXT,
    },
    college_category: {
        type: DataTypes.STRING,
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at',
});


export default Course;
