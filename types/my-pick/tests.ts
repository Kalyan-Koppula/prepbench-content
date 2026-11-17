interface Todo {
  title: string
  description: string
  done: boolean
}

interface Expected1 {
  title: string
}

interface Expected2 {
  title: string
  done: boolean
}

type cases = [
  Expect<Equal<Expected1, MyPick<Todo, 'title'>>>,
  Expect<Equal<Expected2, MyPick<Todo, 'title' | 'done'>>>,
  Expect<Equal<{}, MyPick<Todo, never>>>,
  Expect<Equal<{ readonly id: number }, MyPick<{ readonly id: number; name: string }, 'id'>>>,
]

// @ts-expect-error 'missing' is not a key of Todo
type error = MyPick<Todo, 'title' | 'missing'>
