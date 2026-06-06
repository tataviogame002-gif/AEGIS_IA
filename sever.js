const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Permite que o servidor entenda JSON nas requisições
app.use(express.json());

// Serve os arquivos estáticos (como o seu index.html) direto da raiz
app.use(express.static(path.join(__dirname)));

// Rota para processar o chat com a Cohere
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    const COHERE_API_KEY = process.env.COHERE_API_KEY;

    if (!COHERE_API_KEY) {
      return res.status(500).json({ error: "Chave API da Cohere não configurada." });
    }

    const chatHistory = messages.map(msg => ({
      role: msg.role === "assistant" ? "CHATBOT" : "USER",
      message: msg.content
    }));

    const lastMessage = chatHistory.pop();

    const response = await fetch("https://api.cohere.com/v1/chat", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${COHERE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "command-r",
        message: lastMessage.message,
        chat_history: chatHistory
      })
    });

    const data = await response.json();

    if (response.ok) {
      return res.status(200).json({
        choices: [
          {
            message: {
              role: "assistant",
              content: data.text
            }
          }
        ]
      });
    } else {
      return res.status(response.status).json({ error: data.message || "Erro na Cohere." });
    }
  } catch (error) {
    return res.status(500).json({ error: "Erro interno na API da Aegis." });
  }
});

// Inicializa o servidor na porta correta para o Render
app.listen(PORT, () => {
  console.log(`Servidor Aegis rodando na porta ${PORT}`);
});
