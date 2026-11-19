// Sort, then repeatedly take the smallest unused card and look for the next
// groupSize - 1 values among the unused cards. O(n^2).
function isNStraightHand(hand: number[], groupSize: number): boolean {
  const n = hand.length
  if (n % groupSize !== 0) {
    return false
  }
  const cards: number[] = []
  for (let i = 0; i < n; i++) {
    cards.push(hand[i])
  }
  cards.sort((a, b) => a - b)
  const used = new Array(n).fill(false)
  for (let i = 0; i < n; i++) {
    if (used[i]) {
      continue
    }
    used[i] = true
    let want = cards[i] + 1
    let j = i + 1
    for (let k = 1; k < groupSize; k++) {
      while (j < n && (used[j] || cards[j] < want)) {
        j++
      }
      if (j === n || cards[j] !== want) {
        return false
      }
      used[j] = true
      want++
    }
  }
  return true
}
