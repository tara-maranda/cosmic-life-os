// ==============================================
// 📄 pages/api/chat-followup.js (NEW FILE)
// ==============================================
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { message, history, originalDump } = req.body

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 400,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: `Continue this conversation as Tara's personal AI assistant. 

ORIGINAL BRAIN DUMP: "${originalDump.content}"
CATEGORY: ${originalDump.category}

CONVERSATION HISTORY:
${history.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

NEW MESSAGE: "${message}"

Respond naturally as her supportive AI assistant who knows her ADHD brain, 3/6 Projector Human Design, and life goals.`
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    res.status(200).json({ response: data.content[0].text })

  } catch (error) {
    console.error('Error in follow-up chat:', error)
    res.status(500).json({ 
      response: "I'm having some technical difficulties right now, but I'm here with you. Let's keep exploring this together!"
    })
  }
}
