---
title: Lists, Queues and Deques
order: 3
summary: ArrayList growth and the real cost of remove, why LinkedList is almost never the answer, ArrayDeque as stack and queue, PriorityQueue semantics, Collections utilities and the subList view trap.
---

Linear collections look boring until the interviewer asks "what does `remove(0)` cost on an `ArrayList`?" or "why not `Stack`?". This sheet is the complexity table plus the handful of API behaviours that trip people coming from JS arrays.

## `ArrayList`

A growable `Object[]` with a `size` cursor, the closest thing to a JS array.

| Operation | Cost | Note |
|---|---|---|
| `get(i)`, `set(i, x)` | O(1) | Bounds-checked |
| `add(x)` | Amortised O(1) | Grows by 1.5x when full (`old + (old >> 1)`), copying the array |
| `add(i, x)`, `remove(i)` | O(n - i) | `System.arraycopy` shifts the tail |
| `remove(0)` in a loop | O(n²) total | The classic "queue made of ArrayList" bug; use `ArrayDeque` |
| `contains`, `indexOf`, `remove(Object)` | O(n) | Linear `equals` scan |
| Iteration | O(n), cache-friendly | Fastest of all lists |

```java
List<Integer> xs = new ArrayList<>(1_000);   // capacity hint, size stays 0
xs.remove(Integer.valueOf(7));               // remove the value 7
xs.remove(7);                                // remove index 7 (compile-time overload choice)
xs.trimToSize();                             // after a large shrink, if memory matters
```

Removing while iterating: use `removeIf`, `Iterator.remove`, or iterate backwards by index. A for-each loop will throw `ConcurrentModificationException`.

Unlike JS, there is no `xs[i]` syntax, no negative indices, no sparse holes, and `xs.add(10, v)` on a size-3 list throws `IndexOutOfBoundsException` rather than padding.

## `LinkedList`: why almost never

A doubly linked list that implements both `List` and `Deque`. On paper O(1) insert/remove at the ends and at an iterator position; in practice:

- Every element is a 24-byte node with three references, so it uses roughly 5x the memory of an `ArrayList` of references and scatters them across the heap.
- `get(i)` is O(n); the implementation walks from whichever end is closer.
- The O(1) middle insert only applies when you already hold an iterator at the spot. Reaching the spot cost O(n) anyway.
- As a queue or stack `ArrayDeque` is faster in every benchmark that matters.

The one honest use: you need a `List` *and* a `Deque` on the same object, or you need `ListIterator.add` while walking. Say that, then say you would still measure.

## `ArrayDeque` as stack and queue

A circular array that doubles when full. No capacity limit, no nulls allowed, not thread-safe.

```java
Deque<Integer> stack = new ArrayDeque<>();
stack.push(1); stack.push(2);     // addFirst
stack.peek();                     // 2 (peekFirst)
stack.pop();                      // 2 (removeFirst)

Deque<Integer> queue = new ArrayDeque<>();
queue.offer(1); queue.offer(2);   // addLast
queue.peek();                     // 1
queue.poll();                     // 1 (removeFirst)
```

Method pairs: `add`/`remove`/`element` throw on failure; `offer`/`poll`/`peek` return `false`/`null`. On an unbounded deque the only difference is empty-queue behaviour, so prefer the `offer`/`poll`/`peek` family and check for `null`.

Do not use `java.util.Stack`: it extends `Vector`, so every method is synchronised, and it exposes `get(i)` which lets callers break the LIFO contract. Interviewers hear "I'd use `Stack`" as "I learned Java from a 2005 textbook".

Sliding-window maximum, monotonic stacks, BFS queues and undo histories are all `ArrayDeque`.

## `PriorityQueue`

A binary min-heap in an array. `offer`/`poll` O(log n), `peek` O(1), `remove(Object)` and `contains` O(n).

```java
PriorityQueue<int[]> byDistance = new PriorityQueue<>(Comparator.comparingInt(a -> a[1]));
PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Comparator.reverseOrder());
PriorityQueue<Task> tasks = new PriorityQueue<>(
    Comparator.comparing(Task::priority).reversed().thenComparing(Task::createdAt));
```

Rules to state out loud:

