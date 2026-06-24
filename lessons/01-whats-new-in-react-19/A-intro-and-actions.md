---
title: "Introduction & Actions"
description: "An overview of React 19 and its new Actions API — a powerful way to handle async state transitions directly inside forms."
keywords:
  - React 19
  - Actions
  - useActionState
  - useFormStatus
  - async transitions
---

# Introduction to React 19

Welcome to this course on **What's New in React 19**! React 19 is a major release that ships with years of learnings from the React team. It focuses on making common patterns — like data fetching, form submissions, and optimistic updates — much simpler and more declarative.

In this course we'll cover the three biggest pillars of React 19:

1. **Actions** — new async-first patterns for handling mutations and form state
2. **New Hooks** — `useOptimistic`, `use()`, `useFormStatus`, and more
3. **React Server Components & Compiler** — what the new compiler does and how RSCs work

---

## What Are Actions?

Before React 19, handling form submissions required a lot of boilerplate — managing `loading`, `error`, and `success` state manually, often scattered across multiple `useState` calls. React 19 introduces **Actions**: async functions you pass directly to transitions or form handlers.

The key insight: **async transitions are now first-class in React**.

```jsx
// Before React 19
function UpdateName() {
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async () => {
    setIsPending(true);
    const error = await updateName(name);
    setIsPending(false);
    if (error) {
      setError(error);
      return;
    }
    redirect("/path");
  };

  return (
    <div>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button onClick={handleSubmit} disabled={isPending}>Update</button>
      {error && <p>{error}</p>}
    </div>
  );
}
```

With React 19, you can hand all that over to `useActionState`:

```jsx
// React 19 with Actions
import { useActionState } from "react";

async function updateNameAction(prevState, formData) {
  const name = formData.get("name");
  const error = await updateName(name);
  if (error) return error;
  redirect("/path");
}

function UpdateName() {
  const [error, submitAction, isPending] = useActionState(updateNameAction, null);

  return (
    <form action={submitAction}>
      <input type="text" name="name" />
      <button type="submit" disabled={isPending}>Update</button>
      {error && <p>{error}</p>}
    </form>
  );
}
```

### The `useActionState` Hook

`useActionState` takes:
- An **action function** `(prevState, formData) => newState`
- An **initial state**

It returns:
- The **current state** (starts as the initial state, updates after each action call)
- A **wrapped action** to pass to your form or button
- An **`isPending`** boolean — automatically `true` while the action is running

This replaces three separate `useState` calls with one clean hook.

---

## `useFormStatus`

React 19 also ships `useFormStatus`, which lets any child component inside a `<form>` read that form's submission state — **without prop drilling**.

```jsx
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save"}
    </button>
  );
}

function MyForm() {
  return (
    <form action={myAction}>
      <input name="username" />
      <SubmitButton /> {/* reads the parent form's pending state automatically */}
    </form>
  );
}
```

`useFormStatus` can only be used inside a component that is a **child of a `<form>`**. It returns `{ pending, data, method, action }`.

---

## `<form action>` with Functions

One of the most elegant changes: you can now pass an **async function** directly as a form's `action` prop (not just a string URL). React will call your function with a `FormData` object when the form is submitted.

```jsx
async function search(formData) {
  const query = formData.get("query");
  await performSearch(query);
}

export default function SearchForm() {
  return (
    <form action={search}>
      <input name="query" placeholder="Search..." />
      <button type="submit">Go</button>
    </form>
  );
}
```

This makes React feel much more like a full-stack framework, especially when combined with Server Actions.

---

## Key Takeaways

- React 19 treats **async mutations as first-class** with the Actions API
- `useActionState` replaces `loading/error/success` state boilerplate
- `useFormStatus` lets child components read parent form state without prop drilling
- `<form action={fn}>` now accepts async functions, not just URL strings

In the **next lesson**, we'll dive into the new hooks: `useOptimistic` and `use()`.
