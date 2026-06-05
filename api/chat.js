export default async function handler(req, res) {
  // 1. Pega as mensagens que o seu HTML enviou
  const { messages } = req.body;

  // 2. Pega a sua chave do OpenRouter trancada na Vercel
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

  try {
    // 3. A ponte faz a pergunta ao OpenRouter de forma escondida
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://vercel.com", 
        "X-Title": "Aegis IA"
      },
      body: JSON.stringify({
        // Mudamos para um modelo excelente e que não dá erro de "user not found"
        model: "meta-llama/llama-3-8b-instruct:free",
        messages: messages,
        max_tokens: 384
      })
    });

    const data = await response.json();
    
    // 4. Devolve a resposta para o seu HTML
    if (response.ok) {
      res.status(200).json(data);
    } else {
      res.status(response.status).json({ error: data.error?.message || "Erro no OpenRouter" });
    }
  } catch (error) {
    res.status(500).json({ error: "Erro na ponte de segurança" });
  }
}
