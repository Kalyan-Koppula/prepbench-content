type Action = { type: unknown; [key: string]: unknown }
type Reducer<S> = (state: S | undefined, action: Action) => S

function createStore<S>(reducer: Reducer<S>, preloadedState?: S) {
  // TODO
  return {
    getState: (): S => undefined as S,
    dispatch: (action: Action): Action => action,
    subscribe: (listener: () => void) => () => {},
  }
}

function combineReducers(reducers: Record<string, Reducer<any>>): Reducer<Record<string, any>> {
  // TODO
  return (state) => state ?? {}
}
