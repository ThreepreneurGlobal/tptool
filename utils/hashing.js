import crypto from 'crypto';


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