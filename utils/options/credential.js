import Credential from "../../models/credential.js";


export const myOrigins = async () => {
    const credentials = await Credential.findAll({ where: { status: true }, attributes: ['id', 'front_host_url'] });
    return credentials;
};

