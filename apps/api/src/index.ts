import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";
import { lastActiveMiddleware } from "./middlewares/lastActive";
import profileRouter from "./routes/profile";

app.all("/api/auth/*", toNodeHandler(auth));
app.use(lastActiveMiddleware);
app.use("/api/profile", profileRouter);

// Custom Request Extension
declare global {
  namespace Express {
    interface Request {
      user?: any; // Replace with actual user type later
    }
  }
}

// Routes
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
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
