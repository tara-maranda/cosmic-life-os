import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { cycleDay, cyclePhase } = req.body;
    
    try {
      const phase = cyclePhase || calculateCyclePhase(cycleDay);
      
      // Try to update in database (you could store user cycle data)
      // For now, just return the updated data
      const cycleData = {
        day: cycleDay,
        phase: phase,
        updated: new Date().toISOString()
      };
      
      console.log('Updated cycle data:', cycleData);
      
      res.status(200).json(cycleData);
    } catch (error) {
      console.error('Error updating cycle:', error);
      res.status(500).json({ error: 'Failed to update cycle data' });
    }
  } else if (req.method === 'GET') {
    // Return current cycle data
    res.status(200).json({
      day: 14,
      phase: 'ovulatory',
      lastUpdated: new Date().toISOString()
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

function calculateCyclePhase(day) {
  if (day <= 5) return 'menstrual';
  if (day <= 13) return 'follicular';
  if (day <= 16) return 'ovulatory';
  return 'luteal';
}
