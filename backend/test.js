import { pipeline } from '@xenova/transformers';

const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

const output = await extractor('Hello world');
console.log(output.data); // Embedding vector
