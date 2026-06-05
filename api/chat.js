export default async function handler(req, res) {
  // 1. Pega a mensagem que o seu HTML enviou
  const { messages } = req.body;

  // 2. Pega a sua chave secreta que está trancada na Vercel
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

  try {
    // 3. A ponte faz a pergunta ao OpenRouter de forma escondida
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://vercel.com", // Avisa o OpenRouter de onde vem o acesso
        "X-Title": "Aegis IA" // Dá um nome para o seu projeto no sistema deles
      },
body: JSON.stringify({
  model: "google/gemini-2.5-flash",
  messages: messages,
  max_tokens:  384 // Isso impede a IA de criar um podcast!
})
    });

    const data = await response.json();
    
    // 4. Devolve a resposta da IA para o seu HTML
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Erro na ponte de segurança" });
  }
}
