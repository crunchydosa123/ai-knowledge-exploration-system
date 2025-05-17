import { pipeline } from "@xenova/transformers";

console.log("Initializing embedding pipeline...");
const extractor = await pipeline(
  "feature-extraction",
  "Xenova/all-MiniLM-L6-v2"
);
console.log("Embedding pipeline initialized successfully");

export const getEmbeddings = async (req, res) => {
  console.log("Received embedding request:", req.body);

  // Check if request body exists
  if (!req.body) {
    console.log("No request body received");
    return res.status(400).json({ error: "Request body is required" });
  }

  const { text } = req.body;
  if (!text) {
    console.log("No text provided in request");
    return res.status(400).json({ error: "Text is required" });
  }

  try {
    console.log(
      "Generating embeddings for text:",
      text.substring(0, 100) + "..."
    );
    const output = await extractor(text);
    console.log("Embeddings generated successfully");
    const embeddingObject = output.data;
    const embedding = Object.values(embeddingObject);
    const size = embedding.length;
    console.log(`Generated embedding of size: ${size}`);

    return res.status(200).json({ embedding, size: size });
  } catch (error) {
    console.error("Error generating embedding:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};
