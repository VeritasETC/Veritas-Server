import express from "express";
import cors from "cors";
import { createServer } from "http";
import morgan from "morgan";
const app = express();
const server = createServer(app);

import { globalErrorHandler } from "./controllers/errorController.js";

//app middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined"));

// routes import
import orginazationRoute from "./routes/orginazationRoute.js";
import employeeRoute from "./routes/employeeRoute.js";
import authRoute from "./routes/authRoute.js";
import transactionRoute from "./routes/transactionRoute.js";

// routes middleware
app.use("/api/v1", orginazationRoute);
app.use("/api/v1", employeeRoute);
app.use("/api/v1", authRoute);
app.use("/api/v1", transactionRoute);

app.use(globalErrorHandler);

export default server;
