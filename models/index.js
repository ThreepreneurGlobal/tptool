import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();


const Connect = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: true,
});


try {
    // console.log('CONNECTED!');
} catch (error) {
    console.error('DISCONNECT!', error);
};


// CREATE OR EDIT DB STRUCTURE AND IF EXISTS DELETE OLD DATA.
// Connect.sync({ alter: true, force: true })
//     .then(() => {
//         console.log("ALL MODELS SYNCHRONIZED SUCCESSFULLY...");
//     })
//     .catch((err) => {
//         console.error("ERROR FOR SYNCHRONIZING....", err);
//     });


export default Connect;