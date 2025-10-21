import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import playerRoutes from "./routes/players.js";
import matchRoutes from "./routes/matches.js";
import authRoutes from "./routes/auth.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? (process.env.FRONTEND_URL || "")
        .split(",")
        .map((origin) => origin.trim().replace(/\/$/, "")) // Remove trailing slashes
    : ["*"];

const corsOptions = {
  origin: (origin, callback) => {
    // For development, allow all origins
    if (allowedOrigins.includes("*")) {
      return callback(null, true);
    }
    // For production, check against the whitelist
    if (origin && allowedOrigins.includes(origin.replace(/\/$/, ""))) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use(cors(corsOptions));

app.use(express.json());

// ----------------- ROUTES -----------------

app.get("/api/health", (req, res) => {
  res.json({ status: "working!", timestamp: new Date() });
});

// mount auth routes so /api/player/login works
app.use("/api", authRoutes);

app.use("/api/players", playerRoutes);
app.use("/api/matches", matchRoutes);

// --- 404 Not Found Handler ---
app.use((req, res, next) => {
  res.status(404).json({ error: "Not Found" });
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error(`❌ Global Error: ${err.message}`);
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({ error: message });
});

// --- Server Startup ---
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log("Database schema should be managed via the Supabase dashboard.");
});
