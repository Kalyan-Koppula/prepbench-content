function accountsMerge(accounts: string[][]): string[][] {
  // Keep merging any two groups that share an email until none do. O(n^2 * e) per pass.
  const names: string[] = []
  const groups: string[][] = []
  for (let i = 0; i < accounts.length; i++) {
    names.push(accounts[i][0])
    const emails: string[] = []
    for (let j = 1; j < accounts[i].length; j++) {
      if (emails.indexOf(accounts[i][j]) === -1) {
        emails.push(accounts[i][j])
      }
    }
    groups.push(emails)
  }
  let merged = true
  while (merged) {
    merged = false
    for (let i = 0; i < groups.length && !merged; i++) {
      for (let j = i + 1; j < groups.length && !merged; j++) {
        let shared = false
        for (let k = 0; k < groups[j].length; k++) {
          if (groups[i].indexOf(groups[j][k]) !== -1) {
            shared = true
            break
          }
        }
        if (!shared) {
          continue
        }
        for (let k = 0; k < groups[j].length; k++) {
          if (groups[i].indexOf(groups[j][k]) === -1) {
            groups[i].push(groups[j][k])
          }
        }
        groups.splice(j, 1)
        names.splice(j, 1)
        merged = true
      }
    }
  }
  const result: string[][] = []
  for (let i = 0; i < groups.length; i++) {
    groups[i].sort()
    const entry: string[] = [names[i]]
    for (let k = 0; k < groups[i].length; k++) {
      entry.push(groups[i][k])
    }
    result.push(entry)
  }
  return result
}
