function asteroidCollision(asteroids: number[]): number[] {
  const stack: number[] = [] // survivors so far, left to right
  for (let i = 0; i < asteroids.length; i++) {
    const current = asteroids[i]
    let alive = true
    // Only a left-mover meeting a right-mover on top of the stack collides.
    while (alive && current < 0 && stack.length > 0 && stack[stack.length - 1] > 0) {
      const top = stack[stack.length - 1]
      if (top < -current) {
        stack.pop() // the right-mover explodes; keep checking further left
      } else {
        if (top === -current) {
          stack.pop() // equal sizes: both explode
        }
        alive = false
      }
    }
    if (alive) {
      stack.push(current)
    }
  }
  return stack
}
