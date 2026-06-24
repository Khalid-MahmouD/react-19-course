---
title: "New Hooks: useOptimistic & use()"
description: "Deep dive into React 19's new hooks — useOptimistic for instant UI feedback and the new use() hook for consuming promises and context."
keywords:
  - React 19
  - useOptimistic
  - use hook
  - optimistic updates
  - React hooks
---

# New Hooks in React 19

React 19 introduces two powerful new hooks that solve long-standing pain points in React development: `useOptimistic` and `use()`.

---

## `useOptimistic`

### The Problem

When a user submits a form or clicks a button, they usually have to **wait** for the server to respond before seeing any change in the UI. This creates a sluggish experience. The pattern of showing the expected result immediately while waiting for confirmation is called an **optimistic update** — and it used to require a lot of manual wiring.

### The Solution

`useOptimistic` makes this pattern trivial:

```jsx
import { useOptimistic, useActionState } from "react";

async function sendMessageAction(prevMessages, formData) {
  const message = formData.get("message");
  // Sends to the server
  const newMessage = await sendToServer(message);
  return [...prevMessages, newMessage];
}

function MessageList({ messages }) {
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (currentMessages, newMessage) => [
      ...currentMessages,
      { text: newMessage, sending: true },
    ]
  );

  const [_, submitAction, isPending] = useActionState(
    async (prevState, formData) => {
      const message = formData.get("message");
      addOptimisticMessage(message); // Immediately shows in UI
      await sendToServer(message);   // Actually saves it
    },
    null
  );

  return (
    <>
      <ul>
        {optimisticMessages.map((msg, i) => (
          <li key={i}>
            {msg.text}
            {msg.sending && <small> (Sending...)</small>}
          </li>
        ))}
      </ul>
      <form action={submitAction}>
        <input name="message" />
        <button type="submit" disabled={isPending}>Send</button>
      </form>
    </>
  );
}
```

### How `useOptimistic` Works

```jsx
const [optimisticState, addOptimistic] = useOptimistic(
  actualState,
  (currentState, optimisticValue) => mergedState
);
```

- `actualState` — your real data (e.g. from the server)
- The second argument is a **reducer**: given the current state and the optimistic value you pass to `addOptimistic`, it returns a new state to show
- While an async transition is pending, `optimisticState` shows your merged result
- Once the real data arrives, React automatically reverts to `actualState`

This gives users **instant feedback** while keeping your actual data consistent.

---

## The `use()` Hook

`use()` is one of the most unique additions to React 19. Unlike other hooks, it can be called **conditionally** and works inside both client and server components.

### Using `use()` with Promises

```jsx
import { use, Suspense } from "react";

// Component receives a Promise directly as a prop
function UserProfile({ userPromise }) {
  const user = use(userPromise); // Suspends until the promise resolves
  return <h1>Hello, {user.name}!</h1>;
}

// Parent component creates the promise and passes it down
function App() {
  const userPromise = fetch("/api/user").then((r) => r.json());

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <UserProfile userPromise={userPromise} />
    </Suspense>
  );
}
```

The key behaviour: when `use(promise)` is called and the promise hasn't resolved yet, the component **suspends** — React renders the nearest `<Suspense>` fallback instead. Once the promise resolves, React re-renders with the real value.

> **Important:** Unlike regular hooks, `use()` can be called inside conditionals and loops — it's not bound by the Rules of Hooks in the same way.

### Conditional Use

```jsx
function Component({ shouldFetch }) {
  let user = null;

  if (shouldFetch) {
    user = use(fetchUser()); // This is valid in React 19!
  }

  return <div>{user?.name ?? "No user"}</div>;
}
```

### Using `use()` with Context

`use()` also works as an alternative to `useContext()` — with the added bonus that it **can** be called conditionally:

```jsx
import { use, createContext } from "react";

const ThemeContext = createContext("light");

function ThemedButton({ showTheme }) {
  // Can be inside a conditional!
  if (!showTheme) return <button>Click me</button>;

  const theme = use(ThemeContext); // Replaces useContext(ThemeContext)
  return <button className={theme}>Click me</button>;
}
```

---

## Comparing `useContext` vs `use(Context)`

| Feature | `useContext` | `use(Context)` |
|---|---|---|
| Can be conditional | ❌ No | ✅ Yes |
| Works in server components | ❌ No | ✅ Yes |
| Works with Promises | ❌ No | ✅ Yes |
| General recommendation | Familiar, still valid | More flexible |

---

## Real-World Pattern: Data Loading with `use()`

A powerful pattern is to **start fetching early** (in the parent) and pass the promise down:

```jsx
// Parent starts the fetch immediately — no waterfall!
function PostPage({ postId }) {
  const postPromise = getPost(postId); // fires immediately
  const commentsPromise = getComments(postId); // fires immediately

  return (
    <Suspense fallback={<Skeleton />}>
      <Post postPromise={postPromise} commentsPromise={commentsPromise} />
    </Suspense>
  );
}

// Child consumes both promises
function Post({ postPromise, commentsPromise }) {
  const post = use(postPromise);
  const comments = use(commentsPromise);

  return (
    <article>
      <h1>{post.title}</h1>
      <Comments data={comments} />
    </article>
  );
}
```

This avoids **request waterfalls** — both fetches start at the same time instead of sequentially.

---

## Key Takeaways

- `useOptimistic` gives users **instant UI feedback** while async work completes in the background
- `use()` lets you **unwrap promises** directly in render with Suspense as the loading state
- `use(Context)` is a more flexible alternative to `useContext` — it works conditionally
- Promises should be **created outside the component** (or in a parent) to avoid re-creating them on every render

In the **final lesson**, we'll cover the React Compiler and React Server Components (RSC).
