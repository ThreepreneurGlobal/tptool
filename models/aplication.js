const { DataTypes } = require("sequelize");
const Connect = require("../utils/connect");


const Application = Connect.define("applications", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    app_status: {
        type: DataTypes.STRING,
        defaultValue: "pending"
    },
    status_desc: {
        type: DataTypes.TEXT
    },
    orgId: {
        type: DataTypes.INTEGER
    },
    compId: {
        type: DataTypes.INTEGER
    },
    placementId: {
        type: DataTypes.INTEGER
    },
    userId: {
        type: DataTypes.INTEGER
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: true, createdAt: "created_at", updatedAt: "updated_at" });


module.exports = Application;