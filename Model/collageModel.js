const Sequelize = require('sequelize');
const sequelize = require('../Util/database');

const Organization = sequelize.define('organization', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false, 
        primaryKey: true,
        autoIncrement: true,
    }, 
    collageName: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    address: { 
        type: Sequelize.STRING,
        unique: false,
        allowNull: true,
    },
    telephone: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    city: {
        type: Sequelize.STRING,
        unique: false,
        allowNull: false
    },
    state: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false, 
    },
    regNo: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false,
    }
});

module.exports = Organization;
