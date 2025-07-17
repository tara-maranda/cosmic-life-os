export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { cycleDay, cyclePhase } = req.body;
    
    try {
      // In a real app, save to database
      // For now, return the updated data
      const phase = cyclePhase || calculateCyclePhase(cycleDay);
      
      res.status(200).json({
        cycleDay: cycleDay,
        cyclePhase: phase,
        updated: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update cycle data' });
    }
  } else if (req.method === 'GET') {
    // Return current cycle data
    res.status(200).json({
      cycleDay: 14,
      cyclePhase: 'ovulatory',
      lastUpdated: new Date().toISOString()
    });
  }
}

function calculateCyclePhase(day) {
  if (day <= 5) return 'menstrual';
  if (day <= 13) return 'follicular';
  if (day <= 16) return 'ovulatory';
  return 'luteal';
}
