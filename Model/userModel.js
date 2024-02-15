const Sequelize = require("sequelize");

const sequelize = require("../Util/database");

const User = sequelize.define("user", {
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
    allowNull: false,
  },
  password: {
    type: Sequelize.STRING,
    unique: false,
    allowNull: true,
  },
  percentage: {
    type: Sequelize.FLOAT,
    allowNull: true,
  },
  skills: {
    type: Sequelize.STRING, // or Sequelize.TEXT
    allowNull: true,
    get() {
      const value = this.getDataValue('skills');
      return value ? JSON.parse(value) : null;
    },
    set(value) {
      this.setDataValue('skills', value ? JSON.stringify(value) : null);
    },
  },
  role: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  enrollmentId: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  image: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  mobile: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  branch: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  year: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  status: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  }, 
}, 
);

module.exports = User;
