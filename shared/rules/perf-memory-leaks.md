---
title: Prevent Memory Leaks
impact: HIGH
impactDescription: Uncleaned subscriptions, timers, and listeners cause app slowdown and crashes
tags: memory, performance, cleanup, ngOnDestroy, timers, events
---

## Prevent Memory Leaks

Memory leaks occur when resources aren't released after component destruction. Common sources: subscriptions, timers, event listeners, and DOM references. Over time, leaks cause slowdown and crashes.

**Incorrect (Subscription not cleaned up):**

```typescript
// ❌ Subscription lives forever after component destroyed
@Component({...})
export class DashboardComponent implements OnInit {
  ngOnInit() {
    // This subscription NEVER gets cleaned up
    this.dataService.getData().subscribe(data => {
      this.data = data;
    });

    // Interval runs forever, even after navigation
    setInterval(() => this.refresh(), 5000);

    // Event listener never removed
    window.addEventListener('resize', this.onResize);
  }

  onResize = () => {
    this.width = window.innerWidth;
  };
}
```

**Correct (Proper cleanup):**

```typescript
// ✅ Modern approach: takeUntilDestroyed (Angular 16+)
@Component({...})
export class DashboardComponent {
  private destroyRef = inject(DestroyRef);

  data$ = this.dataService.getData().pipe(
    takeUntilDestroyed(this.destroyRef)
  );

  constructor() {
    // Auto-cleaned up when component destroys
    interval(5000).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.refresh());
  }
}

// ✅ Classic approach: Subject + takeUntil
@Component({...})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.dataService.getData().pipe(
      takeUntil(this.destroy$)
    ).subscribe(data => this.data = data);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

---

**Incorrect (Timer/Interval not cleared):**

```typescript
// ❌ setInterval runs forever
@Component({...})
export class PollingComponent implements OnInit {
  ngOnInit() {
    setInterval(() => {
      this.fetchData(); // Runs even after component destroyed!
    }, 3000);
  }
}
```

**Correct (Clear timers):**

```typescript
// ✅ Option 1: Use RxJS interval with takeUntilDestroyed
@Component({...})
export class PollingComponent {
  private destroyRef = inject(DestroyRef);

  constructor() {
    interval(3000).pipe(
      takeUntilDestroyed(this.destroyRef),
      switchMap(() => this.dataService.fetch())
    ).subscribe(data => this.data = data);
  }
}

// ✅ Option 2: Manual cleanup with clearInterval
@Component({...})
export class PollingComponent implements OnInit, OnDestroy {
  private intervalId?: ReturnType<typeof setInterval>;

  ngOnInit() {
    this.intervalId = setInterval(() => this.fetchData(), 3000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

// ✅ Option 3: setTimeout with recursive call
@Component({...})
export class PollingComponent implements OnDestroy {
  private timeoutId?: ReturnType<typeof setTimeout>;
  private isDestroyed = false;

  ngOnInit() {
    this.poll();
  }

  private poll() {
    if (this.isDestroyed) return;

    this.fetchData();
    this.timeoutId = setTimeout(() => this.poll(), 3000);
  }

  ngOnDestroy() {
    this.isDestroyed = true;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}
```

---

**Incorrect (Event listener not removed):**

```typescript
// ❌ Window listener persists forever
@Component({...})
export class ResponsiveComponent implements OnInit {
  ngOnInit() {
    window.addEventListener('resize', this.handleResize);
    document.addEventListener('click', this.handleClick);
  }

  handleResize = () => { /* ... */ };
  handleClick = () => { /* ... */ };
}
```

**Correct (Remove listeners):**

```typescript
// ✅ Option 1: Manual cleanup
@Component({...})
export class ResponsiveComponent implements OnInit, OnDestroy {
  // Must use arrow function or bind to keep 'this' reference
  private handleResize = () => {
    this.width = window.innerWidth;
  };

  ngOnInit() {
    window.addEventListener('resize', this.handleResize);
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.handleResize);
  }
}

// ✅ Option 2: RxJS fromEvent (recommended)
@Component({...})
export class ResponsiveComponent {
  private destroyRef = inject(DestroyRef);

  width$ = fromEvent(window, 'resize').pipe(
    debounceTime(100),
    map(() => window.innerWidth),
    startWith(window.innerWidth),
    takeUntilDestroyed(this.destroyRef)
  );
}

// ✅ Option 3: Renderer2 for SSR compatibility
@Component({...})
export class ResponsiveComponent implements OnInit, OnDestroy {
  private renderer = inject(Renderer2);
  private unlistenFn?: () => void;

  ngOnInit() {
    this.unlistenFn = this.renderer.listen('window', 'resize', () => {
      this.width = window.innerWidth;
    });
  }

  ngOnDestroy() {
    this.unlistenFn?.();
  }
}
```

---

**Incorrect (Holding references to destroyed elements):**

```typescript
// ❌ Service holds reference to destroyed component
@Injectable({ providedIn: 'root' })
export class ModalService {
  private openModals: ModalComponent[] = [];

  register(modal: ModalComponent) {
    this.openModals.push(modal);
    // Never removed - component reference held forever!
  }
}
```

**Correct (Clean up references):**

```typescript
// ✅ Properly manage references
@Injectable({ providedIn: 'root' })
export class ModalService {
  private openModals = new Set<ModalComponent>();

  register(modal: ModalComponent) {
    this.openModals.add(modal);
  }

  unregister(modal: ModalComponent) {
    this.openModals.delete(modal);
  }
}

@Component({...})
export class ModalComponent implements OnDestroy {
  private modalService = inject(ModalService);

  constructor() {
    this.modalService.register(this);
  }

  ngOnDestroy() {
    this.modalService.unregister(this);
  }
}
```

**Memory leak detection checklist:**
- [ ] All subscriptions use `takeUntilDestroyed` or `takeUntil`
- [ ] All `setInterval`/`setTimeout` cleared in `ngOnDestroy`
- [ ] All `addEventListener` has matching `removeEventListener`
- [ ] No component references stored in long-lived services
- [ ] Use Chrome DevTools Memory tab to detect leaks

Reference: [Angular Memory Leaks](https://angular.dev/best-practices/runtime-performance)
