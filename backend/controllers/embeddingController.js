import { pipeline } from '@xenova/transformers';

const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

export const getEmbeddings = async (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }

    try{
        const output = await extractor(text);
        const embeddingObject = output.data;
        const embedding = Object.values(embeddingObject);
        const size = embedding.length;

return res.status(200).json({ embedding, size: size });
    }catch(error){
        console.error('Error generating embedding:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
    