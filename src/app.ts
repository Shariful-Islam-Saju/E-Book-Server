// app.ts
import express, { Express, Request, Response, NextFunction } from "express";
import cors, { CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import router from "@app/routes";
import notFound from "@app/middlewares/notFound";
import globalErrorHandler from "@app/middlewares/globalErrorHandler";
import logger from "@app/shared/logger"; // <-- Import your pino logger

const app: Express = express();

// Middleware: cookie parser
app.use(cookieParser());

// CORS setup
const allowedOrigins: string[] = [
  "http://localhost:3000",
  "http://localhost:3001",
];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Allow requests with no origin (like mobile apps)

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`Blocked CORS request from: ${origin}`); // Log blocked origins
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// // Request logger middleware
// app.use((req: Request, res: Response, next: NextFunction) => {
//   logger.info({ method: req.method, url: req.url }, "Incoming request");
//   next();
// });

// Health check route
app.get("/", (req: Request, res: Response) => {
  logger.info("Health check route called");
  res.send({
    message: "EBook App is running...",
  });
});

// API routes
app.use("/api/v1", router);

// Global error handler
app.use(globalErrorHandler);

// 404 Not Found handler
app.use(notFound);

export default app;
