type MyExclude<T, U> = T extends U ? never : T

type MyExtract<T, U> = T extends U ? T : never
