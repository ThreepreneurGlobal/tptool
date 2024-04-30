const { DataTypes } = require("sequelize");
const Connect = require("../utils/connect");


const CollageSkill = Connect.define("collageskills", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    collageId: {
        type: DataTypes.INTEGER
    },
    skillId: {
        type: DataTypes.INTEGER
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: true, createdAt: "created_at", updatedAt: "updated_at" });


module.exports = CollageSkill;