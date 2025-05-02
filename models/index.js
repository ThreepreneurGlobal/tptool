import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();


const Connect = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: true,
});


try {
    Connect.authenticate();
    // console.log("CONNECTED...");
} catch (error) {
    console.error("DISCONNECTED", error.message);
};

//UPDATE DB STRUCTURE AND DELETE OLD STRUCTURE WITH OLD DATA.
// Connect.sync({ alter: true, force: true })
//     .then(() => {
//         console.log("ALL MODELS SYNCHRONIZED SUCCESSFULLY...");
//     })
//     .catch((err) => {
//         console.error("ERROR FOR SYNCHRONIZING....");
//     });

export default Connect;