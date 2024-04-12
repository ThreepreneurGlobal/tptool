const { DataTypes } = require("sequelize");
const Connect = require("../utils/connect");

//Collage Academy Sessions Model

const Academy = Connect.define("academics", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true
    },
    edu_year: {
        type: DataTypes.INTEGER
    },
    sem: {
        type: DataTypes.INTEGER
    },
    assignment: {
        type: DataTypes.STRING,
    },
    assignment_per: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    assignment_status: {
        type: DataTypes.STRING,
    },
    per: {
        type: DataTypes.FLOAT
    },
    close_back: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    live_back: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    marksheet: {
        type: DataTypes.TEXT
    },
    academic_status: {
        type: DataTypes.STRING,
    },
    studId: {
        type: DataTypes.INTEGER
    },
    orgId: {
        type: DataTypes.INTEGER
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true, createdAt: "created_at", updatedAt: "updated_at"
});


module.exports = Academy;