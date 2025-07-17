export default async function handler(req, res) {
  try {
    const now = new Date();
    
    // Calculate real moon phase based on current date
    const moonPhase = calculateMoonPhase(now);
    
    // Calculate real astrological sign
    const currentSign = calculateAstrologySign(now);
    
    res.status(200).json({
      moonPhase,
      currentSign,
      lastUpdated: now.toISOString()
    });
  } catch (error) {
    console.error('Error in cosmic API:', error);
    res.status(500).json({ 
      error: 'Failed to get cosmic data',
      moonPhase: 'Unknown',
      currentSign: 'Unknown'
    });
  }
}

function calculateMoonPhase(date) {
  // Simplified moon phase calculation
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Known new moon date (approximate)
  const knownNewMoon = new Date(2024, 0, 11); // Jan 11, 2024
  const daysSinceNewMoon = Math.floor((date - knownNewMoon) / (1000 * 60 * 60 * 24));
  const lunarCycle = 29.53; // days
  const phase = (daysSinceNewMoon % lunarCycle) / lunarCycle;
  
  if (phase < 0.0625) return 'New Moon';
  if (phase < 0.1875) return 'Waxing Crescent';
  if (phase < 0.3125) return 'First Quarter';
  if (phase < 0.4375) return 'Waxing Gibbous';
  if (phase < 0.5625) return 'Full Moon';
  if (phase < 0.6875) return 'Waning Gibbous';
  if (phase < 0.8125) return 'Third Quarter';
  return 'Waning Crescent';
}

function calculateAstrologySign(date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  if ((month == 1 && day >= 20) || (month == 2 && day <= 18)) return 'Aquarius';
  if ((month == 2 && day >= 19) || (month == 3 && day <= 20)) return 'Pisces';
  if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) return 'Aries';
  if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) return 'Taurus';
  if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) return 'Gemini';
  if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) return 'Cancer';
  if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) return 'Leo';
  if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) return 'Virgo';
  if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) return 'Libra';
  if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) return 'Scorpio';
  if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) return 'Sagittarius';
  return 'Capricorn';
}
