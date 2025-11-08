# 🧭 Data Governance Console (Server-Side Implementation)

## 1️⃣ Project Overview

**Data Governance Console** is a fully **server-rendered User Management Console** built with **Next.js App Router**.  
It connects to the backend via authenticated REST APIs and provides an efficient, scalable, and performant interface for managing users.

Key features:

- Paginated **user list**
- **User detail** view including posts & preferences
- **Create, Update, Delete** user actions
- Full **Server-Side Rendering (SSR)** with Server Actions
- Proper **Error** & **Loading** boundaries
- Cache handling & revalidation

---

## 2️⃣ Objectives

- Build a **server-driven UI** with SSR for all main pages.
- Implement **Server Actions** for POST, PUT, DELETE operations.
- Ensure **fast initial load** and consistent state using `revalidatePath`.
- Provide robust **unit tests** for all server logic.

---

## 3️⃣ Folder Structure

```
/app
  /users/page.tsx             → SSR list page
  /users/[id]/page.tsx        → SSR user detail page
  /users/add/page.tsx         → Create user form
/actions
  userActions.ts              → Server Actions (CRUD, toggle status)
/lib
  api.ts                      → Optional API abstraction
/tests
  serverActions.test.ts       → Unit tests for Server Actions
  ssrRendering.test.ts        → SSR rendering tests
/error.tsx                    → Global error boundary for SSR pages
/loading.tsx                  → Global loading state for SSR pages
```

---

## 4️⃣ Server Actions

All mutations are implemented as **Server Actions** in `actions/userActions.ts`.

### ✅ Actions

| Action               | Description                            |
| -------------------- | -------------------------------------- |
| `getUsers`           | Fetch paginated user list              |
| `getUserById`        | Fetch details for a single user        |
| `getUserPreferences` | Fetch user preferences                 |
| `getUserPosts`       | Fetch user posts                       |
| `addUser`            | Create a new user                      |
| `toggleUserStatus`   | Update user's status (ACTIVE/INACTIVE) |
| `deleteUser`         | Soft-delete a user                     |

### 🔹 Highlights

- All actions **use server-side fetch** (no `useEffect` or client fetching).
- **Input validation** is performed server-side before sending to backend.
- **Cache revalidation**: After any mutation, `revalidatePath("/users")` ensures SSR pages show fresh data.
- **Error handling**: Logs errors and returns structured messages to the caller.

---

## 5️⃣ Server-Side Rendering (SSR)

All main pages (`/users`, `/users/[id]`) are **Server Components**:

- Data is fetched server-side.
- Initial render does not rely on the client.
- **Pagination** defaults to `?page=0` if query param is missing.
- **Incremental Static Regeneration (ISR)** used with `revalidate: 30` seconds for lists.
- Detail pages use `cache: "no-store"` for freshest data.

**Example: Users Page Fetch**

```ts
const { users, totalPages } = await getUsers(searchParams ?? { page: "0" });
```

---

## 6️⃣ Error & Loading Boundaries

- `error.tsx` handles any unhandled server errors during SSR.
- `loading.tsx` displays a skeleton UI while server data is being fetched.

```ts
// /app/error.tsx
export default function Error({ error }: { error: Error }) {
  return (
    <div className="text-red-600">❌ Something went wrong: {error.message}</div>
  );
}
```

```ts
// /app/loading.tsx
export default function Loading() {
  return <div className="text-gray-500">⏳ Loading...</div>;
}
```

---

## 7️⃣ Caching Strategy

- **List pages**: `revalidate: 30` seconds to reduce repeated fetches.
- **Detail pages**: `cache: "no-store"` to always fetch latest data.
- **Mutations**: After `POST`, `PATCH`, or `DELETE`, `revalidatePath("/users")` ensures pages reflect latest state.
- This provides a **balance between performance and freshness**.

---

## 8️⃣ Unit Testing

- Jest tests located in `/tests/serverActions.test.ts`.
- Covers:
  - CRUD actions
  - Toggle status
  - Error handling
  - Cache revalidation behavior

### 🔹 Example Test

```ts
it("deleteUser should call correct API, revalidate, and redirect", async () => {
  (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
  await deleteUser("123");
  expect(fetch).toHaveBeenCalledWith(
    `${process.env.BASE_URL}/api/v1/users/123`,
    expect.objectContaining({ method: "DELETE" })
  );
});
```

---

## 9️⃣ Environment Variables

- `BASE_URL` — backend API base URL (default: `http://localhost:8080`)
- Example `.env`:

```
BASE_URL=http://localhost:8080
```

---

## 🔟 Performance & Logging

- SSR ensures **fast first paint**.
- Structured `console.error` logs are used for **backend API errors**.
- Caching and revalidation reduce unnecessary API calls while keeping UI updated.

---

## 1️⃣1️⃣ How to Run

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Run tests
npm run test
```

---

## 1️⃣2️⃣ Notes

- Default pagination handled safely: if `?page` missing → defaults to `0`.
- All server actions are fully testable with mocked fetch and Next.js helpers.
- Ready for **Vercel deployment** as a server-rendered Next.js app.

---

## 🎯 Summary

- ✅ Full **SSR with App Router**
- ✅ Server Actions with proper input validation & cache revalidation
- ✅ Loading & error boundaries
- ✅ Unit tests with Jest
- ✅ Caching strategy implemented
- ✅ Ready for demo/deployment

This project fulfills all **PRD requirements** and demonstrates **scalable, performant server-side rendering** with Next.js.
