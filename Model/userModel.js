const Sequelize = require('sequelize')

const sequelize = require('../Util/database');

const User = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false, 
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    password : {
        type: Sequelize.STRING,
        unique: false,
        allowNull: true
    },
    percentage: {
        type: Sequelize.FLOAT, 
        allowNull: true, 
    },
    skills: {
        type: Sequelize.STRING,
        allowNull: true, 
    },
    role: {
        type: Sequelize.STRING,
        allowNull: false
    },  
    image: {
        type: Sequelize.STRING,
        allowNull: true, 
    }, 
    mobile:{
        type: Sequelize.STRING,
        allowNull: true,
    },
    branch: {
        type: Sequelize.STRING,
        allowNull: true
    },
    year: {
        type: Sequelize.INTEGER,
        allowNull: true
    }
})
 
 
module.exports = User;

 