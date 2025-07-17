export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { message, chatType = 'general', chatHistory = [], userContext = {} } = req.body;

  try {
    // Build context based on chat type
    let systemPrompt = `You are Tara's personal AI assistant for her Cosmic Life OS. You have access to ALL her data and maintain context across conversations.

CONTEXT ABOUT TARA:
- Human Design: 3/6 Projector (Wait for Invitation strategy)
- Has ADHD, struggles with traditional organization
- Working on career transition and buying a house
- Interested in: astrology, tarot, garden, cycle syncing, spiritual growth
- Challenges: That ceiling fan project (8 months overdue!)
- Current focus: Building her holistic second brain system

CURRENT SESSION: ${chatType} chat
COSMIC CONTEXT: ${userContext.cosmicData ? `Moon: ${userContext.cosmicData.moonPhase}, Sign: ${userContext.cosmicData.currentSign}` : 'Loading...'}
CYCLE CONTEXT: ${userContext.cycleData ? `Day ${userContext.cycleData.day}, ${userContext.cycleData.phase} phase` : 'Unknown'}

CONVERSATION HISTORY:
${chatHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

CURRENT MESSAGE: "${message}"

You can:
1. Update cycle day when asked ("set cycle day to X" or "I'm on day X")
2. Create new databases ("create crystal database", "start herb database", etc.)
3. Move brain dumps to specific databases
4. Provide cosmic timing guidance
5. Help with ADHD-friendly organization
6. Remember context across ALL conversations

Respond naturally and take actions when requested. If creating a database or updating data, mention what you're doing.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 800,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: systemPrompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.content[0].text;

    // Check for actions in the response
    const actions = extractActions(message, aiResponse);

    res.status(200).json({ 
      response: aiResponse,
      actions: actions,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ 
      response: "I'm having some technical difficulties, but I'm here with you. Let me try to help anyway!",
      error: error.message
    });
  }
}

function extractActions(userMessage, aiResponse) {
  const actions = [];
  const message = userMessage.toLowerCase();
  
  // Detect cycle day updates
  const cycleMatch = message.match(/(?:set|update|change)?\s*cycle\s*day\s*(?:to\s*)?(\d+)/i) || 
                    message.match(/(?:i'm|im)\s*on\s*day\s*(\d+)/i);
  if (cycleMatch) {
    actions.push({
      type: 'update_cycle',
      value: parseInt(cycleMatch[1])
    });
  }

  // Detect database creation requests
  const dbMatch = message.match(/(?:create|start|make)\s*(?:a\s*)?(\w+)\s*database/i);
  if (dbMatch) {
    actions.push({
      type: 'create_database',
      name: dbMatch[1]
    });
  }

  return actions;
}
