export function generateRandomDraw() {
  const numbers = [];
  while (numbers.length < 5) {
    const r = Math.floor(Math.random() * 45) + 1;
    if (numbers.indexOf(r) === -1) numbers.push(r);
  }
  return numbers.sort((a, b) => a - b);
}

export function generateAlgorithmicDraw(userScores) {
  // Logic: Pick numbers that appear most frequently in user scores
  // If not enough scores, fill with random
  const counts = {};
  userScores.forEach(s => {
    counts[s] = (counts[s] || 0) + 1;
  });

  const sortedNums = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
  const result = sortedNums.slice(0, 5).map(Number);

  while (result.length < 5) {
    const r = Math.floor(Math.random() * 45) + 1;
    if (result.indexOf(r) === -1) result.push(r);
  }

  return result.sort((a, b) => a - b);
}
