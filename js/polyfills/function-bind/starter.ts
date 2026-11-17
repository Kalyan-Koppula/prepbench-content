function myBind(this: Function, thisArg: unknown, ...presets: unknown[]) {
  // TODO: return a function that calls `this` with `thisArg`, presets and new arguments
  return function bound(...args: unknown[]): unknown {
    return undefined
  }
}
