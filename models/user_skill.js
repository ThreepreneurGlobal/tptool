import { DataTypes } from 'sequelize';

import Connect from '../utils/connect.js';


const UserSkill = Connect.define('user_skills', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true
    },
    skill_id: {
        type: DataTypes.INTEGER,
    },
    user_id: {
        type: DataTypes.INTEGER,
    },
    student_id: {
        type: DataTypes.INTEGER,
    },
    rating: {
        type: DataTypes.FLOAT(10, 2),
    },
    description: {
        type: DataTypes.TEXT,
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }
}, {
    timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at'
});


export default UserSkill;