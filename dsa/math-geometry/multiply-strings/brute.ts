// Schoolbook long multiplication done in two stages: for each digit of num2,
// build the partial product (num1 x digit, shifted), then add it to the total.
// Numbers are kept as digit arrays with the ones digit first.
function multiply(num1: string, num2: string): string {
  let total: number[] = [0]
  for (let j = num2.length - 1; j >= 0; j--) {
    const digit = num2.charCodeAt(j) - 48
    const shift = num2.length - 1 - j
    const partial: number[] = []
    for (let s = 0; s < shift; s++) {
      partial.push(0)
    }
    let carry = 0
    for (let i = num1.length - 1; i >= 0; i--) {
      const product = (num1.charCodeAt(i) - 48) * digit + carry
      partial.push(product % 10)
      carry = Math.floor(product / 10)
    }
    if (carry > 0) {
      partial.push(carry)
    }
    total = addDigits(total, partial)
  }
  let top = total.length - 1
  while (top > 0 && total[top] === 0) {
    top--
  }
  let result = ''
  for (let k = top; k >= 0; k--) {
    result += String(total[k])
  }
  return result
}

function addDigits(a: number[], b: number[]): number[] {
  const sum: number[] = []
  let carry = 0
  for (let k = 0; k < a.length || k < b.length || carry > 0; k++) {
    let s = carry
    if (k < a.length) {
      s += a[k]
    }
    if (k < b.length) {
      s += b[k]
    }
    sum.push(s % 10)
    carry = Math.floor(s / 10)
  }
  return sum
}
