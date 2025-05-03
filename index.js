// Importando as dependências necessárias
const express = require('express');
const axios = require('axios');
require('dotenv').config(); // Para carregar variáveis de ambiente do arquivo .env

// Inicializando o servidor Express
const app = express();
const port = process.env.PORT || 3000;

// Obtendo o token de acesso da Hugging Face de uma variável de ambiente
const hfToken = process.env.HF_TOKEN;

// Rota de exemplo
app.get('/', (req, res) => {
  res.send('Assistente Kyntharux funcionando!');
});

// Exemplo de rota para usar o token
app.get('/api/predict', async (req, res) => {
  try {
    // Fazendo uma requisição à Hugging Face API com o token
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/your-model',
      {
        // Corpo da requisição, como entradas do modelo
        inputs: 'Exemplo de input'
      },
      {
        headers: {
          Authorization: `Bearer ${hfToken}`
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Erro ao acessar Hugging Face API:', error);
    res.status(500).send('Erro ao acessar Hugging Face');
  }
});

// Iniciando o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
