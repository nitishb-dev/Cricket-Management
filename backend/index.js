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

// --- Middlewares ---
app.use(cors());
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
