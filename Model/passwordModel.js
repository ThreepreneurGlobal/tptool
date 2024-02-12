const Sequelize = require('sequelize');
const sequelize = require('../Util/database');
const {v4: uuidv4} = require('uuid')

const forgetPassword = sequelize.define('forgetPasswordRequest', {
  id: {
    type: Sequelize.UUID,
    allowNull: false,
    primaryKey: true
  },
  userId: {
    type: Sequelize.STRING,
    required: true,
  },
  email: {
    type: Sequelize.STRING,
    required: true
  },
  isactive: {
    type: Sequelize.BOOLEAN
  }
}); 

module.exports = forgetPassword;