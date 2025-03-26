import nodemailer from 'nodemailer';

const MAIL_USER = process.env.MAIL_USER;
const MAIL_PASS = process.env.MAIL_PASS;


const mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    secure: true,
    port: 465,
    auth: {
        user: MAIL_USER,
        pass: MAIL_PASS,
    },
});

// FOR GMAIL SMPT
// service: 'gmail',
// secure: true,
// port: 465,
// auth: {},

// FOR ETHERIAL SMPT
// host: 'smtp.ethereal.email',
// port: 587,
// secure: false,
// auth: {},


export default mailTransporter;
