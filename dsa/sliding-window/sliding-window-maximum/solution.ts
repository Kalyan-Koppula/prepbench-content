function maxSlidingWindow(nums: number[], k: number): number[] {
  // Indices whose values strictly decrease from head to tail.
  const deque: number[] = []
  let head = 0
  const result: number[] = []
  for (let i = 0; i < nums.length; i++) {
    while (deque.length > head && nums[deque[deque.length - 1]] <= nums[i]) deque.pop()
    deque.push(i)
    if (deque[head] <= i - k) head++ // front slid out of the window
    if (i >= k - 1) result.push(nums[deque[head]])
  }
  return result
}
