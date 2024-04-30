const { DataTypes } = require("sequelize");
const Connect = require("../utils/connect");


const CompanySkill = Connect.define("companyskills", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    companyId: {
        type: DataTypes.INTEGER
    },
    skillId: {
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


module.exports = CompanySkill;