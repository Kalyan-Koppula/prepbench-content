type Push<T extends readonly unknown[], U> = [...T, U]

type Unshift<T extends readonly unknown[], U> = [U, ...T]
