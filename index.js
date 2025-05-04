import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;
const HF_TOKEN = process.env.HF_TOKEN || 'seu_token_aqui'; // Remova em produção
const MODEL = 'facebook/blenderbot-400M-distill';

// Health Check melhorado
app.get('/', (_, res) => res.json({ 
  status: 'ready',
  model: MODEL,
  hf_status: 'https://api-inference.huggingface.co/status',
  uptime: process.uptime()
}));

// Middleware de log
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Endpoint totalmente otimizado para BlenderBot
app.post('/api/message', async (req, res) => {
  const fallbackReplies = [
    "Estou processando isso... um momento!",
    "Vamos tentar de outra forma?",
    "Estou melhorando minhas habilidades, tente novamente mais tarde!"
  ];

  try {
    const { message } = req.body;
    
    // Validação robusta
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ 
        error: "Mensagem inválida",
        reply: "Por favor, envie uma mensagem válida"
      });
    }

    console.log(`Processando mensagem: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);

    // Formato específico para BlenderBot
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${MODEL}`,
      {
        inputs: {
          text: message,
          conversation_id: `kyntharux_${Date.now()}`,
          past_user_inputs: [],
          generated_responses: []
        }
      },
      {
        headers: { 
          Authorization: `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 segundos
      }
    );

    console.log('Resposta completa:', JSON.stringify(response.data, null, 2));

    // Extração da resposta para BlenderBot
    const reply = response.data?.conversation?.generated_responses?.[0] || 
                 response.data?.generated_text ||
                 fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];

    return res.json({ 
      reply: reply.trim(),
      model: MODEL,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro detalhado:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });

    return res.status(200).json({ // Mantém status 200 para o frontend
      reply: fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)],
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Rota para verificar o token da Hugging Face
app.get('/api/check-token', async (_, res) => {
  try {
    const response = await axios.get(
      'https://api-inference.huggingface.co/status',
      {
        headers: { Authorization: `Bearer ${HF_TOKEN}` }
      }
    );
    res.json({ 
      valid: true,
      scopes: response.data.scopes,
      model_status: response.data.models[MODEL] 
    });
  } catch (error) {
    res.status(401).json({ 
      valid: false,
      error: error.response?.data?.error || error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🟢 Servidor rodando na porta ${PORT}`);
  console.log(`🔍 Modelo: ${MODEL}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/`);
  console.log(`🔗 Teste de Token: http://localhost:${PORT}/api/check-token`);
});
