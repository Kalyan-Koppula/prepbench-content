# PrepBench content

The problems, frontend questions, articles, decks and plans behind [PrepBench](https://prepbench.testkalyan007.workers.dev).

- Edit through the PrepBench admin editor: it opens a pull request that merges itself once **Check content** passes, then the site redeploys.
- Format: see `docs/content-guide.md` in the app repo. Every DSA problem's `solution.ts` must pass its `tests.json`; the check runs them all.
- The app repo includes this repo as a submodule at `content/` and always builds the latest `main`.
