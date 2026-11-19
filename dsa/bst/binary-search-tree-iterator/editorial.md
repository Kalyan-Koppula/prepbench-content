**Key idea:** an iterative inorder traversal, paused between calls. Keep a stack holding the path of nodes whose values are still pending, with the smallest on top. `next()` pops it and pushes the leftmost path of its right subtree. `hasNext()` checks whether the stack is empty.

## Recognising the pattern

Ascending order on a BST is inorder, from the [Binary Search Trees](/problems/patterns/bst) sheet. The design question is about memory: storing all values is `O(n)`, while the explicit stack of the iterative traversal only ever holds one root-to-leaf path, `O(h)`.

## Simpler version (shown below as the alternative)

Traverse the whole tree in the constructor, store the values in an array, and walk an index through it. `next` and `hasNext` are `O(1)`, but memory is `O(n)` and the constructor does all the work up front.

## Optimal: controlled inorder with a stack

- **Constructor:** push the root and its chain of left children.
- **`next()`:** pop the top node. Its value is the next smallest. Push its right child and that child's chain of left children. Return the value.
- **`hasNext()`:** the stack is not empty.

**Why the top is always the next value.** The stack holds nodes whose left subtrees are fully returned and which haven't been returned themselves, in decreasing order from bottom to top. The top has the smallest such value, and after it comes its right subtree, starting from its leftmost node.

**Amortised `O(1)`.** A single `next` can push a long left chain, but every node is pushed once and popped once over the whole iteration, so `n` calls cost `O(n)` in total.

## Walkthrough

```
      7
     / \
    3   15
       /  \
      9    20
```

| call | stack before (top last) | pops | pushes | returns |
| --- | --- | --- | --- | --- |
| constructor | – | – | 7, 3 | |
| next | [7, 3] | 3 | – | 3 |
| next | [7] | 7 | 15, 9 | 7 |
| next | [15, 9] | 9 | – | 9 |
| hasNext | [15] | | | true |
| next | [15] | 15 | 20 | 15 |
| next | [20] | 20 | – | 20 |
| hasNext | [] | | | false |

## Complexity

- Flattened array: `O(1)` per call, `O(n)` memory, `O(n)` constructor.
- Stack: amortised `O(1)` per `next`, `O(1)` `hasNext`, `O(h)` memory.

## Edge cases

- Empty tree: the stack starts empty, so `hasNext` is `false`.
- Left-leaning chain: the constructor pushes everything; each `next` only pops.
- Right-leaning chain: the stack never holds more than one node.

## Common mistakes

- Pushing the right child but not its left chain.
- Storing values instead of nodes, which loses the right subtrees.
- Using a recursive generator, which hides the stack and is language-specific.

## In the interview

- Say it is the iterative inorder from Binary Tree Inorder Traversal, split across calls.
- Explain the amortised argument for `next`.
- Likely follow-ups:
  - *Descending iterator?* Push right chains instead of left chains.
  - *Two Sum IV with `O(h)` memory?* An ascending and a descending iterator as two pointers.
  - *`peek()`?* Return the top without popping.
