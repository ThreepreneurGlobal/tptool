const { DataTypes } = require("sequelize");
const Connect = require("../utils/connect");


const Org = Connect.define("collages", {
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
    reg_no: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
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
        type: DataTypes.STRING,
        validate: {
            len: [6, 6],
        }
    },
    phone: {
        type: DataTypes.STRING,
        validate: {
            len: [10, 15]
        }
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
    universityId: { type: DataTypes.INTEGER },
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
    features: {
        type: DataTypes.TEXT,
        get() {
            const rawValue = this.getDataValue('features');
            return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
            this.setDataValue('features', JSON.stringify(value));
        }
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: true, createdAt: "created_at", updatedAt: "updated_at" });

module.exports = Org;