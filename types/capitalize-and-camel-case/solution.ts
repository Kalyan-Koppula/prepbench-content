type MyCapitalize<S extends string> = S extends `${infer First}${infer Rest}` ? `${Uppercase<First>}${Rest}` : S

type CamelCase<S extends string> = S extends `${infer C}${infer Rest}`
  ? C extends '-' | '_'
    ? CamelCase<MyCapitalize<Rest>>
    : `${C}${CamelCase<Rest>}`
  : S
