import crypto from 'crypto';
import dns from 'dns/promises';


const algorithm = 'aes-256-cbc';
const key = crypto.scryptSync(process.env.ENCRYPTION_SECRET, 'salt', 32);   // Replace with secure secret
const iv = Buffer.alloc(16, 0);                     // 16-byte IV (you can randomize per record if needed)


export const encryptData = (input_value) => {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(input_value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
};


export const decryptData = (input_value) => {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(input_value, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};


// export const getIPAddress = async (web_url = '') => {
//     let ip_address = '';
//     dns.lookup(web_url, { family: 4 }, (err, address, family) => {
//         if (err) {
//             console.error(err.message);
//         };
//         ip_address = address;
//     });
//     return ip_address;
// };

export const getIPAddress = async (domain = '') => {
    try {
        // REMOVE HTTPS/HTTP
        const url = new URL(domain);

        // ADD URL IN THIS METHOD AND RETURN
        const { address } = await dns.lookup(url.hostname, { family: 4 });
        return address;
    } catch (error) {
        console.error(error.message);
        return null;
    }
};