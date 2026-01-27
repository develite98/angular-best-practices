---
title: Avoid Nested Subscriptions
impact: HIGH
impactDescription: Nested subscribes cause memory leaks, callback hell, and missed errors
tags: rxjs, subscribe, operators, memory-leak, anti-pattern
---

## Avoid Nested Subscriptions

Nesting subscribe() calls inside other subscribe() callbacks creates callback hell, memory leaks, and makes error handling difficult. Use RxJS operators to compose streams instead.

**Incorrect (Nested subscriptions):**

```typescript
// ❌ Callback hell, inner subscription never cleaned up
@Component({...})
export class OrderDetailsComponent implements OnInit {
  ngOnInit() {
    this.route.params.subscribe(params => {
      this.orderService.getOrder(params['id']).subscribe(order => {
        this.order = order;
        this.userService.getUser(order.userId).subscribe(user => {
          this.user = user;
          this.addressService.getAddress(user.addressId).subscribe(address => {
            this.address = address;
            // 4 levels deep, impossible to maintain
            // Memory leak: inner subscriptions never unsubscribed
          });
        });
      });
    });
  }
}
```

**Correct (Use operators to compose):**

```typescript
// ✅ Flat, readable, properly managed
@Component({...})
export class OrderDetailsComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  order$ = this.route.params.pipe(
    map(params => params['id']),
    switchMap(id => this.orderService.getOrder(id)),
    takeUntil(this.destroy$)
  );

  user$ = this.order$.pipe(
    switchMap(order => this.userService.getUser(order.userId))
  );

  address$ = this.user$.pipe(
    switchMap(user => this.addressService.getAddress(user.addressId))
  );

  // Or combine all data into one stream
  vm$ = this.route.params.pipe(
    map(params => params['id']),
    switchMap(id => this.orderService.getOrder(id)),
    switchMap(order => forkJoin({
      order: of(order),
      user: this.userService.getUser(order.userId)
    })),
    switchMap(({ order, user }) => forkJoin({
      order: of(order),
      user: of(user),
      address: this.addressService.getAddress(user.addressId)
    })),
    takeUntil(this.destroy$)
  );

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

**Even better (Angular 16+ with takeUntilDestroyed):**

```typescript
// ✅ Cleanest approach with modern Angular
@Component({...})
export class OrderDetailsComponent {
  private destroyRef = inject(DestroyRef);

  vm$ = this.route.params.pipe(
    map(params => params['id']),
    switchMap(id => this.loadOrderWithDetails(id)),
    takeUntilDestroyed(this.destroyRef)
  );

  private loadOrderWithDetails(orderId: string) {
    return this.orderService.getOrder(orderId).pipe(
      switchMap(order =>
        combineLatest({
          order: of(order),
          user: this.userService.getUser(order.userId),
          address: this.getAddressForOrder(order)
        })
      )
    );
  }
}
```

---

**Incorrect (Nested subscribe for conditional logic):**

```typescript
// ❌ Nested subscribe for conditional fetch
this.authService.currentUser$.subscribe(user => {
  if (user) {
    this.userService.getProfile(user.id).subscribe(profile => {
      this.profile = profile;
    });
  }
});
```

**Correct (Use filter and switchMap):**

```typescript
// ✅ Operators handle the conditional
this.authService.currentUser$.pipe(
  filter((user): user is User => user !== null),
  switchMap(user => this.userService.getProfile(user.id)),
  takeUntilDestroyed()
).subscribe(profile => {
  this.profile = profile;
});
```

---

**Incorrect (Subscribe to trigger side effects):**

```typescript
// ❌ Subscribe just to call another method
this.items$.subscribe(items => {
  this.processItems(items).subscribe(result => {
    this.saveResult(result).subscribe(() => {
      console.log('Done');
    });
  });
});
```

**Correct (Chain with operators):**

```typescript
// ✅ Single subscription with operator chain
this.items$.pipe(
  concatMap(items => this.processItems(items)),
  concatMap(result => this.saveResult(result)),
  takeUntilDestroyed()
).subscribe({
  next: () => console.log('Done'),
  error: (err) => console.error('Pipeline failed:', err)
});
```

---

**Common operator patterns:**

```typescript
// Sequential dependent calls
a$.pipe(
  switchMap(a => b$(a)),
  switchMap(b => c$(b))
)

// Parallel independent calls
forkJoin({ a: a$, b: b$, c: c$ })

// Parallel then combine
combineLatest([a$, b$]).pipe(
  map(([a, b]) => ({ ...a, ...b }))
)

// Conditional based on value
source$.pipe(
  switchMap(value =>
    value.needsExtra
      ? fetchExtra(value).pipe(map(extra => ({ ...value, extra })))
      : of(value)
  )
)
```

**Why it matters:**
- Inner subscriptions don't auto-unsubscribe when outer completes
- Error in inner stream doesn't propagate to outer
- Impossible to cancel/retry the whole chain
- Code becomes unreadable and untestable

Reference: [RxJS Best Practices](https://blog.angular-university.io/rxjs-error-handling/)
