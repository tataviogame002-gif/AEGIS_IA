const fetch = require('node-fetch'); // Garante a compatibilidade do sistema antigo da Vercel

module.exports = async function handler(req, res) {
  // Configura os cabeçalhos para evitar erros de bloqueio (CORS)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { messages } = req.body;
  const COHERE_API_KEY = process.env.COHERE_API_KEY;

  try {
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
      const formattedData = {
        choices: [
          {
            message: {
              role: "assistant",
              content: data.text
            }
          }
        ]
      };
      res.status(200).json(formattedData);
    } else {
      res.status(response.status).json({ error: data.message || "Erro na Cohere." });
    }
  } catch (error) {
    res.status(500).json({ error: "Erro interno na API da Aegis." });
  }
};
