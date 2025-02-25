import { DataTypes } from 'sequelize';

import Connect from '../utils/connect.js';


const PlacePosition = Connect.define('place_positions', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
    },
    type: {
        type: DataTypes.STRING,
    },
    opening: {
        type: DataTypes.INTEGER,
    },
    placement_id: {
        type: DataTypes.INTEGER,
    },
    company_id: {
        type: DataTypes.INTEGER,
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }
}, {
    timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at'
});


export default PlacePosition;