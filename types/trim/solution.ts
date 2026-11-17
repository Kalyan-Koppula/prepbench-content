type Ws = ' ' | '\n' | '\t'

type TrimStart<S extends string> = S extends `${Ws}${infer Rest}` ? TrimStart<Rest> : S

type TrimEnd<S extends string> = S extends `${infer Rest}${Ws}` ? TrimEnd<Rest> : S

type Trim<S extends string> = TrimEnd<TrimStart<S>>
