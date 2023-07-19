import { config } from "./config/index.js";
import server from "./app.js";
import { connectDB } from "./config/db.js";

const startApp = async () => {
    await connectDB();
    server.listen(config.PORT, () => {
        console.log(`Server is running at port ${config.PORT}`);
    });

    process.on("uncaughtException", (err) => {
        console.log("UNCAUGHT EXCEPTION! 🔥 Shutting down...");
        console.log(err.name, err.message);
        process.exit(1);
    });

    process.on("unhandledRejection", (err) => {
        console.log("UNHANDLED REJECTION! 💥 Shutting down...");
        console.log(err.name, err.message);
        server.close(() => {
            process.exit(1);
        });
    });

    process.on("SIGTERM", () => {
        console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
        server.close(() => {
            console.log("💥 Process terminated!");
        });
    });
};

startApp();
