**Key idea:** the pixels to repaint are exactly the connected region of the starting colour that contains the start pixel. Walk that region with DFS or BFS, painting each pixel as you reach it. Painting also marks it as visited, because a repainted pixel no longer has the start colour.

## Recognising the pattern

A grid where neighbouring cells with the same property form regions is an implicit graph: cells are nodes, edges join up/down/left/right neighbours. "Change the whole region" is a connected-component traversal from the [Graphs](/problems/patterns/graphs) sheet, the simplest one there is.

## Alternative: recursive DFS (shown below)

`paint(r, c)`: if the cell is outside the grid or not the start colour, return; otherwise repaint it and call `paint` on the four neighbours. That is the reference brute force below. Same `O(m · n)`, but the recursion can be as deep as the region, which in some languages overflows the call stack on large images.

## Iterative DFS

1. Remember `start = image[sr][sc]`. If it already equals `color`, return the image unchanged.
2. Paint the start pixel and push it on a stack.
3. While the stack isn't empty: pop a cell and, for each of its four neighbours inside the grid with colour `start`, paint it and push it.
4. Return the image.

**Why the early return.** If `start == color`, painted pixels still look like "start colour", so the search would keep finding them forever. Nothing would change anyway.

**Paint on push, not on pop.** Painting when a pixel is pushed guarantees it is pushed only once, even if several neighbours discover it.

## Walkthrough

```
1 1 1        2 2 2
1 1 0   →    2 2 0
1 0 1        2 0 1
```

Start `(1, 1)`, `color = 2`. The start colour is 1. The region of 1s connected to the centre is the top-left block; the bottom-right `1` is cut off by zeros, so it stays.

## Complexity

- Time `O(m · n)`: each pixel is pushed and painted at most once, and each looks at four neighbours.
- Space `O(m · n)` for the stack in the worst case (a fully same-coloured image).

## Edge cases

- `color` equal to the start colour: return immediately.
- A single pixel: just repaint it.
- The whole image one colour: everything is repainted.

## Common mistakes

- Missing the early return, causing an infinite loop.
- Comparing neighbours with `color` instead of the original start colour.
- Checking bounds after indexing into the image.

## In the interview

- Say "connected component on a grid", and mention the stack-depth risk of recursion.
- Likely follow-ups:
  - *Diagonal connectivity?* Eight directions.
  - *Count the regions?* Run the fill from every unvisited cell (Number of Islands).
  - *Fill everything enclosed by a border?* Flood from the border instead (Surrounded Regions).
