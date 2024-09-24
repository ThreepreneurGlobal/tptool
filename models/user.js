const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const Connect = require("../utils/connect");


const User = Connect.define("users", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    mobile: {
        type: DataTypes.STRING,
        validate: {
            len: [10, 15]
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true,
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    avatar: {
        type: DataTypes.TEXT
    },
    gender: {
        type: DataTypes.STRING
    },
    address: { type: DataTypes.TEXT },
    city: { type: DataTypes.STRING },
    pin_code: {
        type: DataTypes.STRING,
        validate: {
            len: [6, 6],
        }
    },
    designation: {
        type: DataTypes.STRING,
        defaultValue: "student"
    },
    id_prf: {
        type: DataTypes.STRING
    },
    orgId: {
        type: DataTypes.INTEGER,
    },
    facebook: { type: DataTypes.TEXT },
    twitter: { type: DataTypes.TEXT },
    instagram: { type: DataTypes.TEXT },
    linkedin: { type: DataTypes.TEXT },
    whatsapp: { type: DataTypes.TEXT },
    role: {
        // type:DataTypes.ENUM("user","admin"),
        type: DataTypes.STRING,
        defaultValue: "user"
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: true, createdAt: "created_at", updatedAt: "updated_at" });

User.addHook("beforeCreate", async (user) => {
    if (user.changed("url")) {
        user.url = await bcrypt.hash(user.url, 10);
    };
});

User.addHook("beforeCreate", async (user) => {
    if (user.changed("password")) {
        user.password = await bcrypt.hash(user.password, 10);
    };
});

User.prototype.comparePass = async function (enteredPass) {
    return await bcrypt.compare(enteredPass, this.password);
};

User.prototype.getJWToken = function () {
    return jwt.sign({ id: this.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

module.exports = User;