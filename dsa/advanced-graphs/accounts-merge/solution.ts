function accountsMerge(accounts: string[][]): string[][] {
  const parent = accounts.map((_, i) => i)
  const find = (x: number): number => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]]
      x = parent[x]
    }
    return x
  }

  const owner = new Map<string, number>() // email -> first account that listed it
  accounts.forEach((account, i) => {
    for (let j = 1; j < account.length; j++) {
      const email = account[j]
      if (owner.has(email)) parent[find(i)] = find(owner.get(email)!)
      else owner.set(email, i)
    }
  })

  const groups = new Map<number, string[]>()
  for (const [email, i] of owner) {
    const root = find(i)
    if (!groups.has(root)) groups.set(root, [])
    groups.get(root)!.push(email)
  }

  const result: string[][] = []
  for (const [root, emails] of groups) result.push([accounts[root][0], ...emails.sort()])
  return result
}
