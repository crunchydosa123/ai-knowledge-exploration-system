import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';

dotenv.config();

const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});
const index = pc.index('edai-v2');

async function fetchRelevantContext(query, namespace) {
    try {
        const response = await index.namespace(namespace).query({
            topK: 3,
            vector: query,
            includeValues: true,
            includeMetadata: true,
        });
        
        if (!response.matches || response.matches.length === 0) {
            return "No relevant context found in the documents.";
        }
        
        return response.matches
            .filter(match => match.metadata && match.metadata.text)
            .map(match => match.metadata.text)
            .join('\n\n');
    } catch (error) {
        console.error('Error fetching context:', error);
        throw error;
    }
}

export const processChat = async (req, res) => {
    const { message, namespace, embeddings } = req.body;

    if (!message || !namespace || !embeddings) {
        return res.status(400).json({ error: 'Message, namespace, and embeddings are required' });
    }

    try {
        // 1. Get relevant context from Pinecone
        const context = await fetchRelevantContext(embeddings, namespace);

        // 2. Construct the prompt with context
        const prompt = `Context information is below.
---------------------
${context}
---------------------
Given the context information, please respond to the following message:
${message}

Please ensure your response is based on the context provided. If the context doesn't contain relevant information, please indicate that.`;

        // 3. Call Groq API
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: "meta-llama/llama-4-scout-17b-16e-instruct",
                messages: [
                    { 
                        role: "system", 
                        content: "You are a helpful AI assistant that provides accurate information based on the given context. If the context doesn't contain relevant information to answer the question, clearly state that." 
                    },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            throw new Error(`Groq API error: ${response.statusText}`);
        }

        const llmResponse = await response.json();
        
        if (llmResponse.error) {
            throw new Error(llmResponse.error.message);
        }

        return res.status(200).json({
            message: llmResponse.choices[0].message.content,
            context: context
        });

    } catch (error) {
        console.error('Error in chat processing:', error);
        return res.status(500).json({ 
            error: 'Failed to process chat message',
            details: error.message 
        });
    }
}; 