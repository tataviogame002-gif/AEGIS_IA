export default async function handler(req, res) {
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
      res.status(response.status).json({ error: data.message || "Erro de comunicação com a Cohere." });
    }
  } catch (error) {
    res.status(500).json({ error: "Erro interno na API da Aegis." });
  }
}
