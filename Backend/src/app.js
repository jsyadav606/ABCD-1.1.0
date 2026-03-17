import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import roleRoutes from "./routes/role.routes.js";
import branchRoutes from "./routes/branch.routes.js";
import organizationRoutes from "./routes/organization.routes.js";
import assetRoutes from "./routes/asset.routes.js";
import purchaseRoutes from "./routes/purchase.routes.js";
import warrantyRoutes from "./routes/warranty.routes.js";
import { apiError } from "./utils/apiError.js";
import lookupRoutes from "./routes/lookup.routes.js";
import vendorRoutes from "./routes/vendor.routes.js";
import { setSecurityHeaders, issueCsrfToken, csrfGuard } from "./middlewares/security.middleware.js";

// Load environment variables
dotenv.config();

const app = express();


/* ===============================
   Global Middlewares
================================ */
const rawCors = process.env.CORS_ORIGIN || 'http://localhost:5173';
const allowedOrigins = rawCors === '*' ? ['*'] : rawCors.split(',').map(o => o.trim());
const allowAll = allowedOrigins.includes('*');
const isDev = process.env.NODE_ENV !== 'production';
app.use(cors({
  origin: (origin, callback) => {
    if (allowAll || !origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (isDev && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: !allowAll, // Do not allow credentials when wildcard
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
  maxAge: 3600
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(setSecurityHeaders);
app.use(issueCsrfToken);
app.use(csrfGuard);

/* ===============================
   Health Check
================================ */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend server is running 🚀",
  });
});

/* ===============================
   Routes
================================ */
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/roles", roleRoutes);
app.use("/api/v1/branches", branchRoutes);
app.use("/api/v1/organizations", organizationRoutes);
app.use("/api/v1/assets", assetRoutes);
app.use("/api/v1/purchases", purchaseRoutes);
app.use("/api/v1/warranties", warrantyRoutes);
app.use("/api/v1/lookups", lookupRoutes);
app.use("/api/v1/vendors", vendorRoutes);

/* ===============================
   Global Error Handler
================================ */
app.use((err, req, res, next) => {
  // If error is an instance of apiError, use its properties
  if (err instanceof apiError) {
    return res.status(err.statusCode).json({
      statusCode: err.statusCode,
      success: err.success,
      message: err.message,
      errors: err.errors || [],
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }

  // For generic Error objects or other errors
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: [],
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

/* ===============================
   Export App
================================ */
export default app;
