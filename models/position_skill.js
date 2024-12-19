import { DataTypes } from 'sequelize';

import Connect from '../utils/connect.js';


const PositionSkill = Connect.define('position_skills', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true,
    },
    skill_id: {
        type: DataTypes.INTEGER,
    },
    position_id: {
        type: DataTypes.INTEGER,
    },
    placement_id: {
        type: DataTypes.INTEGER,
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }
}, {
    timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at'
});


export default PositionSkill;