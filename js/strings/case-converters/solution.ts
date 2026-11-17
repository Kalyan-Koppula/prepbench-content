function splitWords(input: string): string[] {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2') // userName -> user Name
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2') // XMLHttp -> XML Http
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((word) => word.toLowerCase())
}

const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1)

function toCamelCase(input: string): string {
  return splitWords(input)
    .map((word, i) => (i === 0 ? word : capitalize(word)))
    .join('')
}

function toPascalCase(input: string): string {
  return splitWords(input).map(capitalize).join('')
}

function toSnakeCase(input: string): string {
  return splitWords(input).join('_')
}

function toKebabCase(input: string): string {
  return splitWords(input).join('-')
}
