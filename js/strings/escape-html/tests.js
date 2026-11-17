test('escapes the five special characters', () => {
  expect(escapeHtml(`<a href="x" title='y'>&</a>`)).toBe('&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;')
})

test('escapes ampersands in existing entities', () => {
  expect(escapeHtml('&lt; and &amp;')).toBe('&amp;lt; and &amp;amp;')
})

test('leaves other characters alone', () => {
  const text = 'Plain text / `ticks` = ok, naïve café 😀'
  expect(escapeHtml(text)).toBe(text)
  expect(escapeHtml('')).toBe('')
})

test('unescapes the named entities', () => {
  expect(unescapeHtml('&lt;b&gt;Tom &amp; Jerry&lt;/b&gt; &quot;hi&quot; &apos;yo&apos;')).toBe(`<b>Tom & Jerry</b> "hi" 'yo'`)
})

test('unescapes decimal and hex references, including emoji', () => {
  expect(unescapeHtml('&#169; &#39; &#x41;&#X42; &#x1F600;')).toBe("© ' AB 😀")
})

test('decodes in one pass, never twice', () => {
  expect(unescapeHtml('&amp;lt;script&amp;gt;')).toBe('&lt;script&gt;')
  expect(unescapeHtml('&#38;amp;')).toBe('&amp;')
})

test('leaves unknown, unterminated and malformed references alone', () => {
  const text = '&copy; &nbsp &AMP; & alone &#xZZ; &#; &;'
  expect(unescapeHtml(text)).toBe(text)
})

test('leaves references to invalid code points alone', () => {
  const text = '&#0; &#xD800; &#x110000; &#99999999;'
  expect(unescapeHtml(text)).toBe(text)
})

test('unescape undoes escape', () => {
  const tricky = `if (a < b && c > "d") return 'e' // &amp; stays literal`
  expect(unescapeHtml(escapeHtml(tricky))).toBe(tricky)
})
