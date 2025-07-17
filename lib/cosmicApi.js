export const getCosmicData = async () => {
  try {
    // Get real moon phase data
    const moonResponse = await fetch(`https://api.farmsense.net/v1/moonphases/?d=1`);
    const moonData = await moonResponse.json();
    
    // Get current astrological sign
    const now = new Date();
    const astrologySign = getAstrologySign(now);
    
    return {
      moonPhase: getMoonPhaseFromData(moonData[0]),
      currentSign: astrologySign,
      lastUpdated: now.toISOString()
    };
  } catch (error) {
    console.error('Error fetching cosmic data:', error);
    // Fallback to calculated data
    return {
      moonPhase: calculateMoonPhase(),
      currentSign: getAstrologySign(new Date()),
      lastUpdated: new Date().toISOString()
    };
  }
};
const getMoonPhaseFromData = (moonData) => {
  const phases = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 
                 'Full Moon', 'Waning Gibbous', 'Third Quarter', 'Waning Crescent'];
  return phases[moonData?.phase || 0] || 'Unknown';
};

const calculateMoonPhase = () => {
  const now = new Date();
  const dayOfMonth = now.getDate();
  const phases = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 
                 'Full Moon', 'Waning Gibbous', 'Third Quarter', 'Waning Crescent'];
  return phases[Math.floor(dayOfMonth / 4) % 8];
};

const getAstrologySign = (date) => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) return 'Aries';
  if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) return 'Taurus';
  if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) return 'Gemini';
  if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) return 'Cancer';
  if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) return 'Leo';
  if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) return 'Virgo';
  if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) return 'Libra';
  if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) return 'Scorpio';
  if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) return 'Sagittarius';
  if ((month == 12 && day >= 22) || (month == 1 && day <= 19)) return 'Capricorn';
  if ((month == 1 && day >= 20) || (month == 2 && day <= 18)) return 'Aquarius';
  return 'Pisces';
};
