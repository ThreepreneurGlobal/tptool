const { DataTypes } = require("sequelize");
const Connect = require("../utils/connect");


const PlacePosition = Connect.define("placepositions", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    title: {
        type: DataTypes.STRING
    },
    locations: {
        type: DataTypes.TEXT,
        get: function () {
            return JSON.parse(this.getDataValue("locations"));
        },
        set: function (value) {
            return this.setDataValue("locations", JSON.stringify(value));
        }
    },
    type: {
        type: DataTypes.STRING,
        defaultValue: "intern"
    },
    placementId: {
        type: DataTypes.INTEGER
    },
    companyId: {
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


module.exports = PlacePosition;