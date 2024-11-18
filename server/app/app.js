import express from 'express';
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import cors from 'cors'
import { connectDb } from '../db/db.js';

const app = express();

dotenv.config();

app.use(cors({
    origin:'http://localhost:5173',
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());
connectDb();

export default app;

