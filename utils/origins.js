import College from "../models/college.js";
import Credential from "../models/credential.js";


const getOrigins = async () => {
    try {
        const colleges = await College.findAll({
            where: { status: true }, attributes: ['id', 'name', 'reg_no'],
            include: [{ model: Credential, as: 'credential', attributes: ['id', 'back_host_url', 'front_host_url'] }]
        });

        const origins = colleges?.map(item => {
            item?.credential?.front_host_url
        });
        console.log(origins);
        return origins;
    } catch (error) {
        console.error(error.message);
        return null;
    }
};


export default getOrigins;