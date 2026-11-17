interface Article {
  readonly id: string
  title: string
  body: string
  draft?: boolean
}

interface Card {
  readonly id: string
  title: string
  draft?: boolean
}

interface IdOnly {
  readonly id: string
}

type cases = [
  Expect<Equal<MyOmit<Article, 'body'>, Card>>,
  Expect<Equal<MyOmit<Article, 'title' | 'body' | 'draft'>, IdOnly>>,
  Expect<Equal<MyOmit<Article, keyof Article>, {}>>,
  Expect<Equal<MyOmit<Article, never>, Article>>,
  // a version that loses modifiers would make these plain required, mutable keys
  ExpectFalse<Equal<MyOmit<Article, 'body'>, { id: string; title: string; draft: boolean | undefined }>>,
  Expect<NotAny<MyOmit<Article, 'body'>>>,
]

// @ts-expect-error 'author' is not a key of Article
type unknownKey = MyOmit<Article, 'body' | 'author'>
