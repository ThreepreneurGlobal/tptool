const { DataTypes } = require("sequelize");
const Connect = require("../utils/connect");


const Company = Connect.define("companies", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    reg_no: { type: DataTypes.STRING, unique: true },
    address: {
        type: DataTypes.TEXT
    },
    city: {
        type: DataTypes.STRING
    },
    state: {
        type: DataTypes.STRING
    },
    country: {
        type: DataTypes.STRING
    },
    pin_code: {
        type: DataTypes.STRING
    },
    phone: {
        type: DataTypes.STRING
    },
    email: {
        type: DataTypes.STRING,
        validate: {
            isEmail: true
        }
    },
    logo: {
        type: DataTypes.TEXT
    },
    type: {
        type: DataTypes.STRING
    },
    sub_type: {
        type: DataTypes.STRING
    },
    team_size: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    web: {
        type: DataTypes.TEXT
    },
    facebook: {
        type: DataTypes.TEXT
    },
    linkedin: {
        type: DataTypes.TEXT
    },
    youtube: {
        type: DataTypes.TEXT
    },
    instagram: {
        type: DataTypes.TEXT
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
    domains: {
        type: DataTypes.TEXT,
        get: function () {
            return JSON.parse(this.getDataValue("domains"));
        },
        set: function (value) {
            return this.setDataValue("domains", JSON.stringify(value));
        }
    },
    work_types: {
        type: DataTypes.TEXT,
        get: function () {
            return JSON.parse(this.getDataValue("work_types"));
        },
        set: function (value) {
            return this.setDataValue("work_types", JSON.stringify(value));
        }
    },
    userId: {
        type: DataTypes.INTEGER,
    },
    orgId: {
        type: DataTypes.INTEGER
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: true, createdAt: "created_at", updatedAt: "updated_at" });


module.exports = Company;