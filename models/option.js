const { DataTypes } = require("sequelize");
const Connect = require("../utils/connect");


const Option = Connect.define("options", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    title: {
        type: DataTypes.STRING
    },
    category: {
        type: DataTypes.STRING
    },
    sub_category: {
        type: DataTypes.STRING
    },
    color: {
        type: DataTypes.STRING
    },
    userId: {
        type: DataTypes.INTEGER
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: true, createdAt: "created_at", updatedAt: "updated_at" });

// Option.sync({ alter: true, force: true });
module.exports = Option;