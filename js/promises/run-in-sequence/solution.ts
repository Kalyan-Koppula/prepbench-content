type Task = (previous: any) => unknown

async function runInSequence(tasks: Task[], initialValue?: unknown): Promise<unknown[]> {
  const results: unknown[] = []
  let previous = initialValue
  for (const task of tasks) {
    previous = await task(previous)
    results.push(previous)
  }
  return results
}
