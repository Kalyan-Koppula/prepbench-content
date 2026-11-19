function findRoot(parent: number[], x: number): number {
  while (parent[x] !== x) {
    parent[x] = parent[parent[x]]
    x = parent[x]
  }
  return x
}

function accountsMerge(accounts: string[][]): string[][] {
  // Union-find over account indices: accounts that share an email are joined.
  const parent: number[] = []
  for (let i = 0; i < accounts.length; i++) {
    parent.push(i)
  }
  const owner = new Map<string, number>() // email -> first account that listed it
  for (let i = 0; i < accounts.length; i++) {
    for (let j = 1; j < accounts[i].length; j++) {
      const email = accounts[i][j]
      const first = owner.get(email)
      if (first === undefined) {
        owner.set(email, i)
      } else {
        const a = findRoot(parent, i)
        const b = findRoot(parent, first)
        if (a !== b) {
          parent[a] = b
        }
      }
    }
  }
  // Collect each email under its account group's root.
  const groups = new Map<number, string[]>()
  for (const email of owner.keys()) {
    const root = findRoot(parent, owner.get(email) as number)
    let list = groups.get(root)
    if (list === undefined) {
      list = []
      groups.set(root, list)
    }
    list.push(email)
  }
  const result: string[][] = []
  for (const root of groups.keys()) {
    const emails = groups.get(root) as string[]
    emails.sort() // plain character-code order
    const entry: string[] = [accounts[root][0]]
    for (let k = 0; k < emails.length; k++) {
      entry.push(emails[k])
    }
    result.push(entry)
  }
  return result
}
