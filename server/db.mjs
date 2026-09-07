import dotenv from 'dotenv';
dotenv.config();

import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('MONGODB_URI is missing from .env');
}

const client = new MongoClient(uri);

let db;

export async function connectDB() {
  await client.connect();

  db = client.db(
    process.env.MONGODB_DB || 'smart_education'
  );

  console.log('MongoDB connected successfully');
}

export function getDB() {
  if (!db) {
    throw new Error('MongoDB is not connected');
  }

  return db;
}