
import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;
const HF_TOKEN = process.env.HF_TOKEN;

// Middleware de log para debug
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health Check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    endpoints: {
      POST: '/api/message',
      GET: ['/', '/health']
    },
    uptime: process.uptime()
  });
});

// Endpoint POST corrigido
app.post('/api/message', async (req, res) => {
  try {
    // Verifica se o corpo da requisição está correto
    if (!req.body || !req.body.message) {
      return res.status(400).json({ 
        error: "Formato inválido",
        example: { "message": "sua pergunta aqui" }
      });
    }

    // Resposta simulada para teste - REMOVA quando funcionar
    const testResponses = {
      "qual é o seu nome?": "Me chamo Kyntharux!",
      "oi": "Olá! Como posso ajudar?",
      "como você está?": "Estou funcionando bem!"
    };
    
    const lowerMessage = req.body.message.toLowerCase();
    const reply = testResponses[lowerMessage] || "Mensagem recebida com sucesso!";
    
    return res.json({ reply });

    // REMOVA O BLOCO ACIMA E DESCOMENTE O ABAIXO QUANDO TESTAR
    /*
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill',
      { inputs: req.body.message },
      {
        headers: { Authorization: `Bearer ${HF_TOKEN}` },
        timeout: 8000
      }
    );
    
    const reply = response.data?.generated_text || "Não entendi, pode repetir?";
    return res.json({ reply });
    */

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      error: "Erro interno",
      message: error.message
    });
  }
});

// Endpoint alternativo para teste GET
app.get('/api/message', (req, res) => {
  res.status(405).json({
    error: "Método não permitido",
    message: "Use POST para enviar mensagens",
    example: "curl -X POST /api/message -H 'Content-Type: application/json' -d '{\"message\":\"texto\"}'"
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Teste com: curl -X POST http://localhost:${PORT}/api/message -d '{"message":"teste"}' -H "Content-Type: application/json"`);
});
