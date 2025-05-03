import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
app.use(cors());
app.use(express.json());

// Configurações otimizadas para Render
const PORT = process.env.PORT || 10000;
const HF_TOKEN = process.env.HF_TOKEN;
const MODEL = 'facebook/blenderbot-400M-distill'; // Modelo mais leve

// Middleware de log
app.use((req, _, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Health Check
app.get('/', (_, res) => res.status(200).json({ status: 'ready' }));

// Endpoint otimizado
app.post('/api/message', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        console.log('Processing:', message.substring(0, 50));
        
        const response = await axios.post(
            `https://api-inference.huggingface.co/models/${MODEL}`,
            { inputs: message },
            {
                headers: { Authorization: `Bearer ${HF_TOKEN}` },
                timeout: 10000 // 10s timeout
            }
        );

        const reply = response.data?.generated_text || 'Não entendi, pode repetir?';
        res.json({ reply: reply.trim() });

    } catch (error) {
        console.error('Full error:', {
            message: error.message,
            code: error.code,
            response: error.response?.data
        });
        
        res.status(200).json({ // Sempre retorna 200 para o frontend
            reply: 'Estou tendo dificuldades técnicas. Tente novamente mais tarde.'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Model: ${MODEL}`);
});
