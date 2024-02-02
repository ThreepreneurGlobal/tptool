const Sequelize = require('sequelize');

const sequelize = new Sequelize('collage-placement', 'root', '@Ritesh123', {
    dialect: 'mysql',
    host: 'localhost'
}); 

module.exports = sequelize;  