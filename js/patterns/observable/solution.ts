interface Observer<T> {
  next?: (value: T) => void
  error?: (err: unknown) => void
  complete?: () => void
}

interface Subscription {
  unsubscribe(): void
}

type Producer<T> = (observer: Required<Observer<T>>) => (() => void) | void

class Observable<T> {
  constructor(private producer: Producer<T>) {}

  subscribe(observer?: Observer<T> | ((value: T) => void)): Subscription {
    const sink: Observer<T> = typeof observer === 'function' ? { next: observer } : (observer ?? {})
    let closed = false
    let teardown: (() => void) | void

    const runTeardown = () => {
      const t = teardown
      teardown = undefined
      if (t) t()
    }
    const guarded: Required<Observer<T>> = {
      next: (value) => {
        if (!closed) sink.next?.(value)
      },
      error: (err) => {
        if (closed) return
        closed = true
        sink.error?.(err)
        runTeardown()
      },
      complete: () => {
        if (closed) return
        closed = true
        sink.complete?.()
        runTeardown()
      },
    }

    try {
      teardown = this.producer(guarded)
    } catch (err) {
      guarded.error(err)
    }
    // The producer may have finished synchronously before it returned its teardown.
    if (closed) runTeardown()

    return {
      unsubscribe: () => {
        closed = true
        runTeardown()
      },
    }
  }

  map<R>(fn: (value: T) => R): Observable<R> {
    return new Observable<R>((observer) => {
      const sub = this.subscribe({
        next: (value) => {
          let mapped: R
          try {
            mapped = fn(value)
          } catch (err) {
            observer.error(err)
            return
          }
          observer.next(mapped)
        },
        error: (err) => observer.error(err),
        complete: () => observer.complete(),
      })
      return () => sub.unsubscribe()
    })
  }

  filter(predicate: (value: T) => boolean): Observable<T> {
    return new Observable<T>((observer) => {
      const sub = this.subscribe({
        next: (value) => {
          let keep: boolean
          try {
            keep = predicate(value)
          } catch (err) {
            observer.error(err)
            return
          }
          if (keep) observer.next(value)
        },
        error: (err) => observer.error(err),
        complete: () => observer.complete(),
      })
      return () => sub.unsubscribe()
    })
  }
}
