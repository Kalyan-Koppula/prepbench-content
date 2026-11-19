// Intersect every pair. Both lists are sorted and disjoint, so looping over the
// first list on the outside yields the pieces already in order. O(n * m).
function intervalIntersection(firstList: number[][], secondList: number[][]): number[][] {
  const result: number[][] = []
  for (let i = 0; i < firstList.length; i++) {
    for (let j = 0; j < secondList.length; j++) {
      const low = Math.max(firstList[i][0], secondList[j][0])
      const high = Math.min(firstList[i][1], secondList[j][1])
      if (low <= high) {
        result.push([low, high])
      }
    }
  }
  return result
}
