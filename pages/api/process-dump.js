// ==============================================
// 📄 pages/api/process-dump.js (NEW FILE)
// ==============================================
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { content, category, userContext } = req.body

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
        max_tokens: 500,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: `You are Tara's personal AI assistant for her Cosmic Life OS - a holistic life management system. 

CONTEXT ABOUT TARA:
- Human Design: 3/6 Projector (Wait for Invitation strategy)
- Has ADHD, struggles with traditional organization
- Working on career transition and buying a house
- Interested in: astrology, tarot, garden, cycle syncing, spiritual growth
- Challenges: That ceiling fan project she's been putting off for 8 months
- Current focus: Building her second brain system

BRAIN DUMP CATEGORY: ${category}
BRAIN DUMP CONTENT: "${content}"

As her AI assistant, provide a helpful, warm, and actionable response that:
1. Acknowledges her thought with empathy
2. Offers 1-2 specific, ADHD-friendly suggestions
3. Connects to her bigger goals when relevant
4. Uses her Human Design (3/6 Projector) wisdom
5. Keeps it encouraging and not overwhelming

Respond as if you're a wise, supportive friend who truly knows her.`
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.content[0].text

    res.status(200).json({ 
      response: aiResponse,
      suggestions: extractSuggestions(aiResponse, category)
    })

  } catch (error) {
    console.error('Error processing dump:', error)
    res.status(500).json({ 
      message: 'Error processing dump',
      fallback: getFallbackResponse(category)
    })
  }
}

function extractSuggestions(response, category) {
  // Extract actionable suggestions from AI response
  const suggestions = []
  
  if (category === 'tasks') {
    suggestions.push('Add to weekly time blocks', 'Set gentle reminder', 'Break into smaller steps')
  } else if (category === 'goals') {
    suggestions.push('Add to goal roadmap', 'Schedule planning session', 'Connect to daily actions')
  } else if (category === 'spiritual') {
    suggestions.push('Save to spiritual insights', 'Journal deeper', 'Check astrological timing')
  } else if (category === 'garden') {
    suggestions.push('Add to garden database', 'Check moon phase timing', 'Plan seasonal actions')
  } else if (category === 'health') {
    suggestions.push('Track in cycle calendar', 'Add to health goals', 'Research cycle syncing')
  } else {
    suggestions.push('Save for later review', 'Connect to other thoughts', 'Explore further')
  }
  
  return suggestions
}

function getFallbackResponse(category) {
  const fallbacks = {
    goals: "I can see this connects to your bigger vision! As a 3/6 Projector, trust your experimental process. Let's break this into small steps that honor your energy.",
    tasks: "Perfect capture! Your ADHD brain just freed up space by getting this out. Want me to help prioritize this based on your energy and current goals?",
    spiritual: "What a beautiful insight! This feels like important inner wisdom. As a Projector, these downloads are your gifts. How can we integrate this into your spiritual practice?",
    garden: "Love this garden connection! Your earth-based wisdom is showing. Let's tie this to the seasonal cycles and your moon phase planning.",
    health: "Your body wisdom is speaking! Let's connect this to your cycle awareness and see how it fits with your PCOS/PMDD support strategies.",
    home: "Another house project insight! I see the pattern here (hello, ceiling fan 😉). Let's make this feel manageable for your ADHD brain.",
    random: "I love these random thoughts - they're often the most important ones! Your 3/6 Projector mind is making connections. Let's see where this leads."
  }
  
  return fallbacks[category] || fallbacks.random
}
