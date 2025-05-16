import express from 'express';
import { uploadAndProcessPDF } from '../controllers/pdfController.js';

const router = express.Router();

router.post('/upload', uploadAndProcessPDF);

export default router; 