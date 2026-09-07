import express from 'express';
import crypto from 'crypto';
import { getDB } from '../db.mjs';

const router = express.Router();

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');

  const hash = crypto
    .scryptSync(password, salt, 64)
    .toString('hex');

  return `${salt}:${hash}`;
}

function verifyPassword(password, storedPassword) {
  const [salt, storedHash] = storedPassword.split(':');

  const hash = crypto
    .scryptSync(password, salt, 64)
    .toString('hex');

  return crypto.timingSafeEqual(
    Buffer.from(hash, 'hex'),
    Buffer.from(storedHash, 'hex')
  );
}

router.post('/register', async (req, res) => {
  try {
    const db = getDB();

    const {
      name,
      email,
      password,
      role,
      schoolProfile,
      collegeProfile
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required'
      });
    }

    const existingUser = await db.collection('users').findOne({
      email: email.toLowerCase()
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'User already exists'
      });
    }

    const userId =
      role === 'college'
        ? `COL-${Date.now()}`
        : `SCH-${Date.now()}`;

    const user = {
      userId,
      name,
      email: email.toLowerCase(),
      password: hashPassword(password),
      role: role || 'school',
      schoolProfile: schoolProfile || null,
      collegeProfile: collegeProfile || null,
      createdAt: new Date()
    };

    await db.collection('users').insertOne(user);

    res.status(201).json({
      message: 'Registration successful',
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolProfile: user.schoolProfile,
        collegeProfile: user.collegeProfile
      }
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Registration failed'
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const db = getDB();

    const { email, password } = req.body;

    const user = await db.collection('users').findOne({
      email: email?.toLowerCase()
    });

    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    res.json({
      message: 'Login successful',
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolProfile: user.schoolProfile,
        collegeProfile: user.collegeProfile
      }
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Login failed'
    });
  }
});

export default router;