---
title: Use the A/HC/LC Pattern and Correct Action Verbs for Functions
impact: HIGH
impactDescription: Consistent function naming makes APIs predictable and self-documenting
tags: naming, pattern, functions, actions, get, set, fetch, remove, delete, handle, compose
---

## Use the A/HC/LC Pattern and Correct Action Verbs for Functions

Name functions following the pattern `Action (A) + High Context (HC) + Low Context? (LC)`. The action verb is the most important part — it describes what the function _does_. Use the correct verb for the correct operation: `get` for synchronous access, `fetch` for async requests, `remove` for collection operations, `delete` for permanent erasure.

**Incorrect (Wrong or missing action verbs):**

```typescript
// ❌ No action verb — what does this do?
function userData(id: string): IUser { /* ... */ }
function posts(): Observable<IPost[]> { /* ... */ }

// ❌ Wrong action verb
function getPostsFromApi(): Observable<IPost[]> { /* ... */ }  // ❌ "get" implies sync, this is async
function deleteTodoFromList(id: string, list: ITodo[]): ITodo[] {  // ❌ "delete" implies permanent erasure
  return list.filter(item => item.id !== id);                       //    but this just filters a collection
}
function handleGetUser(id: string): IUser { /* ... */ }          // ❌ "handle" is for event callbacks, not data access
```

**Correct (A/HC/LC pattern with proper verbs):**

```typescript
// ✅ Action + High Context + Low Context
function getPost(id: string): IPost { /* ... */ }
function getPostData(id: string): IPostData { /* ... */ }
function handleClickOutside(event: MouseEvent): void { /* ... */ }
```

**The pattern explained:**

```
Action (A) + High Context (HC) + Low Context? (LC)
```

| Name | Action (A) | High Context (HC) | Low Context (LC) |
|------|------------|-------------------|------------------|
| `getPost` | `get` | `Post` | — |
| `getPostData` | `get` | `Post` | `Data` |
| `handleClickOutside` | `handle` | `Click` | `Outside` |
| `fetchUserProfile` | `fetch` | `User` | `Profile` |
| `removeFilter` | `remove` | `Filter` | — |
| `deletePost` | `delete` | `Post` | — |
| `composePageUrl` | `compose` | `Page` | `Url` |

---

### Action verb reference

**`get` — Synchronous data access**

Accesses data immediately. Use for internal getters and synchronous lookups.

```typescript
// ✅ Synchronous — returns immediately
function getFruitsCount(): number {
  return this.fruits.length;
}
```

**`set` — Assign a value**

Declaratively sets a variable with value A to value B.

```typescript
// ✅ Sets a value
function setFruits(nextFruits: number): void {
  this.fruits = nextFruits;
}

setFruits(5);
```

**`reset` — Restore initial state**

Sets a variable back to its initial value or state.

```typescript
// ✅ Restores initial state
const initialFruits: number = 5;

function resetFruits(): void {
  this.fruits = initialFruits;
}
```

**`fetch` — Asynchronous data request**

Requests data that takes time (i.e., async/network request). Use instead of `get` for any I/O operation.

```typescript
// ✅ Async — returns Observable or Promise
function fetchPosts(postCount: number): Observable<IPost[]> {
  return this.http.get<IPost[]>('/api/posts', { params: { count: postCount } });
}
```

**`remove` — Remove from a collection**

Removes something _from_ somewhere without destroying it. Use for filtering or detaching.

```typescript
// ✅ Removes from a collection — the item still exists elsewhere
function removeFilter(filterName: string, filters: string[]): string[] {
  return filters.filter(name => name !== filterName);
}

const selectedFilters: string[] = ['price', 'availability', 'size'];
removeFilter('price', selectedFilters);
```

**`delete` — Permanent erasure**

Completely erases something. Use for database operations and permanent destruction.

```typescript
// ✅ Permanently deletes — the item is gone
function deletePost(id: number): Observable<boolean> {
  return this.http.delete<boolean>(`/api/posts/${id}`);
}
```

**`compose` — Create from existing data**

Creates new data by combining or transforming existing data.

```typescript
// ✅ Composes a new value from inputs
function composePageUrl(pageName: string, pageId: number): string {
  return `${pageName.toLowerCase()}-${pageId}`;
}
```

**`handle` — Event callback**

Handles an action. Use when naming callback methods for events.

```typescript
// ✅ Handles an event
function handleLinkClick(): void {
  console.log('Clicked a link!');
}

link.addEventListener('click', handleLinkClick);
```

---

**Action verb cheat sheet:**

| Verb | When to Use | Sync/Async | Example |
|------|------------|------------|---------|
| `get` | Access internal data | Sync | `getFruitsCount()` |
| `set` | Assign a value | Sync | `setFruits(5)` |
| `reset` | Restore to initial | Sync | `resetFruits()` |
| `fetch` | Request from API/DB | Async | `fetchPosts()` |
| `remove` | Detach from collection | Sync | `removeFilter()` |
| `delete` | Permanent erasure | Async | `deletePost()` |
| `compose` | Create from existing | Sync | `composePageUrl()` |
| `handle` | Event callback | Sync | `handleLinkClick()` |

**Why it matters:**
- The action verb tells you _what_ the function does before reading the body
- `get` vs `fetch` signals sync vs async — critical for understanding data flow
- `remove` vs `delete` signals temporary vs permanent — prevents accidental data loss
- A/HC/LC produces predictable names: developers can guess function names without searching
- Consistent verbs make API surfaces predictable across the entire codebase

Reference: [Angular Style Guide](https://angular.dev/style-guide)
