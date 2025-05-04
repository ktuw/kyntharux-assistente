import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;
const HF_TOKEN = process.env.HF_TOKEN;

// Cache de respostas
const responseCache = new Map();

// Banco de dados de respostas pré-definidas
const predefinedResponses = {
  "qual é o seu nome?": "Me chamo Kyntharux, sua assistente virtual!",
  "quem te criou?": "Fui desenvolvida pela equipe de inovação educacional!",
  "oi": "Olá! Como posso te ajudar hoje? 😊",
  "como você está?": "Estou funcionando perfeitamente, obrigada!",
  "o que você faz?": "Respondo perguntas e ajudo com informações educacionais"
};

app.post('/api/message', async (req, res) => {
  const { message } = req.body;
  
  // 1. Verifica se está no cache
  if (responseCache.has(message)) {
    return res.json({ 
      reply: responseCache.get(message),
      cached: true 
    });
  }

  // 2. Verifica respostas pré-definidas
  const lowerMessage = message.toLowerCase();
  if (predefinedResponses[lowerMessage]) {
    responseCache.set(message, predefinedResponses[lowerMessage]);
    return res.json({ 
      reply: predefinedResponses[lowerMessage],
      static: true 
    });
  }

  // 3. Tenta chamar a API (com fallback)
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill',
      { inputs: message },
      {
        headers: { Authorization: `Bearer ${HF_TOKEN}` },
        timeout: 5000 // Timeout curto para free tier
      }
    );

    const reply = response.data?.generated_text || "Pode reformular a pergunta?";
    responseCache.set(message, reply);
    
    return res.json({ reply });

  } catch (error) {
    console.error('API Error:', error.message);
    
    // Fallback inteligente
    const fallbacks = [
      "Estou processando sua pergunta...",
      "Vamos tentar de outra forma?",
      "No momento estou com recursos limitados"
    ];
    const reply = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    
    responseCache.set(message, reply);
    return res.json({ reply });
  }
});

// Keep-alive para prevenir inatividade
setInterval(() => {
  axios.get(`https://${process.env.RENDER_EXTERNAL_URL || `localhost:${PORT}`}`)
    .catch(() => {});
}, 4 * 60 * 1000); // Ping a cada 4 minutos

app.listen(PORT, () => {
  console.log(`Servidor otimizado rodando na porta ${PORT}`);
});
