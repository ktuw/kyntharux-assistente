import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Configuração robusta para free tier
const PORT = process.env.PORT || 10000;
const MAX_RESPONSE_TIME = 5000; // 5s timeout

// Banco de respostas locais (elimina dependência externa inicial)
const knowledgeBase = {
  "qual é o seu nome?": "Me chamo Kyntharux, sua assistente virtual!",
  "quem te criou?": "Fui desenvolvida para revolucionar a educação digital!",
  "oi": "Olá! Como posso te ajudar hoje? 😊",
  "default": "Estou processando sua pergunta... (modo de recursos limitados)"
};

// Health Check simplificado
app.get('/', (req, res) => {
  res.json({ 
    status: 'online',
    plan: 'free',
    tips: 'Envie POST para /api/message com {"message":"sua pergunta"}'
  });
});

// Endpoint principal à prova de falhas
app.post('/api/message', (req, res) => {
  try {
    const userMessage = req.body?.message?.toLowerCase() || '';
    const reply = knowledgeBase[userMessage] || knowledgeBase.default;
    
    // Simula um tempo de processamento
    setTimeout(() => {
      res.json({ reply });
    }, Math.random() * 1000); // Delay aleatório até 1s
  } catch (error) {
    res.status(500).json({ error: "Erro interno simplificado" });
  }
});

// Inicia o servidor com tratamento de erros
app.listen(PORT, () => {
  console.log(`✅ Servidor estável rodando na porta ${PORT}`);
  console.log(`🔗 Teste local: curl -X POST http://localhost:${PORT}/api/message -d '{"message":"oi"}' -H "Content-Type: application/json"`);
}).on('error', (err) => {
  console.error('❌ Falha crítica:', err);
  process.exit(1);
});
