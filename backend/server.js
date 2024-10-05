import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

app.use(express.json());
app.use(cors());  // Enable CORS for all routes

// Endpoint to handle prompt and stream response from Gemini AI
app.post('/api/generate', async (req, res) => {
    const { prompt } = req.body;

    try {
        // Get the model
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Generate content stream from the prompt
        const result = await model.generateContentStream(prompt);

        // Prepare to stream the response
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Transfer-Encoding', 'chunked');

        // Stream the response as chunks
        for await (const chunk of result.stream) {
            res.write(chunk.text());
        }

        // End the stream
        res.end();

    } catch (error) {
        console.error('Error generating response:', error);
        res.status(500).json({ error: 'Error generating response' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
