const { DataTypes } = require("sequelize");
const Connect = require("../utils/connect");


const PlaceSkill = Connect.define("placeskills", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    placementId: {
        type: DataTypes.INTEGER
    },
    skillId: {
        type: DataTypes.INTEGER
    },
    userId: {
        type: DataTypes.INTEGER
    },
    companyId: {
        type: DataTypes.INTEGER
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: true, createdAt: "created_at", updatedAt: "updated_at" });


module.exports = PlaceSkill;