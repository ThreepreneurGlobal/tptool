const { DataTypes } = require("sequelize");
const Connect = require("../utils/connect");


const CollageCompany = Connect.define("relorgs", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    collageId: {
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


module.exports = CollageCompany;