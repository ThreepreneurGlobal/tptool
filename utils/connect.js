const { Sequelize } = require("sequelize");

const Connect = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: "mysql",
    // logging: (msg)=>{
    //     console.log(msg);
    // }
    logging: false
});

try {
    Connect.authenticate();
    // console.log("Connected...");
} catch (error) {
    console.log("Disconnected", error);
};

//Update DB Structure and Delete Old Structure with Old Data.
// Connect.sync({ alter: true, force: true });

module.exports = Connect;