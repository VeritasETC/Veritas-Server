import dotenv from "dotenv";
dotenv.config();

export const config = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DB_URI: process.env.DB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRE: process.env.JWT_EXPIRE,

    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USERNAME: process.env.SMTP_USERNAME,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    SMTP_FROM_ADDRESS: process.env.SMTP_FROM_ADDRESS,
};
