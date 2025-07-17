export default async function handler(req, res) {
  try {
    // Simple cosmic data calculation for now
    const now = new Date();
    const dayOfMonth = now.getDate();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    
    // Calculate moon phase
    const phases = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 
                   'Full Moon', 'Waning Gibbous', 'Third Quarter', 'Waning Crescent'];
    const moonPhase = phases[Math.floor(dayOfMonth / 4) % 8];
    
    // Calculate astrological sign
    let currentSign = 'Loading...';
    if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) currentSign = 'Leo';
    else if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) currentSign = 'Virgo';
    else if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) currentSign = 'Libra';
    // Add more as needed...
    
    res.status(200).json({
      moonPhase,
      currentSign,
      lastUpdated: now.toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get cosmic data' });
  }
}
