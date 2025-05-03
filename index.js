import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

// Configuração para Render
const PORT = process.env.PORT || 10000; // Ajustado para 10000

// Modelo mais leve (Blenderbot)
const MODEL_URL = "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill";

// Health Check
app.get("/", (req, res) => {
  res.status(200).send("API Kyntharux Online");
});

app.post("/api/message", async (req, res) => {
  if (!req.body.message) {
    return res.status(400).json({ error: "Mensagem não fornecida" });
  }

  try {
    console.log("Processando mensagem:", req.body.message.substring(0, 50) + "...");
    
    const response = await axios.post(
      MODEL_URL,
      { inputs: req.body.message },
      {
        headers: { Authorization: `Bearer ${process.env.HF_TOKEN}` },
        timeout: 15000 // 15 segundos (dentro do limite do Render)
      }
    );

    const reply = response.data?.generated_text || "Pode reformular a pergunta?";
    res.json({ reply: reply.trim() });

  } catch (err) {
    console.error("ERRO:", {
      message: err.message,
      code: err.code,
      response: err.response?.data
    });

    // Resposta alternativa em caso de erro
    const fallbackReplies = [
      "Estou processando outra solicitação, tente novamente em instantes!",
      "Estou aprendendo ainda, pode repetir de outra forma?",
      "No momento estou ocupada, volte mais tarde!"
    ];
    
    res.status(200).json({  // Retorna 200 mesmo com erro para não quebrar o front
      reply: fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)]
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Modo: ${process.env.NODE_ENV || 'development'}`);
});
