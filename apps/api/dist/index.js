import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
const app = express();
const PORT = process.env.PORT || 3001;
// Allowed origins for CORS
const allowedOrigins = [
    'http://localhost:3000',
    process.env.FRONTEND_URL,
].filter(Boolean);
// Middleware
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (server-to-server, health checks)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error(`CORS not allowed for origin: ${origin}`));
    },
    credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import { lastActiveMiddleware } from "./middlewares/lastActive.js";
import profileRouter from "./routes/profile.js";
import adminRouter from "./routes/admin.js";
import hackathonRouter from "./routes/hackathons.js";
import swipeRouter from "./routes/swipes.js";
import teamRouter from "./routes/teams.js";
import notificationsRouter from "./routes/notifications.js";
import chatRouter from "./routes/chat.js";
import exploreRouter from "./routes/explore.js";
app.all("/api/auth/*", toNodeHandler(auth));
app.use(lastActiveMiddleware);
app.use("/api/profile", profileRouter);
app.use("/api/admin", adminRouter);
app.use("/api", swipeRouter);
app.use("/api/hackathons", hackathonRouter);
app.use("/api/teams", teamRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/chat", chatRouter);
app.use("/api/explore", exploreRouter);
// Routes
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});
// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: {
            message: err.message || 'Internal Server Error',
        },
    });
});
app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
});
