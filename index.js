import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
app.use(cors());
app.use(express.json());

// Configuração robusta
const PORT = process.env.PORT || 10000;
const HF_TOKEN = process.env.HF_TOKEN; // ✅ Token via variável de ambiente
const MAX_RESPONSE_TIME = 5000; // 5s timeout

// Base de conhecimento local (modo offline)
const knowledgeBase = {
  "qual é o seu nome?": "Me chamo Kyntharux, sua assistente virtual!",
  "quem te criou?": "Fui desenvolvida para revolucionar a educação digital!",
  "oi": "Olá! Como posso te ajudar hoje? 😊",
  "default": "Estou processando sua pergunta... (modo de recursos limitados)"
};

// Health Check
app.get('/', (req, res) => {
  res.json({ 
    status: 'online',
    plan: 'free',
    tips: 'Envie POST para /api/message com {"message":"sua pergunta"}'
  });
});

// Endpoint de mensagem com IA
app.post('/api/message', async (req, res) => {
  try {
    const userMessage = req.body?.message?.toLowerCase() || '';

    // Tentativa com IA Hugging Face
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/facebook/blenderbot-3B',
      { inputs: userMessage },
      {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`
        },
        timeout: MAX_RESPONSE_TIME
      }
    );

    console.log("📦 Resposta da IA Hugging Face:", response.data);

    const aiReply = response.data?.generated_text || knowledgeBase[userMessage] || knowledgeBase.default;
    res.json({ reply: aiReply });

  } catch (error) {
    console.error("⚠️ Erro na IA externa:", error.message);
    
    // Fallback local
    const userMessage = req.body?.message?.toLowerCase() || '';
    const fallbackReply = knowledgeBase[userMessage] || knowledgeBase.default;
    res.json({ reply: fallbackReply });
  }
});

// Inicialização
app.listen(PORT, () => {
  console.log(`✅ Servidor online na porta ${PORT}`);
}).on('error', (err) => {
  console.error('❌ Erro ao iniciar servidor:', err);
  process.exit(1);
});

