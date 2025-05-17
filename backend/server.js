import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import authRoutes from "./routes/authRoutes.js";
import embeddingRoutes from "./routes/embeddingRoutes.js";
import pineconeRoutes from "./routes/pineconeRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import pdfRoutes from "./routes/pdfRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

// For debugging - remove in production
console.log("Environment check on server start:");
console.log(
  "PINECONE_API_KEY:",
  process.env.PINECONE_API_KEY ? "exists" : "missing"
);

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Request logging middleware
app.use((req, res, next) => {
  console.log("Incoming request:", {
    method: req.method,
    url: req.url,
    originalUrl: req.originalUrl,
    path: req.path,
    body: req.body,
  });
  next();
});

// Routes
app.use("/auth", authRoutes);
app.use("/embeddings", embeddingRoutes);
app.use("/pinecone", pineconeRoutes);
app.use("/projects", projectRoutes);
app.use("/chat", chatRoutes);
app.use("/pdf", pdfRoutes);
app.use("/upload", uploadRoutes);
//app.use('/embedding', embeddingRoutes);
//app.use('/storage', storageRoutes);

// 404 handler
app.use((req, res, next) => {
  console.log("404 Not Found:", req.method, req.url);
  res.status(404).json({ error: "Not Found", path: req.url });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