- Only the head is ordered. Iterating or printing the queue shows heap array order, not sorted order. To get sorted output, `poll` repeatedly.
- No random access, no `get(i)`, no nulls.
- Elements must be `Comparable` or you must pass a `Comparator`; the first `offer` of a non-comparable element throws `ClassCastException`.
- Not thread-safe; `PriorityBlockingQueue` is the concurrent variant.
- Top-k pattern: keep a *min*-heap of size k for the k largest items, popping whenever the size exceeds k. O(n log k).
- Changing an element's priority after insertion does not reheapify. Remove and re-add, or use a lazy-deletion trick (push a new entry and skip stale ones on `poll`), which is what Dijkstra implementations do.

## `Collections` utilities you will actually call

```java
Collections.sort(list);                       // or list.sort(null); stable TimSort
Collections.sort(list, cmp);
Collections.reverse(list);                    // in place
Collections.shuffle(list);
Collections.swap(list, i, j);
Collections.frequency(list, x);
Collections.max(list, cmp); Collections.min(list);
Collections.nCopies(3, "x");                  // immutable ["x","x","x"]
Collections.emptyList(); Collections.singletonList(x);   // prefer List.of()
Collections.unmodifiableList(list);           // read-only view, not a copy
Collections.synchronizedList(list);           // every method locked on the wrapper; iterate under synchronized(list)
Collections.binarySearch(sortedList, key);    // index, or -(insertionPoint) - 1 when absent
```

