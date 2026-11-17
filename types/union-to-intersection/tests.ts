type A = { id: string }
type B = { name: string }
type C = { tags: string[] }
type StrFn = (x: string) => 'str'
type NumFn = (x: number) => 'num'

type cases = [
  Expect<Equal<UnionToIntersection<A | B>, A & B>>,
  Expect<Equal<UnionToIntersection<A | B | C>, A & B & C>>,
  Expect<Equal<UnionToIntersection<StrFn | NumFn>, StrFn & NumFn>>,
  Expect<Equal<UnionToIntersection<A>, A>>,
  Expect<Equal<UnionToIntersection<'a' | 'b'>, never>>,
  Expect<Equal<keyof UnionToIntersection<A | B | C>, 'id' | 'name' | 'tags'>>,
  // inferring in a covariant position gives the union back
  ExpectFalse<Equal<UnionToIntersection<A | B>, A | B>>,
  Expect<NotAny<UnionToIntersection<A | B>>>,
]

declare const merged: UnionToIntersection<A | B>
const both: { id: string; name: string } = merged

declare const overloaded: UnionToIntersection<StrFn | NumFn>
const s: 'str' = overloaded('hello')
const n: 'num' = overloaded(42)

// @ts-expect-error booleans aren't one of the overloads
overloaded(true)
