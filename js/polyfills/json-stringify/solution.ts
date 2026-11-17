function jsonStringify(value: unknown): string | undefined {
  const SHORT: Record<string, string> = { '"': '\\"', '\\': '\\\\', '\b': '\\b', '\f': '\\f', '\n': '\\n', '\r': '\\r', '\t': '\\t' }
  const stack: object[] = []

  function quote(s: string) {
    let out = '"'
    for (let i = 0; i < s.length; i++) {
      const ch = s[i]
      const code = s.charCodeAt(i)
      if (SHORT[ch]) out += SHORT[ch]
      else if (code < 0x20) out += '\\u' + code.toString(16).padStart(4, '0')
      else out += ch
    }
    return out + '"'
  }

  function serialize(key: string, input: unknown): string | undefined {
    let v: any = input
    if (v !== null && typeof v === 'object' && typeof v.toJSON === 'function') v = v.toJSON(key)
    if (v instanceof Number || v instanceof String || v instanceof Boolean) v = v.valueOf()

    if (v === null) return 'null'
    switch (typeof v) {
      case 'string':
        return quote(v)
      case 'number':
        return Number.isFinite(v) ? String(v) : 'null'
      case 'boolean':
        return String(v)
      case 'bigint':
        throw new TypeError('Do not know how to serialize a BigInt')
      case 'undefined':
      case 'function':
      case 'symbol':
        return undefined
    }

    if (stack.includes(v)) throw new TypeError('Converting circular structure to JSON')
    stack.push(v)
    let out: string
    if (Array.isArray(v)) {
      const items: string[] = []
      for (let i = 0; i < v.length; i++) items.push(serialize(String(i), v[i]) ?? 'null')
      out = '[' + items.join(',') + ']'
    } else {
      const parts: string[] = []
      for (const k of Object.keys(v)) {
        const s = serialize(k, v[k])
        if (s !== undefined) parts.push(quote(k) + ':' + s)
      }
      out = '{' + parts.join(',') + '}'
    }
    stack.pop()
    return out
  }

  return serialize('', value)
}
