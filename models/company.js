const { DataTypes } = require("sequelize");
const Connect = require("../utils/connect");


const Company = Connect.define("companies", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true
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
        type: DataTypes.INTEGER
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
    // locations: {
    //     type: DataTypes.STRING,
    //     get() {
    //         const rawValue = this.getDataValue('locations');
    //         return rawValue ? JSON.parse(rawValue) : [];
    //     },
    //     set(value) {
    //         this.setDataValue('locations', JSON.stringify(value));
    //     }
    // },
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
    // techs: {
    //     type: DataTypes.INTEGER,
    //     get() {
    //         const rawValue = this.getDataValue('techs');
    //         return rawValue ? JSON.parse(rawValue) : [];
    //     },
    //     set(value) {
    //         this.setDataValue('techs', JSON.stringify(value));
    //     }
    // },
    // features: {
    //     type: DataTypes.TEXT,
    //     get() {
    //         const rawValue = this.getDataValue('features');
    //         return rawValue ? JSON.parse(rawValue) : [];
    //     },
    //     set(value) {
    //         this.setDataValue('features', JSON.stringify(value));
    //     }
    // },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: true, createdAt: "created_at", updatedAt: "updated_at" });

module.exports = Company;