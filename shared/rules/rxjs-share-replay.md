---
title: Share Observables to Avoid Duplicate Requests
impact: HIGH
impactDescription: Eliminates redundant HTTP calls
tags: rxjs, shareReplay, caching
---

## Share Observables to Avoid Duplicate Requests

When multiple subscribers consume the same observable, each subscription triggers a new execution. Use `shareReplay` to share results among subscribers.

**Incorrect (Each async pipe triggers separate request):**

```typescript
@Component({
  template: `
    <!-- 3 async pipes = 3 HTTP requests! -->
    <h1>{{ (user$ | async)?.name }}</h1>
    <p>{{ (user$ | async)?.email }}</p>
    <img [src]="(user$ | async)?.avatar" />
  `
})
export class UserProfileComponent {
  user$ = this.http.get<User>('/api/user');
}
```

**Correct (Share observable among subscribers):**

```typescript
@Component({
  template: `
    @if (user$ | async; as user) {
      <h1>{{ user.name }}</h1>
      <p>{{ user.email }}</p>
      <img [src]="user.avatar" />
    }
  `
})
export class UserProfileComponent {
  user$ = this.http.get<User>('/api/user').pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );
}
```

**Why it matters:**
- `bufferSize: 1` caches the latest value
- `refCount: true` unsubscribes when no subscribers remain
- Single HTTP request shared among all async pipes
- Alternative: use `@if (obs | async; as value)` pattern

Reference: [RxJS shareReplay](https://rxjs.dev/api/operators/shareReplay)
