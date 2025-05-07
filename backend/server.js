import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import embeddingRoutes from './routes/embeddingRoutes.js'
import pineconeRoutes from './routes/pineconeRoutes.js'

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/auth', authRoutes);
app.use('/embeddings', embeddingRoutes)
app.use('/pinecone', pineconeRoutes)
//app.use('/embedding', embeddingRoutes);
//app.use('/storage', storageRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
