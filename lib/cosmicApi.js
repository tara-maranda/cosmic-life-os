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
