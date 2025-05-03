import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

// Configure isso como variável de ambiente no Render
const HF_TOKEN = process.env.HF_TOKEN || "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";

// Mude para um modelo mais leve e rápido
const MODEL_URL = "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill";

app.post("/api/message", async (req, res) => {
  if (!req.body.message) {
    return res.status(400).json({ error: "O campo 'message' é obrigatório" });
  }

  try {
    console.log("Enviando para Hugging Face:", req.body.message);
    
    const response = await axios.post(
      MODEL_URL,
      { inputs: req.body.message },
      {
        headers: { Authorization: `Bearer ${HF_TOKEN}` },
        timeout: 10000 // 10 segundos timeout
      }
    );

    console.log("Resposta do Hugging Face:", response.data);
    
    // Processamento diferente para blenderbot
    const text = response.data?.generated_text || 
                response.data?.conversation?.generated_responses?.[0] || 
                "Desculpe, não entendi sua mensagem.";
    
    res.json({ reply: text.trim() });
    
  } catch (err) {
    console.error("Erro completo:", {
      message: err.message,
      response: err.response?.data,
      stack: err.stack
    });
    
    res.status(500).json({ 
      error: "Erro ao processar sua mensagem",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

