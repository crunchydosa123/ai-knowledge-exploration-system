import express from 'express';
import { getEmbeddings } from '../controllers/embeddingController.js';

const router = express.Router();

router.get('/getEmbedding', getEmbeddings);


export default router;