`Arrays` has the array equivalents: `Arrays.sort` (dual-pivot quicksort for primitives, TimSort for objects), `Arrays.fill`, `Arrays.copyOfRange`, `Arrays.asList`, `Arrays.stream`, `Arrays.equals` and `Arrays.hashCode` (for using arrays as content-compared values; a raw array's own `equals` is identity).

## `subList` is a view

```java
List<Integer> xs = new ArrayList<>(List.of(1, 2, 3, 4, 5));
List<Integer> mid = xs.subList(1, 4);   // [2, 3, 4], backed by xs
mid.set(0, 20);                         // xs is now [1, 20, 3, 4, 5]
mid.clear();                            // xs is now [1, 5]  (the idiom for range removal)

xs.add(6);                              // structural change to the parent...
mid.size();                             // ...so the view throws ConcurrentModificationException
```

Need a real copy? `new ArrayList<>(xs.subList(1, 4))` or `List.copyOf(...)`. Same story for `Map.keySet()`, `entrySet()`, `values()`, `headMap`, `tailMap`: views, not snapshots, and removing through them removes from the backing collection.

## Picking the structure in a coding round

| Prompt smell | Structure |
|---|---|
| "most recent", "undo", matching brackets, monotonic | `ArrayDeque` as stack |
| BFS, level order, producer/consumer in one thread | `ArrayDeque` as queue |
| "k largest", "merge k sorted", "next cheapest", scheduling | `PriorityQueue` |
| Sliding window max/min | `ArrayDeque` holding indices, monotonic |
| Random access, append, sort | `ArrayList` |
| Both ends plus `List` API | `LinkedList`, rarely |

## Worked example: `ArrayList` growth, step by step

`ArrayList` stores elements in an array. When it's full, `add` allocates a bigger array (1.5 times the old capacity) and copies everything across:

| Adds so far | Capacity before | Action |
| --- | --- | --- |
| 0 | 0 (empty array) | First add allocates capacity 10 |
| 10 | 10 | 11th add grows to 15 and copies 10 elements |
| 15 | 15 | 16th add grows to 22, copies 15 |
| 22 | 22 | 23rd add grows to 33, copies 22 |

Each copy is `O(n)`, but because capacity grows geometrically, the total copying over `n` adds is `O(n)`, so `add` is **amortised** `O(1)`. If you know the final size, `new ArrayList<>(expectedSize)` avoids the copies entirely.

Inserting or removing in the **middle** shifts every later element: `O(n)`. Removing from the end is `O(1)`, which is why `ArrayList` works well as a stack too (though `ArrayDeque` is the idiomatic choice).

## Worked example: picking structures in a coding round

```java
// BFS on a grid: FIFO queue
Deque<int[]> queue = new ArrayDeque<>();
queue.offer(new int[] {0, 0});
while (!queue.isEmpty()) {
    int[] cell = queue.poll();
    // visit neighbours, queue.offer(...)
}

// Monotonic stack for "next greater element"
Deque<Integer> stack = new ArrayDeque<>(); // push/pop/peek at the head
int[] nextGreater = new int[nums.length];
Arrays.fill(nextGreater, -1);
for (int i = 0; i < nums.length; i++) {
    while (!stack.isEmpty() && nums[stack.peek()] < nums[i]) {
        nextGreater[stack.pop()] = nums[i];
    }
    stack.push(i);
}

// Top k largest: a min-heap of size k
PriorityQueue<Integer> heap = new PriorityQueue<>(); // natural order = min-heap
for (int x : nums) {
    heap.offer(x);
    if (heap.size() > k) heap.poll(); // drop the smallest
}

// Sliding window maximum: a deque of indices with decreasing values
Deque<Integer> window = new ArrayDeque<>();
```

`ArrayDeque` is faster than `Stack` (synchronised, extends `Vector`) and `LinkedList` (a node allocation per element and poor cache locality). It rejects `null`, which is rarely a problem and catches bugs.

## `PriorityQueue` details that trip people up

- It is a binary heap in an array: `offer` and `poll` are `O(log n)`, `peek` is `O(1)`, but `remove(Object)` and `contains` are `O(n)`.
- **Iteration order is not sorted.** Only `poll` returns elements in priority order. To print in order, poll into a list (destroying the queue) or sort a copy.
- For a max-heap, pass `Comparator.reverseOrder()`; for objects, `Comparator.comparingInt(Task::priority)`.
- Changing an element's priority while it's inside the queue corrupts the heap. Remove and re-add it, or add a new entry and skip stale ones when polled.

## Common interview questions

**How does `ArrayList` grow?** When `add` finds the backing array full it allocates a new array 1.5x the size and copies. Each element is copied O(1) times on average, so appends are amortised O(1). Pass an initial capacity if you know the final size.

**Why is `ArrayList.remove(0)` expensive?** Every remaining element shifts one slot left via `System.arraycopy`, O(n). A loop draining a list from the front is O(n²); use `ArrayDeque.poll` or iterate and clear instead.

**`ArrayList` vs `LinkedList`: when does `LinkedList` win?** Only when you insert or remove at an iterator position you already hold, or need both the `List` and `Deque` interfaces on one object. For everything else, including front removal, `ArrayList` or `ArrayDeque` is faster and smaller.

**Why not use `Stack` for a stack?** It extends `Vector`, so it is synchronised on every call and leaks indexed access. `Deque<T> s = new ArrayDeque<>()` with `push`/`pop`/`peek` is the recommended replacement per the `Stack` Javadoc itself.

**Can you iterate a `PriorityQueue` in sorted order?** No; iteration walks the underlying heap array. To consume in order call `poll` until empty, which is O(n log n). If you need both ordered iteration and fast min, use `TreeSet` or `TreeMap`.

**What is the difference between `offer` and `add` on a queue?** On a bounded queue `add` throws `IllegalStateException` when full while `offer` returns false. On unbounded `ArrayDeque`/`PriorityQueue` they behave identically; likewise `poll` returns null on empty where `remove` throws.

**What does `subList` return?** A live view of a range of the parent list. Writes through it modify the parent; structural changes to the parent invalidate it. `subList(a, b).clear()` is the standard way to delete a range.

**How do you keep the k largest elements of a stream of n?** A min-heap of capacity k: offer each element, and if the size exceeds k, poll the minimum. O(n log k) time and O(k) space, and the heap holds the answer at the end.

## Pitfalls

- Using `LinkedList` for random access (`get(i)` is `O(n)`).
- Using `Stack` or `Vector` in new code.
- Iterating a `PriorityQueue` and expecting sorted order.
- `list.remove(1)` on a `List<Integer>` removes the element at index 1, not the value 1; use `remove(Integer.valueOf(1))`.
- Modifying the backing list while holding a `subList` view.

## Key takeaways

- `ArrayList` is the default list: fast random access, amortised `O(1)` appends.
- `ArrayDeque` is the default stack and queue.
- `PriorityQueue` is a binary heap: `O(log n)` offer/poll, unsorted iteration.
- `LinkedList` rarely wins in practice because of allocation and cache misses.
- Know the views (`subList`, `Arrays.asList`) and their backing-data rules.
