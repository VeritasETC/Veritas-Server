import mongoose from "mongoose";
import { config } from "./index.js";

export const connectDB = async () => {
    try {
        const dbRef = await mongoose.connect(config.DB_URI, {
            dbName: "hexosafeDB",
        });
        console.log(`DB Connected to ${dbRef.connection.db.namespace} ...`);
    } catch (error) {
        console.log("DB Connection Failed shutting down...");
        process.exit(1);
    }
};
