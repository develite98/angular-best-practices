# Angular Best Practices (Angular 20+)

**Version 2.0.0**  
Community  
January 2026

> **Note:**  
> This document is for AI agents and LLMs to follow when maintaining,  
> generating, or refactoring Angular codebases. Optimized for Angular 20+.

---

## Abstract

Performance optimization guide for Angular 20+ applications with modern features including Signals, linkedSignal, httpResource, @defer blocks, standalone components (default), signal inputs/outputs, and native control flow syntax (@if, @for). Contains rules prioritized by impact for AI-assisted code generation and refactoring.

---

## Table of Contents

0. [Section 0](#0-section-0) — **HIGH**
   - 0.1 [Use Host Directives for Behavior Composition](#01-use-host-directives-for-behavior-composition)
   - 0.2 [Use Incremental Hydration for SSR](#02-use-incremental-hydration-for-ssr)
   - 0.3 [Use Signal Inputs and Outputs](#03-use-signal-inputs-and-outputs)
   - 0.4 [Use Signal Inputs for Route Parameters](#04-use-signal-inputs-for-route-parameters)
1. [Change Detection](#1-change-detection) — **CRITICAL**
   - 1.1 [Detach Change Detector for Heavy Operations](#11-detach-change-detector-for-heavy-operations)
   - 1.2 [Run Non-UI Code Outside NgZone](#12-run-non-ui-code-outside-ngzone)
   - 1.3 [Use Angular Signals for Reactive State](#13-use-angular-signals-for-reactive-state)
   - 1.4 [Use OnPush Change Detection Strategy](#14-use-onpush-change-detection-strategy)
2. [Bundle & Lazy Loading](#2-bundle--lazy-loading) — **CRITICAL**
   - 2.1 [Lazy Load Routes with loadComponent](#21-lazy-load-routes-with-loadcomponent)
   - 2.2 [Use @defer for Lazy Loading Components](#22-use-defer-for-lazy-loading-components)
   - 2.3 [Use Preload Strategies for Lazy Modules](#23-use-preload-strategies-for-lazy-modules)
   - 2.4 [Use Standalone Components](#24-use-standalone-components)
3. [RxJS Optimization](#3-rxjs-optimization) — **HIGH**
   - 3.1 [Share Observables to Avoid Duplicate Requests](#31-share-observables-to-avoid-duplicate-requests)
   - 3.2 [Use Async Pipe Instead of Manual Subscribe](#32-use-async-pipe-instead-of-manual-subscribe)
   - 3.3 [Use Efficient RxJS Operators](#33-use-efficient-rxjs-operators)
   - 3.4 [Use takeUntilDestroyed for Cleanup](#34-use-takeuntildestroyed-for-cleanup)
4. [Template Performance](#4-template-performance) — **HIGH**
   - 4.1 [Use @for with track for Loops](#41-use-for-with-track-for-loops)
   - 4.2 [Use NgOptimizedImage for Images](#42-use-ngoptimizedimage-for-images)
   - 4.3 [Use Pure Pipes for Data Transformation](#43-use-pure-pipes-for-data-transformation)
5. [Dependency Injection](#5-dependency-injection) — **MEDIUM-HIGH**
   - 5.1 [Use Factory Providers for Complex Setup](#51-use-factory-providers-for-complex-setup)
   - 5.2 [Use InjectionToken for Type-Safe Configuration](#52-use-injectiontoken-for-type-safe-configuration)
   - 5.3 [Use providedIn root for Tree-Shaking](#53-use-providedin-root-for-tree-shaking)
6. [HTTP & Caching](#6-http--caching) — **MEDIUM**
   - 6.1 [Use Functional HTTP Interceptors](#61-use-functional-http-interceptors)
   - 6.2 [Use httpResource for Signal-Based HTTP](#62-use-httpresource-for-signal-based-http)
   - 6.3 [Use TransferState for SSR Hydration](#63-use-transferstate-for-ssr-hydration)
7. [Forms Optimization](#7-forms-optimization) — **MEDIUM**
   - 7.1 [Use Reactive Forms for Complex Forms](#71-use-reactive-forms-for-complex-forms)
8. [General Performance](#8-general-performance) — **LOW-MEDIUM**
   - 8.1 [Offload Heavy Computation to Web Workers](#81-offload-heavy-computation-to-web-workers)

---

## 0. Section 0

**Impact: HIGH**

### 0.1 Use Host Directives for Behavior Composition

**Impact: MEDIUM (Reusable behaviors, cleaner components)**

Host directives compose reusable behaviors into components without inheritance, promoting composition and keeping components focused.

**Incorrect (Repeated behavior across components):**

```typescript
@Component({
  selector: 'app-button',
  template: `<ng-content />`
})
export class ButtonComponent {
  @HostBinding('class.focused') isFocused = false;
  @HostBinding('class.disabled') isDisabled = false;

  @HostListener('focus') onFocus() { this.isFocused = true; }
  @HostListener('blur') onBlur() { this.isFocused = false; }
}

@Component({
  selector: 'app-card',
  template: `<ng-content />`
})
export class CardComponent {
  // Same focus/disable logic duplicated...
  @HostBinding('class.focused') isFocused = false;
  @HostBinding('class.disabled') isDisabled = false;
}
```

**Correct (Reusable behavior directive):**

```typescript
@Directive({
  selector: '[focusable]',
  host: {
    'tabindex': '0',
    '(focus)': 'onFocus()',
    '(blur)': 'onBlur()',
    '[class.focused]': 'isFocused()'
  }
})
export class FocusableDirective {
  isFocused = signal(false);
  onFocus() { this.isFocused.set(true); }
  onBlur() { this.isFocused.set(false); }
}

@Component({
  selector: 'app-button',
  hostDirectives: [FocusableDirective],
  template: `<ng-content />`
})
export class ButtonComponent {}

@Component({
  selector: 'app-card',
  hostDirectives: [FocusableDirective],
  template: `<ng-content />`
})
export class CardComponent {}
```

**Why it matters:**

- Behaviors defined once, reused everywhere

- `hostDirectives` array composes multiple behaviors

- Inputs/outputs can be exposed via directive configuration

- No inheritance hierarchy needed

Reference: [https://angular.dev/guide/directives/directive-composition-api](https://angular.dev/guide/directives/directive-composition-api)

### 0.2 Use Incremental Hydration for SSR

**Impact: HIGH (Faster TTI, smaller JavaScript bundles)**

Incremental hydration defers JavaScript loading for below-fold components, reducing initial bundle size and improving Time to Interactive.

**Incorrect (Full hydration of all components):**

```typescript
@Component({
  template: `
    <app-header />
    <app-hero />
    <app-comments [postId]="postId" />      <!-- Heavy, below fold -->
    <app-recommendations />                  <!-- Heavy, below fold -->
    <app-footer />
  `
})
export class PostComponent {
  postId = input.required<string>();
}
```

**Correct (Incremental hydration with @defer):**

```typescript
@Component({
  template: `
    <app-header />
    <app-hero />

    @defer (hydrate on viewport) {
      <app-comments [postId]="postId()" />
    } @placeholder {
      <div class="comments-skeleton">Loading comments...</div>
    }

    @defer (hydrate on idle) {
      <app-recommendations />
    }

    @defer (hydrate never) {
      <app-footer />
    }
  `
})
export class PostComponent {
  postId = input.required<string>();
}
```

**Why it matters:**

- `hydrate on viewport` - Hydrates when scrolled into view

- `hydrate on idle` - Hydrates during browser idle time

- `hydrate on interaction` - Hydrates on user click/focus

- `hydrate never` - Never hydrates (static content only)

Reference: [https://angular.dev/guide/ssr](https://angular.dev/guide/ssr)

### 0.3 Use Signal Inputs and Outputs

**Impact: HIGH (Better reactivity, type safety, simpler code)**

Signal inputs (`input()`) and outputs (`output()`) replace `@Input()` and `@Output()` decorators, providing better type inference and reactive tracking without `OnChanges`.

**Incorrect (Decorator-based with OnChanges):**

```typescript
@Component({
  selector: 'app-user-card',
  template: `
    <h2>{{ name }}</h2>
    <p>{{ email }}</p>
    <button (click)="onSelect()">Select</button>
  `
})
export class UserCardComponent implements OnChanges {
  @Input() name!: string;
  @Input() email = '';
  @Output() selected = new EventEmitter<string>();

  ngOnChanges(changes: SimpleChanges) {
    if (changes['name']) {
      console.log('Name changed:', this.name);
    }
  }

  onSelect() {
    this.selected.emit(this.name);
  }
}
```

**Correct (Signal inputs with effect):**

```typescript
@Component({
  selector: 'app-user-card',
  template: `
    <h2>{{ name() }}</h2>
    <p>{{ email() }}</p>
    <button (click)="handleClick()">Select</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserCardComponent {
  name = input.required<string>();
  email = input('');
  selected = output<string>();

  constructor() {
    effect(() => {
      console.log('Name changed:', this.name());
    });
  }

  handleClick() {
    this.selected.emit(this.name());
  }
}
```

**Why it matters:**

- `input.required<T>()` enforces required inputs at compile time

- `input(defaultValue)` provides type-inferred optional inputs

- `effect()` replaces `ngOnChanges` for reacting to input changes

- Signals integrate with OnPush for optimal performance

Reference: [https://angular.dev/guide/signals/inputs](https://angular.dev/guide/signals/inputs)

### 0.4 Use Signal Inputs for Route Parameters

**Impact: MEDIUM (Simpler routing, reactive route params)**

With `withComponentInputBinding()`, route parameters are automatically bound to component inputs. Combined with signal inputs, this eliminates manual `ActivatedRoute` subscriptions.

**Incorrect (Manual route parameter subscription):**

```typescript
@Component({
  template: `<h1>User {{ userId }}</h1>`
})
export class UserDetailComponent implements OnInit, OnDestroy {
  userId: string | null = null;
  private subscription?: Subscription;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.subscription = this.route.paramMap.subscribe((params) => {
      this.userId = params.get('id');
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
```

**Correct (Signal input for route params):**

```typescript
// app.config.ts - Enable input binding
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding())
  ]
};

// Route: { path: 'users/:id', component: UserDetailComponent }
@Component({
  template: `<h1>User {{ id() }}</h1>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDetailComponent {
  id = input.required<string>();  // Route param auto-bound
  userId = computed(() => parseInt(this.id(), 10));
}
```

**Why it matters:**

- No manual `ActivatedRoute` subscription management

- Route params, query params, and resolver data all become inputs

- Reactive updates when route changes

- Clean teardown handled automatically

Reference: [https://angular.dev/guide/routing](https://angular.dev/guide/routing)

---

## 1. Change Detection

**Impact: CRITICAL**

Change detection is the #1 performance factor in Angular. Using OnPush strategy, Signals, and proper zone management can dramatically reduce unnecessary checks.

### 1.1 Detach Change Detector for Heavy Operations

**Impact: CRITICAL (Eliminates change detection during computation)**

For components with heavy computations or animations, detaching the change detector excludes the component from change detection cycles. Reattach when updates are needed.

**Incorrect (Change detection runs during animation):**

```typescript
@Component({
  selector: 'app-animation',
  template: `<canvas #canvas></canvas>`
})
export class AnimationComponent implements OnInit {
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  ngOnInit() {
    this.animate();
  }

  animate() {
    this.drawFrame();
    requestAnimationFrame(() => this.animate());
    // Each frame causes unnecessary change detection
  }
}
```

**Correct (Detach during animation):**

```typescript
@Component({
  selector: 'app-animation',
  template: `
    <canvas #canvas></canvas>
    <p>FPS: {{ fps }}</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnimationComponent implements OnInit {
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  fps = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cdr.detach();  // Exclude from change detection
    this.animate();
    this.updateFps();
  }

  animate() {
    this.drawFrame();
    requestAnimationFrame(() => this.animate());
  }

  updateFps() {
    setInterval(() => {
      this.cdr.detectChanges();  // Manual update only when needed
    }, 1000);
  }
}
```

**Why it matters:**

- `detach()` excludes component from all automatic checks

- `detectChanges()` triggers manual check when needed

- Ideal for canvas animations, games, real-time visualizations

- Remember to `reattach()` in `ngOnDestroy` if needed

Reference: [https://angular.dev/api/core/ChangeDetectorRef](https://angular.dev/api/core/ChangeDetectorRef)

### 1.2 Run Non-UI Code Outside NgZone

**Impact: CRITICAL (Prevents unnecessary change detection triggers)**

NgZone patches async APIs to trigger change detection. For code that doesn't affect the UI, running outside the zone prevents unnecessary cycles.

**Incorrect (Event listener triggers change detection):**

```typescript
@Component({
  selector: 'app-scroll-tracker',
  template: `<div>Scroll position logged to console</div>`
})
export class ScrollTrackerComponent implements OnInit {
  ngOnInit() {
    // Every scroll event triggers change detection
    window.addEventListener('scroll', this.onScroll);
  }

  onScroll = () => {
    console.log('Scroll:', window.scrollY);  // No UI update needed
  };
}
```

**Correct (Run outside zone, enter for UI updates):**

```typescript
@Component({
  selector: 'app-scroll-tracker',
  template: `<div>Scroll position: {{ scrollPosition }}</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScrollTrackerComponent implements OnInit {
  scrollPosition = 0;

  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.onScroll);
    });
  }

  onScroll = () => {
    const newPosition = window.scrollY;
    if (Math.abs(newPosition - this.scrollPosition) > 100) {
      this.ngZone.run(() => {
        this.scrollPosition = newPosition;
        this.cdr.markForCheck();
      });
    }
  };
}
```

**Why it matters:**

- `runOutsideAngular()` prevents change detection triggers

- `run()` re-enters the zone for UI updates

- Use for scroll/resize/mousemove listeners

- Use for WebSocket connections and polling

Reference: [https://angular.dev/api/core/NgZone](https://angular.dev/api/core/NgZone)

### 1.3 Use Angular Signals for Reactive State

**Impact: CRITICAL (Fine-grained reactivity, automatic optimization)**

Signals provide fine-grained reactivity where only components reading a signal are updated when it changes. This eliminates the need for manual `ChangeDetectorRef` calls.

**Incorrect (Manual change detection with OnPush):**

```typescript
@Component({
  selector: 'app-counter',
  template: `
    <p>Count: {{ count }}</p>
    <p>Double: {{ count * 2 }}</p>
    <button (click)="increment()">+</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CounterComponent {
  count = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  increment() {
    this.count++;
    this.cdr.markForCheck(); // Manual trigger required
  }
}
```

**Correct (Signals with automatic change detection):**

```typescript
@Component({
  selector: 'app-counter',
  template: `
    <p>Count: {{ count() }}</p>
    <p>Double: {{ doubleCount() }}</p>
    <button (click)="increment()">+</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CounterComponent {
  count = signal(0);
  doubleCount = computed(() => this.count() * 2);

  increment() {
    this.count.update(c => c + 1);
    // No markForCheck needed - signals handle it automatically
  }
}
```

**Why it matters:**

- Signals automatically notify Angular when values change

- `computed()` creates derived values that update reactively

- No manual `ChangeDetectorRef` management needed

- Works seamlessly with OnPush change detection

Reference: [https://angular.dev/guide/signals](https://angular.dev/guide/signals)

### 1.4 Use OnPush Change Detection Strategy

**Impact: CRITICAL (2-10x fewer change detection cycles)**

By default, Angular checks every component on each change detection cycle. OnPush limits checks to when inputs change by reference, events occur, or async pipes emit.

**Incorrect (Default checks on every cycle):**

```typescript
@Component({
  selector: 'app-user-list',
  template: `
    @for (user of users; track user.id) {
      <!-- formatDate called on EVERY change detection cycle -->
      <span>{{ formatDate(user.created) }}</span>
    }
  `
})
export class UserListComponent {
  @Input() users: User[] = [];

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US').format(date);
  }
}
```

**Correct (OnPush limits checks):**

```typescript
@Component({
  selector: 'app-user-list',
  template: `
    @for (user of users; track user.id) {
      <span>{{ user.created | date }}</span>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent {
  @Input() users: User[] = [];
  // Component only checks when users reference changes
  // Use pure pipes instead of methods in templates
}
```

**Why it matters:**

- Component only re-renders when inputs change by reference

- Events within the component trigger checks

- Async pipe emissions trigger checks

- Must update inputs immutably (new array, not mutation)

Reference: [https://angular.dev/best-practices/skipping-subtrees](https://angular.dev/best-practices/skipping-subtrees)

---

## 2. Bundle & Lazy Loading

**Impact: CRITICAL**

Standalone components, @defer blocks, and lazy loading improve Time to Interactive. Angular 20+ defaults to standalone.

### 2.1 Lazy Load Routes with loadComponent

**Impact: CRITICAL (40-70% initial bundle reduction)**

Lazy loading splits your application into smaller chunks loaded on demand. Use `loadComponent` for standalone components to reduce initial bundle size.

**Incorrect (Eagerly loaded routes):**

```typescript
import { DashboardComponent } from './dashboard/dashboard.component';
import { SettingsComponent } from './settings/settings.component';
import { ReportsComponent } from './reports/reports.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'reports', component: ReportsComponent }
  // All components loaded upfront, even if never visited
];
```

**Correct (Lazy loaded routes):**

```typescript
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./settings/settings.component').then(m => m.SettingsComponent)
  },
  {
    path: 'reports',
    loadChildren: () =>
      import('./reports/reports.routes').then(m => m.REPORTS_ROUTES)
  }
];
```

**Why it matters:**

- Initial bundle only includes code for first route

- Other routes downloaded on navigation

- `loadComponent` for single components

- `loadChildren` for route groups

Reference: [https://angular.dev/guide/routing/common-router-tasks#lazy-loading](https://angular.dev/guide/routing/common-router-tasks#lazy-loading)

### 2.2 Use @defer for Lazy Loading Components

**Impact: CRITICAL (Defers loading until needed, reduces initial bundle)**

`@defer` delays loading of heavy components until a trigger condition is met, reducing initial bundle size without route changes.

**Incorrect (Heavy components loaded immediately):**

```typescript
@Component({
  selector: 'app-dashboard',
  imports: [HeavyChartComponent, DataTableComponent],
  template: `
    <h1>Dashboard</h1>

    <!-- Chart library loaded even if user never scrolls down -->
    <app-heavy-chart [data]="chartData" />

    <!-- Large table always in initial bundle -->
    <app-data-table [rows]="tableData" />
  `
})
export class DashboardComponent {}
```

**Correct (Defer loading until needed):**

```typescript
@Component({
  selector: 'app-dashboard',
  imports: [HeavyChartComponent, DataTableComponent],
  template: `
    <h1>Dashboard</h1>

    @defer (on viewport) {
      <app-heavy-chart [data]="chartData" />
    } @placeholder {
      <div class="chart-skeleton">Loading chart...</div>
    }

    @defer (on interaction) {
      <app-data-table [rows]="tableData" />
    } @placeholder {
      <button>Click to load data table</button>
    }
  `
})
export class DashboardComponent {}
```

**Why it matters:**

- `on viewport` - Loads when element enters viewport (scroll-triggered)

- `on interaction` - Loads on click/focus (user-triggered)

- `on idle` - Loads when browser is idle (background loading)

- `@placeholder` shows fallback content until loaded

Reference: [https://angular.dev/guide/defer](https://angular.dev/guide/defer)

### 2.3 Use Preload Strategies for Lazy Modules

**Impact: CRITICAL (Improves navigation performance)**

Preloading downloads lazy-loaded modules in the background after initial load, making subsequent navigation instant.

**Incorrect (No preloading causes navigation delay):**

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes)
    // No preloading - modules load on demand
    // User experiences delay on first navigation
  ]
};
```

**Correct (Preload all modules after initial load):**

```typescript
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withPreloading(PreloadAllModules)
    )
  ]
};
```

**Why it matters:**

- `PreloadAllModules` loads all routes after initial render

- Navigation to lazy routes becomes instant

- Initial load is not affected (preloading happens after)

- Custom strategies can preload selectively

Reference: [https://angular.dev/guide/routing/common-router-tasks#preloading](https://angular.dev/guide/routing/common-router-tasks#preloading)

### 2.4 Use Standalone Components

**Impact: CRITICAL (Better tree-shaking, simpler architecture)**

Standalone components don't require NgModules, enabling better tree-shaking and granular lazy loading. In Angular v19+, components are standalone by default.

**Incorrect (NgModule-based with implicit dependencies):**

```typescript
@NgModule({
  declarations: [UserListComponent, UserDetailComponent],
  imports: [CommonModule, SharedModule],
  exports: [UserListComponent]
})
export class UserModule {}

@Component({
  selector: 'app-user-list',
  template: `...`
})
export class UserListComponent {}
// Dependencies come from module - not explicit
```

**Correct (Standalone with explicit imports):**

```typescript
@Component({
  selector: 'app-user-list',
  // No standalone: true needed in v19+
  imports: [RouterLink, UserAvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (user of users(); track user.id) {
      <app-user-avatar [user]="user" />
      <a [routerLink]="['/users', user.id]">{{ user.name }}</a>
    }
  `
})
export class UserListComponent {
  private userService = inject(UserService);
  users = toSignal(this.userService.getUsers(), { initialValue: [] });
}
```

**Why it matters:**

- Dependencies explicit in component's `imports` array

- Better tree-shaking (unused components excluded)

- No NgModule boilerplate needed

- Components are standalone by default in v19+

Reference: [https://angular.dev/guide/components/importing](https://angular.dev/guide/components/importing)

---

## 3. RxJS Optimization

**Impact: HIGH**

Proper RxJS usage with takeUntilDestroyed, async pipe, and efficient operators prevents memory leaks and reduces computations.

### 3.1 Share Observables to Avoid Duplicate Requests

**Impact: HIGH (Eliminates redundant HTTP calls)**

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

Reference: [https://rxjs.dev/api/operators/shareReplay](https://rxjs.dev/api/operators/shareReplay)

### 3.2 Use Async Pipe Instead of Manual Subscribe

**Impact: HIGH (Automatic cleanup, better change detection)**

The async pipe automatically subscribes and unsubscribes from observables, preventing memory leaks and working seamlessly with OnPush change detection.

**Incorrect (Manual subscription with leak potential):**

```typescript
@Component({
  template: `
    @if (user) {
      <h1>{{ user.name }}</h1>
    }
  `
})
export class UserProfileComponent implements OnInit, OnDestroy {
  user: User | null = null;
  private subscription!: Subscription;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.subscription = this.userService.getCurrentUser()
      .subscribe(user => this.user = user);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();  // Easy to forget
  }
}
```

**Correct (Async pipe handles lifecycle):**

```typescript
@Component({
  imports: [AsyncPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (user$ | async; as user) {
      <h1>{{ user.name }}</h1>
    }
  `
})
export class UserProfileComponent {
  user$ = inject(UserService).getCurrentUser();
  // No manual subscribe/unsubscribe needed
}
```

**Why it matters:**

- No manual `Subscription` management

- No `ngOnDestroy` cleanup needed

- Works perfectly with OnPush change detection

- Declarative and testable

Reference: [https://angular.dev/api/common/AsyncPipe](https://angular.dev/api/common/AsyncPipe)

### 3.3 Use Efficient RxJS Operators

**Impact: HIGH (Prevents race conditions and unnecessary work)**

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

Reference: [https://rxjs.dev/guide/operators](https://rxjs.dev/guide/operators)

### 3.4 Use takeUntilDestroyed for Cleanup

**Impact: HIGH (Prevents memory leaks automatically)**

`takeUntilDestroyed()` automatically unsubscribes when the component is destroyed, eliminating manual cleanup boilerplate.

**Incorrect (Manual Subject-based cleanup):**

```typescript
@Component({...})
export class DataComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.dataService.getData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.processData(data));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    // Boilerplate, easy to forget
  }
}
```

**Correct (takeUntilDestroyed handles cleanup):**

```typescript
@Component({...})
export class DataComponent {
  constructor() {
    // In constructor, DestroyRef is auto-injected
    this.dataService.getData()
      .pipe(takeUntilDestroyed())
      .subscribe(data => this.processData(data));
  }
}

// Or outside constructor:
export class DataComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.dataService.getData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => this.processData(data));
  }
}
```

**Why it matters:**

- No `ngOnDestroy` boilerplate needed

- No manual `Subject` management

- Works with `DestroyRef` outside constructor

- `toSignal()` is even cleaner when possible

Reference: [https://angular.dev/api/core/rxjs-interop/takeUntilDestroyed](https://angular.dev/api/core/rxjs-interop/takeUntilDestroyed)

---

## 4. Template Performance

**Impact: HIGH**

New control flow (@for with track, @if) and pure pipes optimize rendering. NgOptimizedImage improves Core Web Vitals.

### 4.1 Use @for with track for Loops

**Impact: HIGH (Prevents unnecessary DOM recreation)**

`@for` requires a `track` expression, enforcing efficient DOM reuse. Without tracking, Angular recreates all DOM elements when the array changes.

**Incorrect (No tracking causes full DOM recreation):**

```typescript
@Component({
  template: `
    <!-- All items re-render when array changes -->
    <div *ngFor="let user of users">
      <app-user-card [user]="user" />
    </div>
  `
})
export class UserListComponent {
  users: User[] = [];
}
```

**Correct (@for with required track):**

```typescript
@Component({
  template: `
    @for (user of users(); track user.id) {
      <app-user-card [user]="user" />
    } @empty {
      <p>No users found</p>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent {
  users = signal<User[]>([]);
}
```

**Why it matters:**

- `track user.id` identifies items for DOM reuse

- Only changed items are re-rendered, not the entire list

- `@empty` block handles empty array case

- Required `track` prevents accidental performance issues

Reference: [https://angular.dev/guide/templates/control-flow](https://angular.dev/guide/templates/control-flow)

### 4.2 Use NgOptimizedImage for Images

**Impact: HIGH (LCP improvement, automatic lazy loading)**

`NgOptimizedImage` enforces image best practices: automatic lazy loading, priority hints for LCP images, and prevents layout shift.

**Incorrect (Native img without optimization):**

```html
<!-- No lazy loading, no priority hints, potential CLS -->
<img src="/assets/hero.jpg" alt="Hero image">

<!-- May cause layout shift without dimensions -->
<img src="{{ user.avatar }}" alt="User avatar">
```

**Correct (NgOptimizedImage with best practices):**

```typescript
@Component({
  imports: [NgOptimizedImage],
  template: `
    <!-- Priority image (above fold, LCP candidate) -->
    <img
      ngSrc="/assets/hero.jpg"
      alt="Hero image"
      width="1200"
      height="600"
      priority
    />

    <!-- Lazy loaded by default (below fold) -->
    <img
      [ngSrc]="user().avatar"
      alt="User avatar"
      width="64"
      height="64"
    />
  `
})
export class ProductComponent {
  user = input.required<User>();
}
```

**Why it matters:**

- `priority` attribute for above-fold images (LCP)

- Automatic lazy loading for below-fold images

- Required `width`/`height` prevents layout shift

- `fill` mode available for dynamic containers

Reference: [https://angular.dev/guide/image-optimization](https://angular.dev/guide/image-optimization)

### 4.3 Use Pure Pipes for Data Transformation

**Impact: HIGH (Memoized computation, called only when input changes)**

Pure pipes are only executed when inputs change by reference. They're memoized, unlike template methods which run on every change detection cycle.

**Incorrect (Method called on every change detection):**

```typescript
@Component({
  template: `
    @for (product of products; track product.id) {
      <!-- formatPrice called on EVERY change detection cycle -->
      <span>{{ formatPrice(product.price) }}</span>
    }
  `
})
export class ProductListComponent {
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }
}
```

**Correct (Pure pipe only runs when input changes):**

```typescript
@Pipe({ name: 'price' })
export class PricePipe implements PipeTransform {
  transform(value: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(value);
  }
}

@Component({
  imports: [PricePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (product of products; track product.id) {
      <span>{{ product.price | price }}</span>
    }
  `
})
export class ProductListComponent {
  products = signal<Product[]>([]);
}
```

**Why it matters:**

- Pure pipes are memoized by Angular

- Only recalculate when input reference changes

- Methods in templates run on every change detection

- Significant performance gain in loops

Reference: [https://angular.dev/guide/pipes](https://angular.dev/guide/pipes)

---

## 5. Dependency Injection

**Impact: MEDIUM-HIGH**

Proper DI with providedIn, InjectionToken, and factory providers enables tree-shaking and testability.

### 5.1 Use Factory Providers for Complex Setup

**Impact: MEDIUM-HIGH (Conditional logic, dependency injection in factories)**

Factory providers allow conditional service creation with access to other dependencies via `inject()` inside the factory function.

**Incorrect (Complex logic in constructor):**

```typescript
@Injectable({ providedIn: 'root' })
export class StorageService {
  private storage: Storage;

  constructor() {
    // Complex logic in constructor - hard to test
    if (typeof window !== 'undefined' && window.localStorage) {
      this.storage = window.localStorage;
    } else {
      this.storage = new MemoryStorage();
    }
  }
}
```

**Correct (Factory with inject()):**

```typescript
export abstract class StorageService {
  abstract getItem(key: string): string | null;
  abstract setItem(key: string, value: string): void;
}

export class LocalStorageService extends StorageService {
  getItem(key: string) { return localStorage.getItem(key); }
  setItem(key: string, value: string) { localStorage.setItem(key, value); }
}

export class MemoryStorageService extends StorageService {
  private store = new Map<string, string>();
  getItem(key: string) { return this.store.get(key) ?? null; }
  setItem(key: string, value: string) { this.store.set(key, value); }
}

// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: StorageService,
      useFactory: () => {
        const platformId = inject(PLATFORM_ID);
        return isPlatformBrowser(platformId)
          ? new LocalStorageService()
          : new MemoryStorageService();
      }
    }
  ]
};
```

**Why it matters:**

- Use `inject()` inside factory for dependencies

- Conditional service creation based on environment

- Clean separation of implementations

- Easy to test each implementation independently

Reference: [https://angular.dev/guide/di/dependency-injection-providers](https://angular.dev/guide/di/dependency-injection-providers)

### 5.2 Use InjectionToken for Type-Safe Configuration

**Impact: MEDIUM-HIGH (Type safety, better testability)**

`InjectionToken` provides type-safe dependency injection for non-class values like configuration objects and feature flags.

**Incorrect (String tokens lose type safety):**

```typescript
providers: [
  { provide: 'API_URL', useValue: 'https://api.example.com' }
]

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = inject('API_URL' as any);  // No type safety
}
```

**Correct (InjectionToken with inject()):**

```typescript
// tokens.ts
export interface AppConfig {
  apiUrl: string;
  timeout: number;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('app.config');

// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: APP_CONFIG,
      useValue: { apiUrl: 'https://api.example.com', timeout: 5000 }
    }
  ]
};

// api.service.ts
@Injectable({ providedIn: 'root' })
export class ApiService {
  private config = inject(APP_CONFIG);  // Fully typed as AppConfig
}
```

**Why it matters:**

- Full type safety with `inject()`

- Compile-time checking for configuration values

- Easy to test by providing mock tokens

- Self-documenting code

Reference: [https://angular.dev/api/core/InjectionToken](https://angular.dev/api/core/InjectionToken)

### 5.3 Use providedIn root for Tree-Shaking

**Impact: MEDIUM-HIGH (Enables automatic tree-shaking of unused services)**

Services with `providedIn: 'root'` are tree-shakeable - if no component injects them, they're excluded from the bundle.

**Incorrect (Service always in bundle):**

```typescript
@Injectable()
export class UserService {}

@NgModule({
  providers: [UserService]  // Always in bundle, even if unused
})
export class UserModule {}
```

**Correct (Tree-shakeable with inject()):**

```typescript
@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
  }
}

// No providers array needed - just inject where used
@Component({...})
export class UserListComponent {
  private userService = inject(UserService);
  users = toSignal(this.userService.getUsers(), { initialValue: [] });
}
```

**Why it matters:**

- Unused services excluded from bundle

- No need to add to providers arrays

- Use `inject()` function for cleaner dependency injection

- Works with signals and OnPush change detection

Reference: [https://angular.dev/guide/di](https://angular.dev/guide/di)

---

## 6. HTTP & Caching

**Impact: MEDIUM**

Functional interceptors, HTTP cache transfer for SSR, and caching strategies reduce network requests.

### 6.1 Use Functional HTTP Interceptors

**Impact: MEDIUM (Cleaner code, better tree-shaking)**

Functional interceptors are simpler functions that replace class-based interceptors, with better tree-shaking and no boilerplate.

**Incorrect (Class-based interceptor):**

```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
    return next.handle(req);
  }
}

// Registration requires verbose provider config
providers: [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
]
```

**Correct (Functional interceptor):**

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req);
};

// app.config.ts - Clean registration
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};
```

**Why it matters:**

- Just a function, no class boilerplate

- Use `inject()` to get dependencies

- Clean array-based registration

- Automatically applies to `httpResource()` calls

Reference: [https://angular.dev/guide/http/interceptors](https://angular.dev/guide/http/interceptors)

### 6.2 Use httpResource for Signal-Based HTTP

**Impact: HIGH (Automatic loading states, reactive data fetching)**

`httpResource()` provides automatic loading/error states and reactive refetching when dependencies change, eliminating manual state management boilerplate.

**Incorrect (Manual loading state management):**

```typescript
@Component({
  template: `
    @if (loading) {
      <p>Loading...</p>
    } @else if (error) {
      <p>Error: {{ error }}</p>
    } @else {
      <p>{{ user?.name }}</p>
    }
  `
})
export class UserComponent implements OnInit {
  user: User | null = null;
  loading = false;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loading = true;
    this.http.get<User>('/api/users/1').subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }
}
```

**Correct (httpResource with automatic state):**

```typescript
@Component({
  template: `
    @if (userResource.isLoading()) {
      <p>Loading...</p>
    } @else if (userResource.error()) {
      <p>Error: {{ userResource.error()?.message }}</p>
      <button (click)="userResource.reload()">Retry</button>
    } @else if (userResource.hasValue()) {
      <h1>{{ userResource.value().name }}</h1>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserComponent {
  userId = signal('123');

  // Auto-refetches when userId changes
  userResource = httpResource<User>(() => `/api/users/${this.userId()}`);
}
```

**Why it matters:**

- Eliminates loading/error state boilerplate

- Automatically refetches when signal dependencies change

- Built-in `reload()` for retry functionality

- Type-safe access via `value()`, `error()`, `isLoading()`

Reference: [https://angular.dev/guide/http](https://angular.dev/guide/http)

### 6.3 Use TransferState for SSR Hydration

**Impact: MEDIUM (Eliminates duplicate requests on hydration)**

Without TransferState, HTTP requests made on the server are repeated on the client during hydration. TransferState transfers server responses to the client, avoiding duplicates.

**Incorrect (Duplicate requests during hydration):**

```typescript
@Component({...})
export class ProductListComponent implements OnInit {
  products$!: Observable<Product[]>;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Runs on server AND client = 2 identical requests
    this.products$ = this.http.get<Product[]>('/api/products');
  }
}
```

**Correct (Enable HTTP cache transfer):**

```typescript
// app.config.ts
import { provideClientHydration, withHttpTransferCacheOptions } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),
    provideClientHydration(
      withHttpTransferCacheOptions({
        includePostRequests: true
      })
    )
  ]
};

// component.ts - No changes needed
@Component({...})
export class ProductListComponent {
  products$ = inject(HttpClient).get<Product[]>('/api/products');
  // Response transferred from server to client automatically
}
```

**Why it matters:**

- Server response cached and transferred to client

- No duplicate HTTP requests during hydration

- Faster initial page interactivity

- Works automatically with HttpClient

Reference: [https://angular.dev/guide/ssr](https://angular.dev/guide/ssr)

---

## 7. Forms Optimization

**Impact: MEDIUM**

Typed reactive forms with NonNullableFormBuilder provide compile-time safety and better DX.

### 7.1 Use Reactive Forms for Complex Forms

**Impact: MEDIUM (Better testability, synchronous access)**

Reactive forms provide synchronous access to form state, making them easier to test and offering better control over validation.

**Incorrect (Template-driven with complex validation):**

```typescript
@Component({
  template: `
    <form #userForm="ngForm" (ngSubmit)="onSubmit()">
      <input [(ngModel)]="user.email" name="email" required email />
      <input [(ngModel)]="user.password" name="password" required />
      <input [(ngModel)]="user.confirmPassword" name="confirmPassword" />

      <!-- Complex validation in template -->
      @if (userForm.controls['password']?.value !== userForm.controls['confirmPassword']?.value) {
        <div>Passwords don't match</div>
      }
    </form>
  `
})
export class RegisterComponent {
  user = { email: '', password: '', confirmPassword: '' };
}
```

**Correct (Reactive form with typed controls):**

```typescript
@Component({
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <input formControlName="email" />
      <input type="password" formControlName="password" />
      <input type="password" formControlName="confirmPassword" />

      @if (form.errors?.['passwordMismatch']) {
        <span class="error">Passwords don't match</span>
      }

      <button [disabled]="form.invalid">Submit</button>
    </form>
  `
})
export class RegisterComponent {
  private fb = inject(NonNullableFormBuilder);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  }, {
    validators: [this.passwordMatchValidator]
  });

  passwordMatchValidator(group: FormGroup): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.form.valid) {
      const { email, password } = this.form.getRawValue();
    }
  }
}
```

**Why it matters:**

- Typed form values with `NonNullableFormBuilder`

- Cross-field validation in component logic

- Synchronous access to form state

- Easy to test without template

Reference: [https://angular.dev/guide/forms/reactive-forms](https://angular.dev/guide/forms/reactive-forms)

---

## 8. General Performance

**Impact: LOW-MEDIUM**

Web Workers and additional optimization patterns for specific use cases.

### 8.1 Offload Heavy Computation to Web Workers

**Impact: LOW-MEDIUM (Keeps UI responsive during intensive tasks)**

Heavy computations on the main thread block the UI. Web Workers run in a separate thread, keeping the UI responsive.

**Incorrect (Heavy computation blocks UI):**

```typescript
@Component({
  template: `
    <button (click)="processData()">Process</button>
    <div>Result: {{ result }}</div>
    <!-- UI freezes while processing -->
  `
})
export class DataProcessorComponent {
  result = '';

  processData() {
    // Blocks main thread for seconds
    const data = this.generateLargeDataset();
    this.result = this.heavyComputation(data);
  }
}
```

**Correct (Web Worker keeps UI responsive):**

```typescript
// ng generate web-worker data-processor

// data-processor.worker.ts
addEventListener('message', ({ data }) => {
  const result = heavyComputation(data);
  postMessage(result);
});

// data-processor.component.ts
@Component({
  template: `
    <button (click)="processData()" [disabled]="isProcessing()">
      {{ isProcessing() ? 'Processing...' : 'Process' }}
    </button>
    <div>Result: {{ result() }}</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataProcessorComponent {
  result = signal('');
  isProcessing = signal(false);
  private worker = new Worker(
    new URL('./data-processor.worker', import.meta.url)
  );

  constructor() {
    this.worker.onmessage = ({ data }) => {
      this.result.set(data);
      this.isProcessing.set(false);
    };
  }

  processData() {
    this.isProcessing.set(true);
    this.worker.postMessage(this.generateLargeDataset());
  }
}
```

**Why it matters:**

- UI remains responsive during computation

- Use for data parsing, image processing, encryption

- Generate with `ng generate web-worker <name>`

- Consider Comlink library for easier communication

Reference: [https://angular.dev/guide/web-worker](https://angular.dev/guide/web-worker)

---

## References

1. [https://angular.dev](https://angular.dev)
2. [https://angular.dev/guide/signals](https://angular.dev/guide/signals)
3. [https://angular.dev/guide/defer](https://angular.dev/guide/defer)
4. [https://angular.dev/guide/templates/control-flow](https://angular.dev/guide/templates/control-flow)
5. [https://angular.dev/guide/image-optimization](https://angular.dev/guide/image-optimization)
