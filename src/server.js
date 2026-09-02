import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';
import complaintRoutes from './routes/complaint.routes.js';
import aiRoutes from './routes/ai.routes.js';

dotenv.config();

const app = express();

// 1. Dynamic CORS Configuration (Allows Localhost + Vercel + Postman)
app.use(cors({
  origin: true, // Automatically reflects the requesting origin (Vercel, Localhost, etc.)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests for all endpoints
app.options('*', cors());

app.use(express.json());

// Root health check endpoint for Railway
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Civic Complaints Backend API is active.' });
});

// Routes Mount Points
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/ai', aiRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medflow_complaints';

// 2. Start Express server immediately (Railway requires the port open right away)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server actively listening on port ${PORT}`);
});

// 3. Connect to MongoDB asynchronously with a 5-second failure timeout
mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log('Successfully connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err.message));