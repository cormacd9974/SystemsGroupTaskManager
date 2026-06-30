import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import { dbConnection } from "./utils/connectDB.js";
import { routeNotFound, errorHandler } from "./middleware/errorMiddleware.js";
import routes from "./routes/index.js";
import { fileURLToPath } from "url";
import path from "path";
import { startScheduler } from "./utils/scheduler.js";
import { validateEnv } from "./utils/validateEnv.js";

dotenv.config();
validateEnv();
// Connect to MongoDB
dbConnection();
startScheduler();

const PORT = process.env.PORT || 8800;

const app = express();
app.use(helmet());

// Enable CORS for local frontend development origins
if (process.env.NODE_ENV !== "production") {
  app.use(
    cors({
      origin: ["http://localhost:3000", "http://localhost:5173"],
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    }),
  );
}

// Parse JSON request bodies
app.use(express.json());

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Parse cookies from incoming requests
app.use(cookieParser());

// Log HTTP requests in development
app.use(morgan("dev"));

// Mount API routes under /api
app.get("/healthz", (req, res) => res.json({ status: "ok"}));
app.use("/api", routes);

// Handle unknown routes and errors
if (process.env.NODE_ENV === "production") {
    const distPath = path.join(__dirname, "../client/dist");
    app.use(express.static(distPath));
    app.use((req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
    });
} else {
    app.use(routeNotFound);
}

app.use(errorHandler);

// Start the server
const server = app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
})
