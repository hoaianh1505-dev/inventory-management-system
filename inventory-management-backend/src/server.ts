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

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());
app.use(cors(corsOptions));
app.use(globalRateLimiter);

// Body Parser Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Application Routes & Error Handling
app.use(routes);
app.use(errorHandler);

// Database Connection & Server Initialization
const startServer = async () => {
  try {
    await AppDataSource.initialize();
    await seedInitialAdmin();
    app.listen(PORT, () => {
      console.log(`Server running on address http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server start error:", error);
    process.exit(1);
  }
};

startServer();
