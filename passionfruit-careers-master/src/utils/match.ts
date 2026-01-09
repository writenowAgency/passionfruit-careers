export const matchColorByScore = (score: number) => {
  if (score >= 90) return '#4CAF50';
  if (score >= 75) return '#FFC107';
  if (score >= 60) return '#FF9800';
  return '#F44336';
};
