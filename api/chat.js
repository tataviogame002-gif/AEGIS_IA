module.exports = async function handler(req, res) {
  // Configurações de segurança para o chat funcionar em qualquer lugar
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { messages } = req.body;
    const COHERE_API_KEY = process.env.COHERE_API_KEY;

    // Organiza as mensagens para a Cohere
    const chatHistory = messages.map(msg => ({
      role: msg.role === "assistant" ? "CHATBOT" : "USER",
      message: msg.content
    }));

    const lastMessage = chatHistory.pop();

    // Usando o fetch nativo do sistema, sem precisar importar nada!
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
};
