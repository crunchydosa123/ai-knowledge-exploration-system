import dotenv from 'dotenv';
dotenv.config();

import { Pinecone } from '@pinecone-database/pinecone';

// For debugging - remove in production
console.log('PINECONE_API_KEY:', process.env.PINECONE_API_KEY);

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});
const index = pc.index('edai-v2');

export const uploadToPinecone = async (req, res) => {
    const { vector, namespace } = req.body;

    if (!vector || !namespace || !vector.id || !vector.values) {
        return res.status(400).json({ error: 'Vector with id and values, and namespace are required' });
    }

    try {
        const upload = await index
            .namespace(namespace)
            .upsert({
                vectors: [
                    {
                        id: vector.id,
                        values: vector.values,
                        metadata: vector.metadata || {} // optional
                    }
                ]
            });

        return res.status(200).json({ message: 'Vector uploaded successfully', upload });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};



export const queryPinecone = async (req, res) => {
    const { vector, namespace } = req.body;

    if (!vector || !namespace || !vector.values) {
        return res.status(400).json({ error: 'Vector with values and namespace are required' });
    }

    try {
        const response = await index.namespace(namespace).query({
            topK: 2,
            vector: vector.values, // use only the values
            includeValues: true,
            includeMetadata: true,
        });

        return res.status(200).json({ message: 'Query successful', response });
    } catch (error) {
        console.error('Error querying Pinecone:', error);
        return res.status(500).json({ error: 'Query failed', details: error.message });
    }
};
