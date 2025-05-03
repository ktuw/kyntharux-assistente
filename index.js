const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const HF_TOKEN = "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";
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

    const text = response.data[0]?.generated_text || "Desculpa, não entendi.";
    res.json({ reply: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao falar com o modelo." });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor rodando na porta 3000");
});


