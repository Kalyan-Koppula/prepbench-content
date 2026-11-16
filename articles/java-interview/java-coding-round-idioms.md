---
title: Java Coding Round Idioms
order: 4
summary: "Coding live in Java when you think in JavaScript: fast setup, arrays and StringBuilder, Map patterns, Deque and PriorityQueue, comparators, records as tuples, streams vs loops, reading input, and the compile errors that bite under pressure."
---

If the coding round is in Java, the algorithm is the same as in your TypeScript practice; what costs time is the API surface. This is the subset you need, the way you would type it under a clock, with the places where Java silently differs from JS marked.

## Fast setup

```java
import java.util.*;
import java.util.stream.*;

public class Main {
  public static void main(String[] args) {
    System.out.println(Arrays.toString(twoSum(new int[]{2, 7, 11, 15}, 9)));
  }

  static int[] twoSum(int[] nums, int target) { ... }
}
```

- `java Main.java` compiles and runs a single file (Java 11+); no build tool needed. Java 21 has a preview of `void main()` with no class, but under interview conditions type the full signature so nothing depends on `--enable-preview`.
- `jshell` is a REPL for checking an API call (`jshell> "abc".repeat(2)`); keep one open in a second tab.
- `import java.util.*;` at the top; forgetting imports is the most common "it does not compile" moment.
- Helper methods are `static` when called from `main`. Mixing instance and static methods produces "non-static method cannot be referenced from a static context".
- Print debugging: `System.out.println(Arrays.toString(arr))` for arrays, `Arrays.deepToString` for 2D, collections print themselves.

## Arrays and strings

```java
int[] counts = new int[26];                   // zero-filled
int[][] grid = new int[rows][cols];
int[] copy = Arrays.copyOf(nums, nums.length);
Arrays.fill(dp, -1);
Arrays.sort(nums);                            // primitives: no comparator possible
int n = nums.length;                          // field, not method; String uses .length()

String s = "hello";
char c = s.charAt(i);                         // no s[i]
char[] chars = s.toCharArray();               // mutate here, then new String(chars)
int idx = c - 'a';                            // char arithmetic gives int
boolean same = a.equals(b);                   // never == for strings
s.substring(i, j);                            // half-open like slice
String.valueOf(123); Integer.parseInt("123"); // conversions
s.chars()                                     // IntStream of code units

StringBuilder sb = new StringBuilder();
sb.append(c).append(" ").append(42);
sb.insert(0, 'x'); sb.deleteCharAt(sb.length() - 1); sb.setLength(0); sb.reverse();
String out = sb.toString();
```

- Strings are immutable and `+=` in a loop is O(n²); use `StringBuilder`.
- `Character.isLetterOrDigit`, `Character.toLowerCase`, `Character.getNumericValue(c)` for digit chars.
- `String.join(",", list)`, `s.split("\\s+")` (regex, so escape dots and pipes), `s.repeat(k)`, `s.strip()`.
- There is no negative indexing and no `at(-1)`; `s.charAt(s.length() - 1)`.

## Map and Set patterns

```java
Map<Character, Integer> freq = new HashMap<>();
freq.merge(c, 1, Integer::sum);                             // count
freq.getOrDefault(c, 0);
Map<String, List<String>> groups = new HashMap<>();
groups.computeIfAbsent(key, k -> new ArrayList<>()).add(word);   // group by
for (Map.Entry<Character, Integer> e : freq.entrySet()) { e.getKey(); e.getValue(); }
for (var e : freq.entrySet()) {}                            // var works in for-each

Set<Integer> seen = new HashSet<>();
if (!seen.add(x)) { /* duplicate */ }                       // add returns false if present

TreeMap<Integer, String> tm = new TreeMap<>();
tm.floorKey(k); tm.ceilingKey(k); tm.firstEntry(); tm.pollLastEntry(); tm.headMap(k, true);
```

- Keys are compared with `equals`/`hashCode`, not identity, so `int[]` is a bad key (identity equality) and a record or a `List<Integer>` is a good one.
- `map.get(k)` returns `null` for a missing key; assigning it to an `int` throws `NullPointerException` on unboxing. Use `getOrDefault` or `containsKey`.
- `Map.of(...)`, `List.of(...)`, `Set.of(...)` are immutable and reject nulls; `Arrays.asList` is fixed-size. Use `new ArrayList<>(List.of(...))` when you need to mutate.
- `LinkedHashMap` keeps insertion order (JS `Map` behaviour); `HashMap` does not.
- `Integer` cache: `==` on boxed values is only safe for -128..127. Compare with `equals` or unbox.

