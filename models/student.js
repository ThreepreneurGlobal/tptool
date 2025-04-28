import { DataTypes } from 'sequelize';

import Connect from './index.js';


const Student = Connect.define("students", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true
    },
    dob: {
        type: DataTypes.DATE
    },
    course: {
        type: DataTypes.STRING
    },
    branch: {
        type: DataTypes.STRING
    },
    batch: {
        type: DataTypes.DATE
    },
    current_yr: { type: DataTypes.STRING },
    enroll: {
        type: DataTypes.STRING
    },
    abc_id: {
        type: DataTypes.STRING,
    },
    ten_yr: {
        type: DataTypes.DATE,
    },
    ten_board: {
        type: DataTypes.STRING,
    },
    // ten_stream: {
    //     type: DataTypes.STRING,
    // },
    ten_per: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    twelve_yr: {
        type: DataTypes.DATE,
    },
    twelve_board: {
        type: DataTypes.STRING,
    },
    twelve_stream: {
        type: DataTypes.STRING,
    },
    twelve_per: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    diploma: {
        type: DataTypes.STRING
    },
    diploma_branch: {
        type: DataTypes.STRING
    },
    diploma_yr: {
        type: DataTypes.DATE,
    },
    diploma_per: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    degree_name: {
        type: DataTypes.STRING
    },
    degree_university: {
        type: DataTypes.STRING,
    },
    degree_branch: {
        type: DataTypes.STRING
    },
    degree_yr: {
        type: DataTypes.DATE,
    },
    degree_per: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    ed_gap: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    gap_desc: {
        type: DataTypes.TEXT,
    },
    disability: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    experience: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    interested_in: {
        type: DataTypes.TEXT,
        get: function () {
            return JSON.parse(this.getDataValue("interested_in"));
        },
        set: function (value) {
            return this.setDataValue("interested_in", JSON.stringify(value));
        }
    },
    langs: {
        type: DataTypes.TEXT,
        get: function () {
            return JSON.parse(this.getDataValue("langs"));
        },
        set: function (value) {
            return this.setDataValue("langs", JSON.stringify(value));
        }
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    user_id: {
        type: DataTypes.INTEGER,
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true, createdAt: "created_at", updatedAt: "updated_at"
});


export default Student;