import { DataTypes, Sequelize } from 'sequelize';
import College from "../../models/college.js";
import Credential from "../../models/credential.js";
import SecondFeedback from "../../models/second/feedback.js";
import { decryptData } from '../../utils/hashing.js';

export const interCollege = async () => {
    let feedback_count = 0;

    const credentials = await Credential.findAll({
        where: { status: true, },
        include: [{ model: College, foreignKey: 'college_id', as: 'college', attributes: ['id', 'name', 'city'] }]
    });

    const interCollegePromises = credentials?.map(async (credential) => {
        const db_name = decryptData(credential?.db_name);
        const db_user = decryptData(credential?.db_user);
        const db_pass = decryptData(credential?.db_pass);
        const db_host = decryptData(credential?.db_host);
        
        const collegeDb = new Sequelize(db_name, db_user, db_pass, {
            host: db_host,
            dialect: 'mysql',
        });

        try {
            await collegeDb.authenticate();
            const CollegeFeedback = SecondFeedback(collegeDb, DataTypes);

            const college_feedback = await CollegeFeedback.count({ where: { status: true } });
            feedback_count += college_feedback || 0;
        } catch (error) {
            console.error(error?.message);
            return;
        }
    });
    await Promise.all(interCollegePromises);

    return { feedback_count };
};