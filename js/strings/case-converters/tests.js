test('camelCase from snake, kebab, spaces and screaming snake', () => {
  expect(toCamelCase('created_at_utc')).toBe('createdAtUtc')
  expect(toCamelCase('background-color')).toBe('backgroundColor')
  expect(toCamelCase('Order line item')).toBe('orderLineItem')
  expect(toCamelCase('MAX_RETRY_COUNT')).toBe('maxRetryCount')
})

test('PascalCase capitalises every word', () => {
  expect(toPascalCase('user id')).toBe('UserId')
  expect(toPascalCase('dropdown-menu-item')).toBe('DropdownMenuItem')
  expect(toPascalCase('alreadyCamel')).toBe('AlreadyCamel')
})

test('snake_case from camelCase and PascalCase', () => {
  expect(toSnakeCase('firstName')).toBe('first_name')
  expect(toSnakeCase('ShoppingCartTotal')).toBe('shopping_cart_total')
})

test('kebab-case from camelCase and spaced words', () => {
  expect(toKebabCase('fontSizeLarge')).toBe('font-size-large')
  expect(toKebabCase('  Primary   Button ')).toBe('primary-button')
})

test('splits acronyms before a capitalised word', () => {
  expect(toSnakeCase('XMLHttpRequest')).toBe('xml_http_request')
  expect(toKebabCase('getHTTPResponseCode')).toBe('get-http-response-code')
  expect(toSnakeCase('IOError')).toBe('io_error')
})

test('trailing acronyms stay one word and are not preserved', () => {
  expect(toSnakeCase('userID')).toBe('user_id')
  expect(toCamelCase('userID')).toBe('userId')
  expect(toCamelCase('XML_HTTP_REQUEST')).toBe('xmlHttpRequest')
})

test('digits stay with the word before them', () => {
  expect(toSnakeCase('version2Update')).toBe('version2_update')
  expect(toKebabCase('HTML5Parser')).toBe('html5-parser')
  expect(toCamelCase('base64_encode')).toBe('base64Encode')
})

test('treats any other punctuation as a separator and collapses runs', () => {
  expect(toCamelCase('__private__field__')).toBe('privateField')
  expect(toSnakeCase('user.first-name  value')).toBe('user_first_name_value')
  expect(toKebabCase('--a--b--')).toBe('a-b')
})

test('a single lowercase letter before a capital is its own word', () => {
  expect(toKebabCase('iPhone')).toBe('i-phone')
  expect(toPascalCase('iPhone')).toBe('IPhone')
})

test('returns an empty string when there are no words', () => {
  expect(toCamelCase('')).toBe('')
  expect(toSnakeCase(' - _ ')).toBe('')
})

test('round trips between styles', () => {
  const start = 'parseJsonBody'
  expect(toCamelCase(toKebabCase(toPascalCase(toSnakeCase(start))))).toBe(start)
})
