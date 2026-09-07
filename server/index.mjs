import authRoutes from './routes/auth.mjs';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, getDB } from './db.mjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Smart Education Platform Backend',
    status: 'running'
  });
});

app.get('/api/health', async (req, res) => {
  try {
    const db = getDB();

    await db.command({ ping: 1 });

    res.json({
      status: 'ok',
      database: 'MongoDB connected'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  });