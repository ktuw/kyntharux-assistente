import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;
const HF_TOKEN = process.env.HF_TOKEN;
const MODEL = 'facebook/blenderbot-400M-distill';

// Cache simples em memória
const messageCache = new Map();

// Health Check otimizado para free tier
app.get('/', (req, res) => {
  res.json({
    status: 'ready',
    plan: 'free',
    warning: 'Server may spin down after 15min inactivity',
    uptime: process.uptime()
  });
});

// Endpoint ultra-otimizado
app.post('/api/message', async (req, res) => {
  const { message } = req.body;
  
  // Respostas pré-definidas para evitar chamadas externas
  const staticResponses = {
    "qual é o seu nome?": "Me chamo Kyntharux! Sou sua assistente virtual.",
    "como você está?": "Estou funcionando bem, obrigada! E você?",
    "oi": "Olá! Como posso te ajudar hoje?",
    "quem te criou?": "Fui desenvolvida para ajudar nos projetos educacionais da sua equipe!"
  };

  // 1. Verifica cache
  if (messageCache.has(message)) {
    return res.json({ 
      reply: messageCache.get(message),
      cached: true 
    });
  }

  // 2. Respostas estáticas
  const lowerMessage = message.toLowerCase();
  if (staticResponses[lowerMessage]) {
    messageCache.set(message, staticResponses[lowerMessage]);
    return res.json({ 
      reply: staticResponses[lowerMessage],
      static: true 
    });
  }

  // 3. Se não tiver resposta pronta, usa fallback
  const fallbackReplies = [
    "Vamos conversar sobre algo específico?",
    "Estou processando sua pergunta...",
    "No momento estou com recursos limitados. Podemos tentar mais tarde?",
    "Que tal perguntar de outra forma?"
  ];

  // 4. Tenta chamar a API só se absolutamente necessário
  try {
    const start = Date.now();
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${MODEL}`,
      { inputs: message },
      {
        headers: { Authorization: `Bearer ${HF_TOKEN}` },
        timeout: 5000 // Timeout reduzido
      }
    );

    const reply = response.data?.generated_text || fallbackReplies[0];
    messageCache.set(message, reply); // Armazena no cache
    
    return res.json({
      reply,
      processingTime: `${Date.now() - start}ms`
    });

  } catch (error) {
    console.log('API Error (using fallback):', error.message);
    const randomFallback = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
    messageCache.set(message, randomFallback);
    return res.json({ reply: randomFallback });
  }
});

// Keep-alive para prevenir spin down
setInterval(() => {
  axios.get(`https://kyntharux-assistente-1.onrender.com`)
    .catch(() => console.log('Keep-alive ping'));
}, 5 * 60 * 1000); // 5 minutos

app.listen(PORT, () => {
  console.log(`Server optimized for free tier running on port ${PORT}`);
});
