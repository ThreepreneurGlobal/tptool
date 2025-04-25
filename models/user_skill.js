import { DataTypes } from 'sequelize';

import Connect from './index.js';


const UserSkill = Connect.define('user_skills', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true
    },
    rating: {
        type: DataTypes.FLOAT(10, 2),
        defaultValue: 0,
    },
    description: {
        type: DataTypes.TEXT,
    },
    skill_id: {
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


export default UserSkill;