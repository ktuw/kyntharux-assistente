const express = require("express");
const cors = require("cors");
const axios = require("axios");

require("dotenv").config(); // para usar variáveis de ambiente a partir de um .env

const app = express();
app.use(cors());
app.use(express.json());

const HF_TOKEN = process.env.HF_TOKEN;
const MODEL_URL = "https://api-inference.huggingface.co/models/bigscience/bloom";

app.post("/api/message", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await axios.post(
      MODEL_URL,
      { inputs: userMessage },
      {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
        },
      }
    );

    const result = response.data;

    const reply = result?.[0]?.generated_text || "Desculpa, não entendi.";
    res.json({ reply });
  } catch (err) {
    console.error("Erro na requisição:", err.response?.data || err.message);
    res.status(500).json({ error: "Erro ao comunicar com o modelo da IA." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});


