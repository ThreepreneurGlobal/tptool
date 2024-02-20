const Sequelize = require('sequelize');

const sequelize = new Sequelize({
    database: "college_project", 
    username: "root", 
    password: "@Ritesh123",
    host: "localhost",
    dialect: 'mysql',
    dialectModule: require("mysql2"),
    benchmark: true
}); 

// const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
//     dialect: 'mysql',
//     host: process.env.DB_HOST
// });

module.exports = sequelize;  

