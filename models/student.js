const { DataTypes } = require("sequelize");
const Connect = require("../utils/connect");


const Student = Connect.define("students", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true
    },
    dob: {
        type: DataTypes.DATEONLY
    },
    courseId: {
        type: DataTypes.INTEGER
    },
    course_desc: {
        type: DataTypes.TEXT
    },
    batch: {
        type: DataTypes.INTEGER
    },
    branchId: {
        type: DataTypes.INTEGER
    },
    current_yr: { type: DataTypes.INTEGER },
    enroll: {
        type: DataTypes.STRING
    },
    universityId: {
        type: DataTypes.INTEGER
    },
    ten_yr: {
        type: DataTypes.INTEGER,
    },
    ten_board: {
        type: DataTypes.STRING,
    },
    ten_per: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    twelve_yr: {
        type: DataTypes.INTEGER,
    },
    twelve_board: {
        type: DataTypes.STRING,
    },
    twelve_stream: {
        type: DataTypes.TEXT,
    },
    twelve_per: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    diploma: {
        type: DataTypes.STRING
    },
    diploma_stream: {
        type: DataTypes.STRING
    },
    diploma_per: {
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
    disablity: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    experience: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    interested_in: {
        type: DataTypes.STRING,
        get: function () {
            return JSON.parse(this.getDataValue("interested_in"));
        },
        set: function (value) {
            return this.setDataValue("interested_in", JSON.stringify(value));
        }
    },
    position: {
        type: DataTypes.STRING,
    },
    langs: {
        type: DataTypes.STRING,
        get: function () {
            return JSON.parse(this.getDataValue("langs"));
        },
        set: function (value) {
            return this.setDataValue("langs", JSON.stringify(value));
        }
    },
    userId: {
        type: DataTypes.INTEGER,
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true, createdAt: "created_at", updatedAt: "updated_at"
});

module.exports = Student;