import http from "http";
import fs from "fs";
import path from "path";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { AppDataSource } from "./config/database";
import { corsOptions, globalRateLimiter } from "./config/security.config";
import routes from "./routes";
import { errorHandler } from "./middlewares/error.middleware";
import { seedInitialAdmin } from "./services/auth.service";
import { initSocket } from "./config/socket.config";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);

// Initialize Socket.io Realtime Notifications Server
initSocket(httpServer);

const swaggerPath = fs.existsSync(path.join(__dirname, "docs/swagger.yaml"))
  ? path.join(__dirname, "docs/swagger.yaml")
  : path.join(process.cwd(), "src/docs/swagger.yaml");

const swaggerDocument = YAML.load(swaggerPath);

// Security Middlewares
app.use(helmet());
app.use(cors(corsOptions));
app.use(globalRateLimiter);

// Body Parser Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Swagger API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Application Routes & Error Handling
app.use(routes);
app.use(errorHandler);

// Database Connection & Server Initialization
const startServer = async () => {
  try {
    await AppDataSource.initialize();
    await seedInitialAdmin();
    httpServer.listen(PORT, () => {
      console.log(`Server running with Realtime WebSocket support on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server start error:", error);
    process.exit(1);
  }
};

startServer();
