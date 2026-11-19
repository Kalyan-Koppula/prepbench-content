function maxSlidingWindow(nums: number[], k: number): number[] {
  // deque holds indices; deque[head..] have strictly decreasing values.
  // Using a head index instead of shift() keeps removal from the front O(1).
  const deque: number[] = []
  let head = 0
  const result: number[] = []
  for (let i = 0; i < nums.length; i++) {
    // Smaller values behind nums[i] can never be a maximum again.
    while (deque.length > head && nums[deque[deque.length - 1]] <= nums[i]) {
      deque.pop()
    }
    deque.push(i)
    // The front index slid out of the window.
    if (deque[head] <= i - k) {
      head++
    }
    if (i >= k - 1) {
      result.push(nums[deque[head]])
    }
  }
  return result
}
