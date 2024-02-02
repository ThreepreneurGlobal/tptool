const Sequelize = require("sequelize");
const sequelize = require("../Util/database");

const Organization = sequelize.define("organization", {
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
    allowNull: false,
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
  },
  pincode: {
    type: Sequelize.STRING,
    allowNull: true,
    unique: false,
  },
  logo: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  department: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  type: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  location: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  description: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  status: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  },
});

module.exports = Organization;
