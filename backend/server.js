require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const doctorRoutes = require("./routes/doctors");
const departmentRoutes = require("./routes/departments");
const appointmentRoutes = require("./routes/appointments");
const statsRoutes = require("./routes/stats");
const adminRoutes = require("./routes/admin");
const patientRoutes = require("./routes/patients");
const prescriptionRoutes = require("./routes/prescriptions");
const labReportRoutes = require("./routes/labreports");
const billingRoutes = require("./routes/billing");
const bedRoutes = require("./routes/beds");
const auditLogRoutes = require("./routes/auditlogs");

const app = express();

// Behind a proxy (Railway/Vercel) — needed for correct req.ip and rate limiting
app.set("trust proxy", 1);

app.use(helmet());

const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(mongoSanitize()); // strips $ and . operators from user input to block NoSQL injection
app.use(hpp()); // guards against HTTP parameter pollution

// Tighter rate limit on auth endpoints to slow down brute-force login attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false, xForwardedForHeader: false },
  message: { error: "Too many attempts. Please try again later." },
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
    validate: { trustProxy: false, xForwardedForHeader: false },

});
app.use("/api", apiLimiter);

app.get("/", (req, res) => {
  res.json({ status: "Hospital Management API is running" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/lab-reports", labReportRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/beds", bedRoutes);
app.use("/api/audit-logs", auditLogRoutes);

// 404 handler
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Centralized error handler — keeps stack traces out of responses
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: "Something went wrong on our end" });
});

// Reuse the MongoDB connection across warm serverless invocations
let isConnected = false;
async function connectDB() {
  if (isConnected || mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
  console.log("Connected to MongoDB");
}
connectDB().catch(err => console.error("MongoDB connection error:", err.message));

// Locally: start a normal server. On Vercel: export the app as a serverless function.
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
