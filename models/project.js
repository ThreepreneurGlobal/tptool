const { DataTypes } = require("sequelize");
const Connect = require("../utils/connect");


const Project = Connect.define("projects", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING
    },
    description: {
        type: DataTypes.TEXT
    },
    type: {
        type: DataTypes.STRING
    },
    start: {
        type: DataTypes.DATEONLY,
        defaultValue: Date.now
    },
    end: {
        type: DataTypes.DATEONLY
    },
    proj_status: {
        type: DataTypes.ENUM("working", "completed", "testing"),
        defaultValue: "working"
    },
    demo_img: {
        type: DataTypes.TEXT
    },
    demo_url: {
        type: DataTypes.TEXT
    },
    logo: {
        type: DataTypes.TEXT
    },
    studId: {
        type: DataTypes.INTEGER
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true, createdAt: "created_at", updatedAt: "updated_at"
});

module.exports = Project;