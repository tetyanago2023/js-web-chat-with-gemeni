import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const client = new GoogleGenerativeAI(process.env.API_KEY);

app.use(express.json());
app.use(cors());  // Enable CORS for all routes

app.post('/api/generate', async (req, res) => {
    const { prompt } = req.body;
    console.log('Received prompt:', prompt);

    try {
        const response = await client.generateText({
            model: 'gemini-1.5-flash',  // Specify the model you want to use
            prompt: prompt
        });

        if (response.candidates.length > 0) {
            res.json({ response: response.candidates[0].output });
        } else {
            res.status(400).json({ error: 'No response from AI' });
        }
    } catch (error) {
        console.error('Error generating response:', error);  // Log the error details
        res.status(500).json({ error: 'Error generating response' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
