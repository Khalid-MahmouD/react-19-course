---
title: "React Compiler, Server Components & More"
description: "Learn about the React Compiler that eliminates manual memoization, how React Server Components work in React 19, and other quality-of-life improvements."
keywords:
  - React 19
  - React Compiler
  - React Server Components
  - RSC
  - ref as prop
  - Document Metadata
---

# React Compiler, Server Components & More

In this final lesson we cover the changes that affect how you **structure and ship** React apps — the React Compiler, React Server Components (RSC), and a handful of quality-of-life improvements to the everyday API.

---

## The React Compiler

### The Problem with Manual Memoization

One of the most common React performance pitfalls is unnecessary re-renders. The traditional solution has been to wrap things in `useMemo`, `useCallback`, and `React.memo`. This works, but adds noise to your code and is easy to get wrong.

```jsx
// Before React Compiler — manual memoization everywhere
function ExpensiveList({ items, onSelect }) {
  const sorted = useMemo(() => [...items].sort(), [items]);
  const handleClick = useCallback((id) => onSelect(id), [onSelect]);

  return sorted.map((item) => (
    <MemoizedItem key={item.id} item={item} onClick={handleClick} />
  ));
}

const MemoizedItem = React.memo(function Item({ item, onClick }) {
  return <div onClick={() => onClick(item.id)}>{item.name}</div>;
});
```

### With the React Compiler

The React Compiler (previously called "React Forget") **automatically memoizes** your components and values at the compiler level. You write natural React code and the compiler handles the optimization:

```jsx
// After React Compiler — clean, natural code
function ExpensiveList({ items, onSelect }) {
  const sorted = [...items].sort(); // Compiler memoizes this automatically

  return sorted.map((item) => (
    <Item key={item.id} item={item} onClick={() => onSelect(item.id)} />
  ));
}

function Item({ item, onClick }) {
  return <div onClick={onClick}>{item.name}</div>;
}
```

The output is the same — zero unnecessary re-renders — but you didn't have to write a single `useMemo` or `useCallback`.

### How to Enable It

The React Compiler is available as a Babel/SWC plugin:

```bash
npm install babel-plugin-react-compiler
```

```js
// babel.config.js
module.exports = {
  plugins: ["babel-plugin-react-compiler"],
};
```

You can also run it in **strict mode** (opt-in per file) or use `react-compiler-healthcheck` to see how many components in your codebase are compatible before enabling it globally.

> The compiler works by analysing your code statically. It **requires** you to follow the Rules of React (no mutations of props/state, pure render functions). If you do, it just works.

---

## React Server Components (RSC)

React Server Components let you render components **on the server only** — they never ship JavaScript to the client. This is different from SSR (Server-Side Rendering), where components run on both server and client.

### The Mental Model

```
┌─────────────────────────────────────────┐
│           Server Components             │
│  - Can access databases directly        │
│  - Can read from the filesystem         │
│  - Zero client JavaScript bundle cost   │
│  - Cannot use useState / useEffect      │
│  - Cannot use event handlers            │
└────────────────┬────────────────────────┘
                 │ renders
                 ▼
┌─────────────────────────────────────────┐
│           Client Components             │
│  - Run in the browser                   │
│  - Can use all hooks                    │
│  - Can handle user interactions         │
│  - Marked with "use client" directive   │
└─────────────────────────────────────────┘
```

### A Server Component Example

```jsx
// app/posts/page.jsx — This is a Server Component by default in Next.js App Router
import db from "@/lib/db";

export default async function PostsPage() {
  // Direct DB access — no API layer needed!
  const posts = await db.posts.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <main>
      <h1>Blog Posts</h1>
      {posts.map((post) => (
        // PostCard is a client component — it has a Like button
        <PostCard key={post.id} post={post} />
      ))}
    </main>
  );
}
```

```jsx
// components/PostCard.jsx
"use client"; // This marks it as a Client Component

import { useState } from "react";

export function PostCard({ post }) {
  const [liked, setLiked] = useState(false);

  return (
    <article>
      <h2>{post.title}</h2>
      <p>{post.excerpt}</p>
      <button onClick={() => setLiked(!liked)}>
        {liked ? "❤️ Liked" : "🤍 Like"}
      </button>
    </article>
  );
}
```

### Server Actions

Server Actions are **async functions that run on the server** but can be called from client components — the bridge between the two worlds:

```jsx
// actions.js
"use server"; // Everything in this file runs on the server

export async function likePost(postId) {
  await db.posts.update({ where: { id: postId }, data: { likes: { increment: 1 } } });
  revalidatePath("/posts");
}
```

```jsx
// components/LikeButton.jsx
"use client";
import { likePost } from "@/actions";

export function LikeButton({ postId }) {
  return (
    <form action={likePost.bind(null, postId)}>
      <button type="submit">Like</button>
    </form>
  );
}
```

---

## Other Quality-of-Life Improvements

### `ref` as a Prop (No More `forwardRef`)

In React 19, you no longer need `forwardRef`. Just pass `ref` like any other prop:

```jsx
// Before — required forwardRef wrapper
const Input = forwardRef(function Input({ placeholder }, ref) {
  return <input ref={ref} placeholder={placeholder} />;
});

// React 19 — ref is just a prop
function Input({ placeholder, ref }) {
  return <input ref={ref} placeholder={placeholder} />;
}
```

### Document Metadata in Components

You can now render `<title>`, `<meta>`, and `<link>` tags directly inside components. React will automatically hoist them to `<head>`:

```jsx
function BlogPost({ post }) {
  return (
    <article>
      {/* React 19 hoists these to <head> automatically */}
      <title>{post.title}</title>
      <meta name="description" content={post.excerpt} />
      <link rel="canonical" href={`https://example.com/posts/${post.slug}`} />

      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
```

No more `react-helmet` or `next/head` needed for basic metadata!

### Improved Error Reporting

React 19 improves error messages in development — you'll now see **hydration diff errors** that clearly show what the server rendered vs what the client expected:

```
Hydration failed because the server rendered HTML didn't match the client.

Server: <div class="dark">
Client: <div class="light">

  in ThemeWrapper
  in App
```

### `<Context>` Instead of `<Context.Provider>`

A small but welcome cleanup — you can now use `<Context>` directly instead of `<Context.Provider>`:

```jsx
const ThemeContext = createContext("light");

// Before
function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Page />
    </ThemeContext.Provider>
  );
}

// React 19
function App() {
  return (
    <ThemeContext value="dark">
      <Page />
    </ThemeContext>
  );
}
```

---

## Course Summary

Here's everything new in React 19 at a glance:

| Feature | What It Does |
|---|---|
| `useActionState` | Manages async mutation state (loading, error, result) |
| `useFormStatus` | Reads parent form's pending state from any child |
| `<form action={fn}>` | Accepts async functions, not just URL strings |
| `useOptimistic` | Shows optimistic UI while async work runs |
| `use(promise)` | Unwraps promises in render, suspends automatically |
| `use(Context)` | Conditional-safe alternative to `useContext` |
| React Compiler | Auto-memoizes components — no more `useMemo` clutter |
| Server Components | Server-only rendering, zero JS bundle cost |
| Server Actions | Server functions callable from client components |
| `ref` as prop | No more `forwardRef` boilerplate |
| `<title>/<meta>` in components | Auto-hoisted to `<head>` |
| `<Context value>` | Shorter context provider syntax |

React 19 is a landmark release. It doesn't reinvent React — it removes all the friction that built up over the years and makes the happy path the obvious path. Happy coding! 🚀
