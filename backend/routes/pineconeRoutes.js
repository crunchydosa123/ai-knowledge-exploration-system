import express from 'express';
import { uploadToPinecone, queryPinecone } from '../controllers/pineconeController.js';

const router = express.Router();

router.post('/upload-to-pinecone', uploadToPinecone);
router.get('/query-pinecone', queryPinecone);


export default router;
