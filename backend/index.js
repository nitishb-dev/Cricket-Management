import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initializeDatabase } from "./db-setup.js";
import authRoutes from "./routes/auth.js";
import playerRoutes from "./routes/players.js";
import matchRoutes from "./routes/matches.js";
import playerAuthRoutes from "./routes/player-auth.js";
import superAdminAuthRoutes from "./routes/super-admin-auth.js";
import superAdminRoutes from "./routes/super-admin.js";
import { hideSuperAdminRoutes, superAdminSecurityCheck } from "./middleware/superAdminSecurity.js";

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
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    // For production, check against the whitelist
    if (origin && allowedOrigins.includes(origin.replace(/\/$/, ""))) {
      callback(null, true);
    } else {
      // Log the rejected origin for debugging
      console.log(`🚫 CORS rejected origin: ${origin}`);
      console.log(`✅ Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Super-Admin-Key']
};

app.use(cors(corsOptions));

app.use(express.json());

// ----------------- ROUTES -----------------

app.get("/api/health", (req, res) => {
  res.json({ status: "working!", timestamp: new Date() });
});

// Authentication routes (public)
app.use("/api/auth", authRoutes);
app.use("/api/player", playerAuthRoutes);

// Super Admin routes (with security middleware)
app.use("/api/super-admin", hideSuperAdminRoutes);

// Simple test endpoint for super admin security
app.get("/api/super-admin/test", superAdminSecurityCheck, (req, res) => {
  res.json({ message: "Super admin security is working!", timestamp: new Date() });
});

// Access key verification endpoint (no auth required, just key check)
app.get("/api/super-admin/verify-access", superAdminSecurityCheck, (req, res) => {
  res.json({ message: "Access key verified successfully", timestamp: new Date() });
});

app.use("/api/super-admin/auth", superAdminAuthRoutes);
app.use("/api/super-admin", superAdminRoutes);

// Protected routes (require authentication)
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
const startServer = async () => {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Multi-tenant Cricket Management Server running at http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth/*`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
