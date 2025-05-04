import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
app.use(cors());
app.use(express.json());

// Configuração robusta
const PORT = process.env.PORT || 10000;
const MAX_RESPONSE_TIME = 5000; // timeout de 5 segundos
const HF_TOKEN = process.env.HUGGINGFACE_TOKEN;

// Respostas locais como fallback
const knowledgeBase = {
  "qual é o seu nome?": "Me chamo Kyntharux, sua assistente virtual!",
  "quem te criou?": "Fui desenvolvida para revolucionar a educação digital!",
  "oi": "Olá! Como posso te ajudar hoje? 😊",
  "default": "Estou processando sua pergunta... (modo de recursos limitados)"
};

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'online',
    plan: 'free',
    tips: 'Envie POST para /api/message com {"message":"sua pergunta"}'
  });
});

// Endpoint principal com fallback
app.post('/api/message', async (req, res) => {
  const userMessage = req.body?.message || '';

  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
      { inputs: userMessage },
      {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`
        },
        timeout: MAX_RESPONSE_TIME
      }
    );

    const aiReply = response.data?.generated_text || knowledgeBase.default;
    res.json({ reply: aiReply });

  } catch (error) {
    console.error('Erro na API Hugging Face:', error.message);
    const fallbackReply = knowledgeBase[userMessage.toLowerCase()] || knowledgeBase.default;
    res.json({ reply: fallbackReply });
  }
});

// Inicialização
app.listen(PORT, () => {
  console.log(`✅ Servidor estável na porta ${PORT}`);
  console.log(`🌐 Endpoint: POST http://localhost:${PORT}/api/message`);
}).on('error', (err) => {
  console.error('❌ Erro crítico:', err);
  process.exit(1);
});

