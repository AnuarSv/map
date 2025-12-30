import express from "express";
import cors from 'cors';
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import waterObjectsRoutes from "./routes/waterObjects.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));

app.use(express.json({ limit: '10mb' })); // Increased limit for GeoJSON
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/water-objects", waterObjectsRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})