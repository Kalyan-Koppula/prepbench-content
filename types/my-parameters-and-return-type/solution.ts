type MyParameters<F extends (...args: any) => any> = F extends (...args: infer P) => any ? P : never

type MyReturnType<F extends (...args: any) => any> = F extends (...args: any) => infer R ? R : never
