function asteroidCollision(asteroids: number[]): number[] {
  const stack: number[] = []
  for (const a of asteroids) {
    let alive = true
    // Collisions only happen when a left-mover meets a right-mover on top.
    while (alive && a < 0 && stack.length && stack[stack.length - 1] > 0) {
      const top = stack[stack.length - 1]
      if (top < -a) stack.pop() // top explodes, keep going
      else {
        if (top === -a) stack.pop() // both explode
        alive = false
      }
    }
    if (alive) stack.push(a)
  }
  return stack
}