## Deque and PriorityQueue

```java
Deque<Integer> stack = new ArrayDeque<>();
stack.push(1); stack.peek(); stack.pop(); stack.isEmpty();     // LIFO at the head

Deque<int[]> queue = new ArrayDeque<>();
queue.offer(new int[]{r, c}); queue.poll(); queue.peekFirst(); // FIFO

PriorityQueue<Integer> minHeap = new PriorityQueue<>();
PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Collections.reverseOrder());
PriorityQueue<int[]> byDist = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
PriorityQueue<Map.Entry<String, Integer>> topK = new PriorityQueue<>(Map.Entry.comparingByValue());
byDist.offer(new int[]{d, node}); byDist.poll(); byDist.peek(); byDist.size();
```

- Use `ArrayDeque`, not `Stack` (synchronised, legacy) and not `LinkedList` unless you need null elements, which `ArrayDeque` rejects.
- `PriorityQueue` is a binary heap: `offer`/`poll`/`peek` are O(log n)/O(log n)/O(1). Iterating it is not sorted order. No `decreaseKey`; push a new entry and skip stale ones on poll (lazy deletion), as in Dijkstra.
- `(a, b) -> a[0] - b[0]` overflows for large values; `Integer.compare` is the habit to build.

## Sorting with comparators

```java
Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));     // int[][] by start
Arrays.sort(words, Comparator.comparing(String::length).thenComparing(Comparator.naturalOrder()));
list.sort(Comparator.comparingInt(Point::x).thenComparingInt(Point::y).reversed());
Integer[] boxed = ...; Arrays.sort(boxed, Collections.reverseOrder());
Collections.sort(list); list.sort(null);                            // natural order
```

- `Arrays.sort(int[])` is dual-pivot quicksort (not stable, no comparator); `Arrays.sort(T[], cmp)` and `List.sort` are stable TimSort.
- To sort primitives descending, sort ascending and read backwards, or box them.
- `Comparator.comparing(Map.Entry::getValue)` for top-k by frequency; `.reversed()` after a `comparing` with a method reference sometimes needs explicit generics, so `Comparator.comparingInt((int[] a) -> a[0])` is the safe form.

## Records as tuples

```java
record Pair(int first, int second) {}                 // local record inside a method is fine
record State(int node, int dist) {}
Map<Pair, Integer> memo = new HashMap<>();            // value-based equals/hashCode for free
memo.put(new Pair(i, j), 1);
var p = new Pair(1, 2); p.first();                    // accessor, not getFirst()
```

Records give you an immutable, printable, hashable tuple in one line; the alternative for speed is `int[]`, which is fine for heap entries and queue items but useless as a map key. For memo keys of two ints, `i * cols + j` or `(long) i << 32 | j` into a `Map<Long, …>` avoids allocation if the interviewer asks about constants.

## Streams vs loops in interviews

Streams read well for transformations and the interviewer will recognise them:

```java
int sum = Arrays.stream(nums).sum();
List<Integer> boxed = Arrays.stream(nums).boxed().collect(Collectors.toList());
int[] back = list.stream().mapToInt(Integer::intValue).toArray();
IntStream.range(0, n).forEach(i -> ...);
Map<String, Long> counts = words.stream().collect(Collectors.groupingBy(w -> w, Collectors.counting()));
String joined = parts.stream().collect(Collectors.joining(","));
List<Integer> sorted = list.stream().sorted(Comparator.reverseOrder()).toList();   // Java 16+ toList()
```

Loops are the right call for anything with early exit, index arithmetic, two pointers, or mutation of outer state (lambdas need effectively final variables). If asked about performance, say streams add boxing and allocation overhead that matters in hot loops but not at interview scale, and that readability decides. Do not use `parallelStream()` in an interview.

## Reading input

If the problem gives stdin rather than a function signature:

```java
BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
int n = Integer.parseInt(in.readLine().trim());
StringTokenizer st = new StringTokenizer(in.readLine());
int[] a = new int[n];
for (int i = 0; i < n; i++) a[i] = Integer.parseInt(st.nextToken());
```

