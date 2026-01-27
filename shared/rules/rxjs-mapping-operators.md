---
title: Use Correct RxJS Mapping Operators
impact: HIGH
impactDescription: Wrong operator causes race conditions, memory leaks, or dropped requests
tags: rxjs, operators, switchMap, exhaustMap, concatMap, mergeMap
---

## Use Correct RxJS Mapping Operators

Choosing the wrong higher-order mapping operator (switchMap, exhaustMap, concatMap, mergeMap) causes race conditions, duplicate requests, or lost data. Each has a specific use case.

**Quick Reference:**

| Operator | Behavior | Use When |
|----------|----------|----------|
| `switchMap` | Cancels previous, uses latest | Search, typeahead, GET requests |
| `exhaustMap` | Ignores new until current completes | Form submit, prevent double-click |
| `concatMap` | Queues in order, sequential | Ordered operations, writes |
| `mergeMap` | All run in parallel | Independent parallel tasks |

---

**Incorrect (Wrong operator for search):**

```typescript
// ❌ mergeMap - All requests run parallel, results arrive out of order
searchControl.valueChanges.pipe(
  mergeMap(query => this.searchService.search(query))
).subscribe(results => {
  this.results = results; // May show stale results from slow old request!
});

// ❌ concatMap - Queues all requests, user waits for old queries
searchControl.valueChanges.pipe(
  concatMap(query => this.searchService.search(query))
).subscribe(results => {
  this.results = results; // Slow - waits for each request sequentially
});
```

**Correct (switchMap for search):**

```typescript
// ✅ switchMap - Cancels previous request, only latest matters
searchControl.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(query => this.searchService.search(query))
).subscribe(results => {
  this.results = results; // Always shows results for latest query
});
```

---

**Incorrect (Wrong operator for form submit):**

```typescript
// ❌ switchMap - User double-clicks, first submit is cancelled!
submitForm$.pipe(
  switchMap(() => this.orderService.placeOrder(this.form.value))
).subscribe();
// First order never placed if user clicks twice quickly

// ❌ mergeMap - Both submits go through, duplicate orders!
submitForm$.pipe(
  mergeMap(() => this.orderService.placeOrder(this.form.value))
).subscribe();
// User gets charged twice
```

**Correct (exhaustMap for form submit):**

```typescript
// ✅ exhaustMap - Ignores clicks while request is pending
submitForm$.pipe(
  exhaustMap(() => {
    this.isSubmitting = true;
    return this.orderService.placeOrder(this.form.value).pipe(
      finalize(() => this.isSubmitting = false)
    );
  })
).subscribe({
  next: (order) => this.router.navigate(['/order', order.id]),
  error: (err) => this.showError(err)
});
// Double-clicks ignored, only one order placed
```

---

**Incorrect (Wrong operator for sequential writes):**

```typescript
// ❌ switchMap - Later items cancel earlier ones!
itemsToSave$.pipe(
  switchMap(item => this.saveItem(item))
).subscribe();
// Only last item gets saved

// ❌ mergeMap - Order not guaranteed, race conditions
itemsToSave$.pipe(
  mergeMap(item => this.saveItem(item))
).subscribe();
// Items may save out of order, causing data inconsistency
```

**Correct (concatMap for sequential writes):**

```typescript
// ✅ concatMap - Each completes before next starts
itemsToSave$.pipe(
  concatMap(item => this.saveItem(item))
).subscribe({
  complete: () => console.log('All items saved in order')
});
// Guaranteed order: item1 saved, then item2, then item3...
```

---

**Correct (mergeMap for parallel independent operations):**

```typescript
// ✅ mergeMap - When order doesn't matter and parallel is faster
notificationIds$.pipe(
  mergeMap(
    id => this.markAsRead(id),
    5 // Optional: limit concurrent requests to 5
  )
).subscribe();
// All notifications marked as read in parallel, fastest completion
```

---

**Real-world patterns:**

```typescript
// Autocomplete with loading state
@Component({...})
export class SearchComponent {
  searchControl = new FormControl('');
  results$ = this.searchControl.valueChanges.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    filter(query => query.length >= 2),
    switchMap(query => this.search(query).pipe(
      startWith(null) // Emit null to show loading
    )),
    share()
  );
}

// Save with optimistic UI
saveItem(item: Item): Observable<Item> {
  return of(item).pipe( // Optimistic: return immediately
    tap(() => this.updateLocalState(item)),
    concatMap(() => this.api.save(item)), // Then persist
    catchError(err => {
      this.rollbackLocalState(item);
      return throwError(() => err);
    })
  );
}
```

**Why it matters:**
- `switchMap` + form submit = lost transactions
- `mergeMap` + search = race conditions showing wrong results
- `concatMap` + search = slow UX waiting for old requests
- `exhaustMap` + search = ignored user input

Reference: [RxJS Higher-Order Mapping](https://blog.angular-university.io/rxjs-higher-order-mapping/)
