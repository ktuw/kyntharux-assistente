import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;
const HF_TOKEN = process.env.HF_TOKEN;
const MODEL = 'facebook/blenderbot-400M-distill';

// Health Check
app.get('/', (_, res) => res.json({ 
  status: 'ready',
  model: MODEL,
  timestamp: new Date().toISOString() 
}));

// Endpoint otimizado
app.post('/api/message', async (req, res) => {
  const fallback = () => {
    const replies = [
      "Estou processando sua solicitação...",
      "Vamos tentar novamente?",
      "Estou em treinamento, tente mais tarde!"
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  };

  try {
    const { message } = req.body;
    
    if (!message) return res.json({ reply: "Por favor, envie uma mensagem válida" });

    const hfResponse = await axios.post(
      `https://api-inference.huggingface.co/models/${MODEL}`,
      {
        inputs: {
          text: message,
          conversation_id: `kyntharux_${Date.now()}`
        }
      },
      {
        headers: { 
          Authorization: `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 8000
      }
    );

    const reply = hfResponse.data?.conversation?.generated_responses?.[0] || 
                 hfResponse.data?.generated_text ||
                 fallback();

    return res.json({ reply: reply.trim() });

  } catch (error) {
    console.error('API Error:', {
      message: error.message,
      code: error.code,
      response: error.response?.data
    });
    return res.json({ reply: fallback() });
  }
});

app.listen(PORT, () => {
  console.log(`Server ready on port ${PORT}`);
  console.log(`Using model: ${MODEL}`);
});
