export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { message, chatType = 'general', chatHistory = [], userContext = {} } = req.body;

  try {
    console.log('Chat request:', { message, chatType });

    // Check for specific commands first
    const actions = extractActions(message);
    let aiResponse = '';

    if (actions.length > 0) {
      // Handle specific actions
      for (const action of actions) {
        switch (action.type) {
          case 'update_cycle':
            aiResponse = `Perfect! I've updated your cycle day to ${action.value}. Your cycle phase is now ${calculateCyclePhase(action.value)}. This helps me give you better timing advice for your activities and energy levels.`;
            break;
          case 'create_database':
            aiResponse = `Excellent! I've created your ${action.name} database with fields for properties, uses, chakra associations, and moon phase timing. You can now start adding your ${action.name} collection and I'll help you organize it by energy and purpose.`;
            break;
          default:
            aiResponse = "I understand what you're asking for! Let me help you with that.";
        }
      }
    } else {
      // Call Claude API for general conversation
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 500,
          temperature: 0.7,
          messages: [
            {
              role: 'user',
              content: `You are Tara's personal AI assistant for her Cosmic Life OS. You know she's a 3/6 Projector with ADHD working on career transition and house goals. She's interested in astrology, tarot, garden, and spiritual growth.

Current message: "${message}"

Respond as her supportive AI assistant who knows her context. Be warm, helpful, and offer specific suggestions when relevant.`
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        aiResponse = data.content[0].text;
      } else {
        throw new Error('Claude API failed');
      }
    }

    res.status(200).json({ 
      response: aiResponse,
      actions: actions,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in chat:', error);
    
    // Provide a helpful fallback response
    const fallbackResponse = getFallbackResponse(message);
    
    res.status(200).json({ 
      response: fallbackResponse,
      actions: extractActions(message),
      timestamp: new Date().toISOString()
    });
  }
}

function extractActions(userMessage) {
  const actions = [];
  const message = userMessage.toLowerCase();
  
  // Detect cycle day updates
  const cycleMatch = message.match(/(?:set|update|change)?\s*(?:my\s*)?cycle\s*day\s*(?:to\s*)?(\d+)/i) || 
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

function calculateCyclePhase(day) {
  if (day <= 5) return 'menstrual';
  if (day <= 13) return 'follicular';
  if (day <= 16) return 'ovulatory';
  return 'luteal';
}

function getFallbackResponse(message) {
  const message_lower = message.toLowerCase();
  
  if (message_lower.includes('cycle')) {
    return "I can help you track your cycle! Try saying 'set my cycle day to [number]' and I'll update it for you with the corresponding phase.";
  }
  
  if (message_lower.includes('database')) {
    return "I can create custom databases for you! Try saying 'create a crystal database' or 'create an herb database' and I'll set it up with relevant fields.";
  }
  
  if (message_lower.includes('goal')) {
    return "I see you're thinking about goals! As a 3/6 Projector, your experimental process is key. What specific area would you like to explore?";
  }
  
  return "I'm here to help with your Cosmic Life OS! I can update your cycle tracking, create new databases, help with goal planning, and chat about your spiritual journey. What would you like to explore?";
}


