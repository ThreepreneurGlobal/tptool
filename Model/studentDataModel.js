// models/User.js
const Sequelize = require('sequelize');
const sequelize = require('../Util/database');

const studentData = sequelize.define('studentData', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  phoneNumber: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  enrollmentId: {
    type: Sequelize.BIGINT(10),
    allowNull: true,
  },
  collageId: {
    type: Sequelize.BIGINT(10),
    allowNull: true,
  },
  image: {
    type: Sequelize.STRING,
    allowNull: true, 
  },
  email: {
    type: Sequelize.STRING,
    allowNull: true, 
    unique: true,
  },
  twelfthPercentage: {
    type: Sequelize.FLOAT, 
    allowNull: true, 
  },
  skills: {
    type: Sequelize.STRING,
    allowNull: true, 
  },
  certification: { 
    type: Sequelize.STRING,
    allowNull: true, 
  },
  branch: {
    type: Sequelize.STRING,
    allowNull: true, 
  },
  password: {
    type: Sequelize.STRING,
    allowNull: true, 
  }
});

module.exports = studentData; 
