import nodemailer from "nodemailer";
import { config } from "../config/index.js";

class Email {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: config.SMTP_HOST,
            port: config.SMTP_PORT,
            secure: false, // true for 465, false for other ports
            auth: {
                user: config.SMTP_USERNAME, // generated ethereal user
                pass: config.SMTP_PASSWORD, // generated ethereal password
            },
        });
    }

    sendMail = async (from, to, link, subject, messageBody) => {
        const options = {
            from: `"Vadavision" <${config.SMTP_FROM_ADDRESS}>`, // sender address
            to: to, // list of receivers
            subject: "Employee password verification", // Subject line
            html: `<h2>You have join {Orginazation name goes here} Please set your password by clicking here <a href=${link}>Click Here</a> </h2>`, // html body
        };
        await this.transporter.sendMail(options);
    };
}

const email = new Email();
export default email.sendMail;
