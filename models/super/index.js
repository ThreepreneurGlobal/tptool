import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();


const SuperConnect = new Sequelize(process.env.SDB_NAME, process.env.SDB_USER, process.env.SDB_PASS, {
    host: process.env.SDB_HOST,
    dialect: "mysql",
    logging: true,
});


try {
    SuperConnect.authenticate();
    // console.log('CONNECTED!');
} catch (error) {
    console.error('DISCONNECTED!', error?.message);
}


export default SuperConnect;
