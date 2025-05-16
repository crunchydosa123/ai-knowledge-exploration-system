import multer from 'multer';
import { PdfReader } from 'pdfreader';
import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';

dotenv.config();

// Configure multer for PDF uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        console.log('Received file:', file.originalname, 'Type:', file.mimetype);
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // Limit file size to 10MB
    }
}).single('pdf');

// Initialize Pinecone
const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});
const index = pc.index('edai-v2');

function extractTextFromPDF(buffer) {
    return new Promise((resolve, reject) => {
        const reader = new PdfReader();
        let textContent = '';
        let currentPage = 1;
        let pageTexts = {};

        reader.parseBuffer(buffer, (err, item) => {
            if (err) {
                reject(err);
            } else if (!item) {
                // End of file, combine all pages in order
                const orderedText = Object.keys(pageTexts)
                    .sort((a, b) => parseInt(a) - parseInt(b))
                    .map(pageNum => pageTexts[pageNum])
                    .join('\n\n');
                resolve({
                    text: orderedText,
                    numPages: Object.keys(pageTexts).length
                });
            } else if (item.text) {
                // Accumulate text by page
                if (!pageTexts[item.page || currentPage]) {
                    pageTexts[item.page || currentPage] = '';
                }
                pageTexts[item.page || currentPage] += item.text + ' ';
            } else if (item.page) {
                currentPage = item.page;
            }
        });
    });
}

export const uploadAndProcessPDF = async (req, res) => {
    console.log('PDF upload request received');
    
    try {
        upload(req, res, async (err) => {
            if (err) {
                console.error('Multer error:', err);
                return res.status(400).json({
                    error: err.message || 'Error uploading file'
                });
            }

            if (!req.file) {
                console.error('No file in request');
                return res.status(400).json({
                    error: 'No PDF file provided'
                });
            }

            console.log('File received:', req.file.originalname, 'Size:', req.file.size, 'bytes');

            try {
                console.log('Starting PDF text extraction...');
                const { text, numPages } = await extractTextFromPDF(req.file.buffer);
                console.log('PDF text extracted successfully. Pages:', numPages);

                const chunks = splitTextIntoChunks(text);
                console.log('Text split into', chunks.length, 'chunks');

                return res.status(200).json({
                    message: 'PDF processed successfully',
                    filename: req.file.originalname,
                    text: text,
                    numPages: numPages,
                    chunks: chunks
                });

            } catch (error) {
                console.error('Error processing PDF:', error);
                return res.status(500).json({
                    error: 'Error processing PDF file',
                    details: error.message
                });
            }
        });
    } catch (error) {
        console.error('Error in upload handler:', error);
        return res.status(500).json({
            error: 'Server error',
            details: error.message
        });
    }
};

// Helper function to split text into chunks
function splitTextIntoChunks(text, chunkSize = 1000) {
    const chunks = [];
    const words = text.split(' ');
    let currentChunk = '';

    for (const word of words) {
        if ((currentChunk + ' ' + word).length <= chunkSize) {
            currentChunk += (currentChunk ? ' ' : '') + word;
        } else {
            if (currentChunk) chunks.push(currentChunk);
            currentChunk = word;
        }
    }
    
    if (currentChunk) chunks.push(currentChunk);
    return chunks;
} 