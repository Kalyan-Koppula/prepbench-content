function accountsMerge(accounts: string[][]): string[][] {
  let people = accounts.map((a) => ({ name: a[0], emails: new Set(a.slice(1)) }))
  // Keep merging any two overlapping groups until none overlap.
  let merged = true
  while (merged) {
    merged = false
    outer: for (let i = 0; i < people.length; i++)
      for (let j = i + 1; j < people.length; j++) {
        if (![...people[j].emails].some((e) => people[i].emails.has(e))) continue
        for (const e of people[j].emails) people[i].emails.add(e)
        people = people.filter((_, k) => k !== j)
        merged = true
        break outer
      }
  }
  return people.map((p) => [p.name, ...[...p.emails].sort()])
}
