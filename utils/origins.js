import College from "../models/college.js";
import Credential from "../models/credential.js";


const getOrigins = async () => {
    try {
        let origins = [];
        const colleges = await College.findAll({
            where: { status: true }, attributes: ['id', 'name', 'reg_no'],
            include: [{ model: Credential, as: 'credential', attributes: ['id', 'back_host_url', 'front_host_url'] }]
        });

        const host_urls = colleges?.map(item => {
            return { front_host_url: item?.credential?.front_host_url, back_host_url: item?.credential?.back_host_url };
        });

        host_urls?.map(item => {
            if (item.back_host_url) {
                origins.push(item.back_host_url);
            };
            if (item.front_host_url) {
                origins.push(item.front_host_url);
            };
        });

        console.log(origins);
        return origins;
    } catch (error) {
        console.error(error.message);
        return null;
    }
};


export default getOrigins;