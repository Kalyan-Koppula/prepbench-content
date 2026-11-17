const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
const NAMED: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => ESCAPES[ch])
}

function unescapeHtml(html: string): string {
  return html.replace(/&(?:#(\d+)|#[xX]([0-9a-fA-F]+)|([a-zA-Z]+));/g, (match, dec?: string, hex?: string, name?: string) => {
    if (name !== undefined) return Object.prototype.hasOwnProperty.call(NAMED, name) ? NAMED[name] : match
    const code = dec !== undefined ? parseInt(dec, 10) : parseInt(hex!, 16)
    const valid = code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff)
    return valid ? String.fromCodePoint(code) : match
  })
}
