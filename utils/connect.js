import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();


const Connect = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
});


try {
    Connect.authenticate();
    // console.log("CONNECTED...");
} catch (error) {
    console.error("DISCONNECTED", error.message);
};

//Update DB Structure and Delete Old Structure with Old Data.
// Connect.sync({ alter: true, force: true })
//     .then(() => {
//         console.log("ALL MODELS SYNCHRONIZED SUCCESSFULLY...");
//     })
//     .catch((err) => {
//         console.error("ERROR FOR SYNCHRONIZING....");
//     })

export default Connect;