function calculateWPM(charactersTyped, startTime) {
  const minutes = (Date.now() - startTime) / 1000 / 60;

  if (minutes <= 0) return 0;

  return Math.round(charactersTyped / 5 / minutes);
}

export default calculateWPM;