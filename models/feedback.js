import { DataTypes } from 'sequelize';

import Connect from './index.js';


const Feedback = Connect.define('feedbacks', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true,
    },
    message: {
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


export default Feedback;