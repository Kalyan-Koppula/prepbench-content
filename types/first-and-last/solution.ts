type First<T extends readonly unknown[]> = T extends readonly [infer H, ...unknown[]] ? H : never

type Last<T extends readonly unknown[]> = T extends readonly [...unknown[], infer L] ? L : never