`Scanner` is simpler (`sc.nextInt()`, `sc.nextLine()`) and fine for small inputs; it is slow on 10^5 tokens, and mixing `nextInt` with `nextLine` eats the rest of the line. `readLine` throws a checked `IOException`, so declare `throws IOException` on `main`. Output many lines with a `StringBuilder` and one `print`, or a `PrintWriter`.

## Compile errors under pressure

| Error text | Cause | Fix |
|---|---|---|
| `incompatible types: possible lossy conversion from long to int` | `int x = someLong` or `nums.length * 1L` | cast, or make it `long` |
| `cannot find symbol` | missing import, typo, or `length()` on an array / `length` on a string | import `java.util.*`; arrays `.length`, strings `.length()`, lists `.size()` |
| `unreported exception IOException; must be caught or declared` | checked exception from `readLine`, `Thread.sleep` | `throws Exception` on the method |
| `local variables referenced from a lambda expression must be final or effectively final` | mutating a captured counter | use an array `int[] count = {0}`, a field, or a loop |
| `missing return statement` | a path without `return` after `if/else` | add the fallthrough return |
| `non-static method cannot be referenced from a static context` | calling an instance method from `main` | make the helper `static` |
| `unexpected type: required: reference, found: int` | `List<int>` or any generic with a primitive | `List<Integer>`, `Map<Character, Integer>` |
| `incompatible types: int cannot be converted to boolean` | `if (x = 5)` instead of `==` | `==` for primitives, `equals` for objects |
| `char cannot be dereferenced` | `c.equals(...)` on a `char` | compare with `==`, or box |
| `unchecked generic array creation` warning | `new List<Integer>[n]` | `List<List<Integer>> adj = new ArrayList<>()` and fill it |

Runtime traps: integer division truncates (`7 / 2 == 3`), `%` of a negative is negative, `Integer.MAX_VALUE + 1` wraps (use `long` for sums and products), `s.charAt(i) == "a"` compares a char to a String (compile error), `array[i]` out of bounds throws instead of returning `undefined`, and `/` by zero on ints throws while on doubles gives `Infinity`.

## Common interview questions

**Why use `StringBuilder` instead of string concatenation?**
Strings are immutable, so each `+=` allocates a new string and copies; a loop becomes O(n²). `StringBuilder` appends into a growable buffer, O(n) overall, and `toString` once at the end.

**`ArrayDeque` or `LinkedList` for a queue or stack?**
`ArrayDeque`: contiguous memory, no per-node allocation, faster in practice. `LinkedList` only when you need `null` elements or `ListIterator` removal in the middle.

**How do you write a max-heap?**
`new PriorityQueue<>(Collections.reverseOrder())` for naturals, or a comparator; for objects, `(a, b) -> Integer.compare(b.score, a.score)`. `PriorityQueue` has no decrease-key, so push duplicates and skip stale entries on poll.

**What can be a `HashMap` key?**
Anything with consistent `equals` and `hashCode`: `String`, boxed numbers, records, `List.of(...)`. Arrays use identity, so an `int[]` key never matches another array with the same contents.

**When do you prefer a loop over a stream?**
Early termination, index-based logic, two pointers, or updating state outside the loop. Streams suit map/filter/group pipelines where the shape is clear and the collector names the intent.

**Why `Integer.compare(a, b)` instead of `a - b` in a comparator?**
Subtraction overflows when the values are far apart (`Integer.MIN_VALUE - 1`), giving a wrong sign and a broken sort. `Integer.compare` is overflow-safe and reads as intent.

**What does `var` do and when do you use it?**
Local type inference since Java 10; the variable still has a fixed static type. Use it for obvious right-hand sides (`var map = new HashMap<String, Integer>()`) and skip it where the type is the documentation.

## Pitfalls

- `list.remove(int index)` versus `list.remove(Object o)` on a `List<Integer>`: `remove(1)` removes index 1, `remove(Integer.valueOf(1))` removes the value.
- `Arrays.asList(1, 2, 3)` on primitives: `Arrays.asList(new int[]{1,2})` is a `List<int[]>` with one element.
- `for (int i = 0; i < s.length(); i++)` recomputes nothing expensive, but `s.substring` in the loop allocates each time.
- Forgetting that `HashMap` iteration order is not insertion order when the problem says "in the order they appear".
- Modifying a collection while iterating it (`ConcurrentModificationException`); use `removeIf` or an iterator.
