type Task = (previous: any) => unknown

function runInSequence(tasks: Task[], initialValue?: unknown): Promise<unknown[]> {
  // TODO
}
