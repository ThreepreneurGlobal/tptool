const Sequelize = require("sequelize");
const sequelize = require("../Util/database");

const Recruiter = sequelize.define("recruiter", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  companyName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  position: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  eligibility: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  details: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  uploader: {
    type: Sequelize.BIGINT(10),
    allowNull: false,
  },
});

module.exports = Recruiter;
