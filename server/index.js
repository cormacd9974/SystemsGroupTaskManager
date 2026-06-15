import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { dbConnection } from "./utils/connectDB.js";
import { routeNotFound, errorHandler } from "./middleware/errorMiddleware.js";
import routes from "./routes/index.js";
import { fileURLToPath } from "url";
import path from "path";

dotenv.config();

// Connect to MongoDB
dbConnection();

const PORT = process.env.PORT || 8800;

const app = express();

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
app.use("/api", routes);

// Handle unknown routes and errors
if (process.env.NODE_ENV !== "production") {
    const distpath = path.join(__dirname, "..'/client/dist");
    app.use(express.static(distPath));
    app.use((req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
    });
} else {
    app.use(routeNotFound);
}

// Start the server
app.listen(PORT, () => console.log(`Server listenning on port ${PORT}`));
