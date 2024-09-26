var nodemailer = require('nodemailer');
import config from "../config";
const transporter = nodemailer.createTransport({
    port: 587,               // true for 465, false for other ports
    host: config.email.hostname,
    tls: { rejectUnauthorized: false },
    debug: true ,
       auth: {
            type: 'LOGIN',
            user: config.email.email_user,
            pass: config.email.email_pass,
         }
    });
export default transporter;

