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
    allowNull: true,
  },
  city: {
    type: Sequelize.STRING,
    unique: false,
    allowNull: true,
  },
  state: {
    type: Sequelize.STRING,
    allowNull: true,
  }, 
  regNo: { 
    type: Sequelize.STRING,
    allowNull: true,
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
    type: Sequelize.STRING, // or Sequelize.TEXT
    allowNull: true,
    get() {
      const value = this.getDataValue('department');
      return value ? JSON.parse(value) : null;
    },
    set(value) {
      this.setDataValue('department', value ? JSON.stringify(value) : null);
    },
  },
  eligibility: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  position: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  type: {
    type: Sequelize.STRING, // or Sequelize.TEXT
    allowNull: true,
    get() {
      const value = this.getDataValue('type');
      return value ? JSON.parse(value) : null;
    },
    set(value) {
      this.setDataValue('type', value ? JSON.stringify(value) : null);
    },
  },
  category: {
    type:Sequelize.STRING,
    allowNull: false
  },
  uploader: {
    type: Sequelize.BIGINT(10),
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
