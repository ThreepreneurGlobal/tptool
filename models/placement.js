import { DataTypes } from 'sequelize';

import Connect from '../utils/connect.js';


const Placement = Connect.define('placements', {
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
    // exp_opening: {
    //     type: DataTypes.INTEGER,
    //     defaultValue: 0,
    // },
    place_status: {
        type: DataTypes.STRING,
    },
    status_details: {
        type: DataTypes.TEXT,
    },
    selection_details: {
        type: DataTypes.TEXT,
    },
    criteria: {
        type: DataTypes.TEXT,
    },
    other_details: {
        type: DataTypes.TEXT,
    },
    contact_per: {
        type: DataTypes.STRING,
    },
    company_contact: {
        type: DataTypes.STRING,
    },
    reg_sdate: {
        type: DataTypes.DATE,
    },
    reg_edate: {
        type: DataTypes.DATE,
    },
    reg_stime: {
        type: DataTypes.TIME,
    },
    reg_etime: {
        type: DataTypes.TIME,
    },
    rereg_edate: {
        type: DataTypes.DATE,
    },
    rereg_etime: {
        type: DataTypes.TIME,
    },
    reg_details: {
        type: DataTypes.TEXT,
    },
    ctc: {
        type: DataTypes.FLOAT(10, 2),
    },
    stipend: {
        type: DataTypes.FLOAT(10, 2),
    },
    attach_tpo: {
        type: DataTypes.TEXT,
    },
    attach_student: {
        type: DataTypes.TEXT,
    },
    add_comment: {
        type: DataTypes.TEXT,
    },
    history: {
        type: DataTypes.TEXT,
    },
    company_id: {
        type: DataTypes.INTEGER,
    },
    user_id: {
        type: DataTypes.INTEGER,
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }
}, {
    timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at'
});


export default Placement;