import express from "express";
import { getEmbeddings } from "../controllers/embeddingController.js";

const router = express.Router();

// Debug middleware for embedding routes
router.use((req, res, next) => {
  console.log("Embedding route accessed:", {
    method: req.method,
    path: req.path,
    fullUrl: req.originalUrl,
    body: req.body,
  });
  next();
});

// Route for generating embeddings
router.post("/getEmbedding", getEmbeddings);

export default router;
