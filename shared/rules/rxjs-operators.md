---
title: Use Efficient RxJS Operators
impact: HIGH
impactDescription: Prevents race conditions and unnecessary work
tags: rxjs, operators, switchMap, debounce
---

## Use Efficient RxJS Operators

Choosing the right operator prevents race conditions and unnecessary work. Use `switchMap` for cancellable requests, `debounceTime` for user input.

**Incorrect (mergeMap causes race conditions):**

```typescript
@Component({...})
export class SearchComponent {
  searchControl = new FormControl('');

  results$ = this.searchControl.valueChanges.pipe(
    // mergeMap doesn't cancel previous requests
    // Results can arrive out of order
    mergeMap(query => this.searchService.search(query))
  );
}
```

**Correct (switchMap cancels previous, debounce reduces calls):**

```typescript
@Component({
  template: `
    <input [formControl]="searchControl" />
    @for (result of results$ | async; track result.id) {
      <div>{{ result.title }}</div>
    }
  `
})
export class SearchComponent {
  searchControl = new FormControl('');

  results$ = this.searchControl.valueChanges.pipe(
    debounceTime(300),                // Wait for typing to stop
    distinctUntilChanged(),            // Skip if same value
    filter(query => query.length > 2), // Min length
    switchMap(query =>                 // Cancel previous request
      this.searchService.search(query).pipe(
        catchError(() => of([]))
      )
    )
  );
}
```

**Why it matters:**
- `switchMap` - Only latest matters (search, autocomplete)
- `exhaustMap` - Ignore new until current completes (form submit)
- `concatMap` - Order matters, queue requests
- `mergeMap` - All results matter, order doesn't

Reference: [RxJS Operators](https://rxjs.dev/guide/operators)
