/**
 * Calculates match count between user scores and winning draw numbers.
 * @param {Array<number>} winningNumbers - The 5 winning numbers from the draw.
 * @param {Array<number>} userScores - The user's rolling 5 scores.
 * @returns {number} The count of matching numbers.
 */
export function calculateMatchCount(winningNumbers, userScores) {
  if (!winningNumbers || !userScores) return 0;
  const winSet = new Set(winningNumbers);
  let count = 0;
  userScores.forEach(score => {
    if (winSet.has(score)) count++;
  });
  return count;
}

/**
 * Determines prize eligibility based on match count.
 * @param {number} matchCount - Number of matches.
 * @returns {string|null} The match tier name or null if no prize.
 */
export function getMatchTier(matchCount) {
  if (matchCount === 5) return "5-Match";
  if (matchCount === 4) return "4-Match";
  if (matchCount === 3) return "3-Match";
  return null;
}
