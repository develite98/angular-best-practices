# Angular Best Practices (Angular 12-16)

**Version 1.0.0**  
Community  
January 2026

> **Note:**  
> This document is for AI agents and LLMs to follow when maintaining,  
> generating, or refactoring Angular codebases. Optimized for Angular 12-16.

---

## Abstract

Performance optimization guide for Angular 12-16 applications using NgModule-based architecture, RxJS state management, and classic template syntax (*ngIf, *ngFor). Contains rules prioritized by impact for AI-assisted code generation and refactoring of legacy Angular codebases.

---

## Table of Contents

1. [Change Detection](#1-change-detection) — **CRITICAL**
   - 1.1 [Detach Change Detector for Heavy Operations](#11-detach-change-detector-for-heavy-operations)
   - 1.2 [Run Non-UI Code Outside NgZone](#12-run-non-ui-code-outside-ngzone)
   - 1.3 [Use BehaviorSubject for Reactive State](#13-use-behaviorsubject-for-reactive-state)
   - 1.4 [Use OnPush Change Detection Strategy](#14-use-onpush-change-detection-strategy)
2. [Bundle & Lazy Loading](#2-bundle--lazy-loading) — **CRITICAL**
   - 2.1 [Lazy Load Feature Modules](#21-lazy-load-feature-modules)
   - 2.2 [Organize Code with Feature Modules](#22-organize-code-with-feature-modules)
   - 2.3 [Use Preload Strategies for Lazy Modules](#23-use-preload-strategies-for-lazy-modules)
   - 2.4 [Use SCAM Pattern Instead of Shared Modules](#24-use-scam-pattern-instead-of-shared-modules)
3. [RxJS Optimization](#3-rxjs-optimization) — **HIGH**
   - 3.1 [Share Observables to Avoid Duplicate Requests](#31-share-observables-to-avoid-duplicate-requests)
   - 3.2 [Use Async Pipe Instead of Manual Subscribe](#32-use-async-pipe-instead-of-manual-subscribe)
   - 3.3 [Use Efficient RxJS Operators](#33-use-efficient-rxjs-operators)
   - 3.4 [Use Subject with takeUntil for Cleanup](#34-use-subject-with-takeuntil-for-cleanup)
4. [Template Performance](#4-template-performance) — **HIGH**
   - 4.1 [Use NgOptimizedImage for Images (v15+)](#41-use-ngoptimizedimage-for-images-v15)
   - 4.2 [Use Pure Pipes for Data Transformation](#42-use-pure-pipes-for-data-transformation)
   - 4.3 [Use trackBy with *ngFor](#43-use-trackby-with-ngfor)
5. [Dependency Injection](#5-dependency-injection) — **MEDIUM-HIGH**
   - 5.1 [Use Factory Providers for Complex Setup](#51-use-factory-providers-for-complex-setup)
   - 5.2 [Use InjectionToken for Type-Safe Configuration](#52-use-injectiontoken-for-type-safe-configuration)
   - 5.3 [Use providedIn root for Tree-Shaking](#53-use-providedin-root-for-tree-shaking)
6. [HTTP & Caching](#6-http--caching) — **MEDIUM**
   - 6.1 [Use Class-Based HTTP Interceptors](#61-use-class-based-http-interceptors)
   - 6.2 [Use TransferState for SSR](#62-use-transferstate-for-ssr)
7. [Forms Optimization](#7-forms-optimization) — **MEDIUM**
   - 7.1 [Use Reactive Forms for Complex Forms](#71-use-reactive-forms-for-complex-forms)
   - 7.2 [Use Typed Reactive Forms (v14+)](#72-use-typed-reactive-forms-v14)
8. [General Performance](#8-general-performance) — **LOW-MEDIUM**
   - 8.1 [Offload Heavy Computation to Web Workers](#81-offload-heavy-computation-to-web-workers)

---

## 1. Change Detection

**Impact: CRITICAL**

Change detection optimization with OnPush, NgZone, and RxJS-based reactive state management.

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

### 1.3 Use BehaviorSubject for Reactive State

**Impact: CRITICAL (Reactive state management without Signals)**

Before Angular Signals (v16+), BehaviorSubject provides reactive state management. Combined with OnPush change detection and async pipe, it offers efficient updates.

**Incorrect (Imperative state with manual change detection):**

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

**Correct (BehaviorSubject with async pipe):**

```typescript
@Component({
  selector: 'app-counter',
  template: `
    <ng-container *ngIf="vm$ | async as vm">
      <p>Count: {{ vm.count }}</p>
      <p>Double: {{ vm.double }}</p>
    </ng-container>
    <button (click)="increment()">+</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CounterComponent {
  private countSubject = new BehaviorSubject<number>(0);

  vm$ = this.countSubject.pipe(
    map(count => ({
      count,
      double: count * 2
    }))
  );

  increment() {
    this.countSubject.next(this.countSubject.value + 1);
    // No manual markForCheck needed - async pipe handles it
  }
}
```

**State service pattern:**

```typescript
@Injectable({ providedIn: 'root' })
export class CounterState {
  private countSubject = new BehaviorSubject<number>(0);

  readonly count$ = this.countSubject.asObservable();
  readonly double$ = this.count$.pipe(map(c => c * 2));

  increment() {
    this.countSubject.next(this.countSubject.value + 1);
  }

  decrement() {
    this.countSubject.next(this.countSubject.value - 1);
  }
}
```

Reference: [https://rxjs.dev/api/index/class/BehaviorSubject](https://rxjs.dev/api/index/class/BehaviorSubject)

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

NgModule-based lazy loading and preload strategies to reduce initial bundle size.

### 2.1 Lazy Load Feature Modules

**Impact: CRITICAL (40-70% initial bundle reduction)**

Lazy loading splits your application into smaller chunks loaded on demand. Use `loadChildren` to lazy load feature modules.

**Incorrect (Eagerly loaded modules):**

```typescript
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    UserModule,   // Loaded immediately
    AdminModule   // Loaded even if user never visits
  ]
})
export class AppRoutingModule {}
```

**Correct (Lazy loaded modules):**

```typescript
const routes: Routes = [
  {
    path: 'users',
    loadChildren: () =>
      import('./user/user.module').then(m => m.UserModule)
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin.module').then(m => m.AdminModule),
    canLoad: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
```

**Why it matters:**

- Initial bundle only includes core code

- Feature modules downloaded on navigation

- `canLoad` prevents loading if not authorized

- Use `forChild` in lazy-loaded routing modules

Reference: [https://v16.angular.io/guide/lazy-loading-ngmodules](https://v16.angular.io/guide/lazy-loading-ngmodules)

### 2.2 Organize Code with Feature Modules

**Impact: CRITICAL (Better code organization, enables lazy loading)**

Feature modules group related components, services, and pipes. They enable lazy loading and keep the codebase organized. Each feature should have its own module.

**Incorrect (Everything in AppModule):**

```typescript
@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    UserListComponent,
    UserDetailComponent,
    ProductListComponent,
    ProductDetailComponent,
    CartComponent,
    CheckoutComponent,
    // ... 50 more components
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
// Everything loaded upfront, huge initial bundle
```

**Correct (Feature modules with lazy loading):**

```typescript
// user.module.ts
@NgModule({
  declarations: [
    UserListComponent,
    UserDetailComponent,
    UserAvatarComponent,
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    SharedModule,
  ]
})
export class UserModule {}

// product.module.ts
@NgModule({
  declarations: [
    ProductListComponent,
    ProductDetailComponent,
  ],
  imports: [
    CommonModule,
    ProductRoutingModule,
    SharedModule,
  ]
})
export class ProductModule {}

// app-routing.module.ts
const routes: Routes = [
  {
    path: 'users',
    loadChildren: () => import('./user/user.module').then(m => m.UserModule)
  },
  {
    path: 'products',
    loadChildren: () => import('./product/product.module').then(m => m.ProductModule)
  }
];

// app.module.ts - minimal
@NgModule({
  declarations: [AppComponent, HeaderComponent, FooterComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    CoreModule, // Singleton services
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

**SharedModule pattern:**

```typescript
@NgModule({
  declarations: [LoadingSpinnerComponent, ErrorMessageComponent],
  imports: [CommonModule],
  exports: [
    CommonModule,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
  ]
})
export class SharedModule {}
```

Reference: [https://v16.angular.io/guide/feature-modules](https://v16.angular.io/guide/feature-modules)

### 2.3 Use Preload Strategies for Lazy Modules

**Impact: CRITICAL (Improves navigation performance)**

Preloading downloads lazy-loaded modules in the background after initial load, making subsequent navigation instant.

**Incorrect (No preloading causes navigation delay):**

```typescript
@NgModule({
  imports: [RouterModule.forRoot(routes)]
  // No preloading - modules load on demand with delay
})
export class AppRoutingModule {}
```

**Correct (Preload all modules):**

```typescript
import { PreloadAllModules } from '@angular/router';

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules
    })
  ]
})
export class AppRoutingModule {}
```

**Why it matters:**

- `PreloadAllModules` loads all routes after initial render

- Navigation to lazy routes becomes instant

- Initial load is not affected

- Custom strategies can preload selectively

Reference: [https://v16.angular.io/guide/lazy-loading-ngmodules#preloading](https://v16.angular.io/guide/lazy-loading-ngmodules#preloading)

### 2.4 Use SCAM Pattern Instead of Shared Modules

**Impact: HIGH (Better tree-shaking and smaller bundles by avoiding shared module bloat)**

SCAM (Single Component as Module) pattern creates a dedicated NgModule for each component, directive, or pipe. This enables better tree-shaking and prevents importing unused code through shared modules.

**Incorrect (Shared module with many exports):**

```typescript
// shared.module.ts
@NgModule({
  declarations: [
    ButtonComponent,
    CardComponent,
    ModalComponent,
    TooltipDirective,
    DatePipe,
    CurrencyPipe,
    // 20+ more components...
  ],
  exports: [
    ButtonComponent,
    CardComponent,
    ModalComponent,
    TooltipDirective,
    DatePipe,
    CurrencyPipe,
    // All exported even if only one is used
  ]
})
export class SharedModule {}

// feature.module.ts
@NgModule({
  imports: [SharedModule] // Imports ALL shared components
})
export class FeatureModule {}
```

**Correct (SCAM pattern):**

```typescript
// button/button.component.module.ts
@NgModule({
  declarations: [ButtonComponent],
  imports: [CommonModule],
  exports: [ButtonComponent]
})
export class ButtonComponentModule {}

// card/card.component.module.ts
@NgModule({
  declarations: [CardComponent],
  imports: [CommonModule],
  exports: [CardComponent]
})
export class CardComponentModule {}

// modal/modal.component.module.ts
@NgModule({
  declarations: [ModalComponent],
  imports: [CommonModule, ButtonComponentModule],
  exports: [ModalComponent]
})
export class ModalComponentModule {}

// tooltip/tooltip.directive.module.ts
@NgModule({
  declarations: [TooltipDirective],
  exports: [TooltipDirective]
})
export class TooltipDirectiveModule {}

// feature.module.ts
@NgModule({
  imports: [
    ButtonComponentModule,  // Only import what you need
    CardComponentModule
  ]
})
export class FeatureModule {}
```

**File structure for SCAM:**

```typescript
shared/
├── button/
│   ├── button.component.ts
│   ├── button.component.html
│   ├── button.component.scss
│   ├── button.component.spec.ts
│   └── button.component.module.ts    # SCAM module
├── card/
│   ├── card.component.ts
│   ├── card.component.module.ts
├── modal/
│   ├── modal.component.ts
│   ├── modal.component.module.ts
└── index.ts                          # Barrel exports
```

**Barrel file for clean imports:**

```typescript
// shared/index.ts
export { ButtonComponentModule } from './button/button.component.module';
export { CardComponentModule } from './card/card.component.module';
export { ModalComponentModule } from './modal/modal.component.module';

// Usage in feature module
import { ButtonComponentModule, CardComponentModule } from '@shared';
```

**Benefits of SCAM:**

1. **Tree-shaking** - Unused components are excluded from bundle

2. **Explicit dependencies** - Each component declares its own imports

3. **Lazy loading ready** - Easy to lazy load individual components

4. **Migration path** - Simpler upgrade to standalone components in v17+

Reference: [https://v16.angular.io/guide/ngmodule-faq](https://v16.angular.io/guide/ngmodule-faq)

---

## 3. RxJS Optimization

**Impact: HIGH**

Proper RxJS patterns with async pipe, Subject-based cleanup, and efficient operators.

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

**Incorrect (Manual subscription):**

```typescript
@Component({
  template: `
    <div *ngIf="user">
      <h1>{{ user.name }}</h1>
    </div>
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
  template: `
    <div *ngIf="user$ | async as user">
      <h1>{{ user.name }}</h1>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserProfileComponent {
  user$ = this.userService.getCurrentUser();

  constructor(private userService: UserService) {}
  // No manual subscribe/unsubscribe needed
}
```

**Why it matters:**

- No manual `Subscription` management

- No `ngOnDestroy` cleanup needed

- Works perfectly with OnPush change detection

- Use `*ngIf="obs$ | async as value"` pattern for single subscription

Reference: [https://v16.angular.io/api/common/AsyncPipe](https://v16.angular.io/api/common/AsyncPipe)

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

### 3.4 Use Subject with takeUntil for Cleanup

**Impact: HIGH (Prevents memory leaks from subscriptions)**

When manually subscribing to observables, use a Subject with `takeUntil` to automatically unsubscribe when the component is destroyed.

**Incorrect (Manual subscription management):**

```typescript
@Component({...})
export class DataComponent implements OnInit, OnDestroy {
  private sub1!: Subscription;
  private sub2!: Subscription;

  ngOnInit() {
    this.sub1 = this.dataService.getData()
      .subscribe(data => this.processData(data));
    this.sub2 = this.eventService.events$
      .subscribe(event => this.handleEvent(event));
  }

  ngOnDestroy() {
    this.sub1.unsubscribe();  // Easy to forget one
    this.sub2.unsubscribe();
  }
}
```

**Correct (Subject with takeUntil pattern):**

```typescript
@Component({...})
export class DataComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.dataService.getData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.processData(data));

    this.eventService.events$
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => this.handleEvent(event));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

**Why it matters:**

- Single cleanup point in `ngOnDestroy`

- Can't forget to unsubscribe individual subscriptions

- Works with any number of subscriptions

- Consider base class for reuse across components

Reference: [https://rxjs.dev/api/operators/takeUntil](https://rxjs.dev/api/operators/takeUntil)

---

## 4. Template Performance

**Impact: HIGH**

Optimizing templates with *ngFor trackBy, pure pipes, and NgOptimizedImage (v15+).

### 4.1 Use NgOptimizedImage for Images (v15+)

**Impact: HIGH (LCP improvement, automatic lazy loading)**

NgOptimizedImage (available from Angular 15) enforces best practices: automatic lazy loading, priority hints, srcset generation, and preconnect warnings.

**Incorrect (Native img):**

```html
<img src="/assets/hero.jpg" alt="Hero image">
<img src="{{ user.avatar }}" alt="User avatar">
```

**Correct (NgOptimizedImage):**

```typescript
// app.module.ts
import { NgOptimizedImage } from '@angular/common';

@NgModule({
  imports: [NgOptimizedImage]
})
export class AppModule {}

// component.ts
@Component({
  template: `
    <!-- Priority image (LCP candidate) -->
    <img
      ngSrc="/assets/hero.jpg"
      alt="Hero image"
      width="1200"
      height="600"
      priority
    />

    <!-- Lazy loaded (below fold) -->
    <img
      [ngSrc]="user.avatar"
      alt="User avatar"
      width="64"
      height="64"
    />

    <!-- Fill mode -->
    <div class="image-container">
      <img
        ngSrc="/assets/product.jpg"
        alt="Product"
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  `,
  styles: [`
    .image-container {
      position: relative;
      width: 100%;
      aspect-ratio: 4/3;
    }
  `]
})
export class ProductComponent {}
```

**With image loader:**

```typescript
// app.module.ts
import { NgOptimizedImage, provideImgixLoader } from '@angular/common';

@NgModule({
  imports: [NgOptimizedImage],
  providers: [
    provideImgixLoader('https://my-site.imgix.net/')
  ]
})
export class AppModule {}
```

**For Angular 12-14 (without NgOptimizedImage):**

```typescript
// Manual optimization
@Component({
  template: `
    <!-- Manual lazy loading -->
    <img
      [src]="imageSrc"
      [alt]="imageAlt"
      loading="lazy"
      width="400"
      height="300"
    />

    <!-- Intersection Observer for more control -->
    <img
      #lazyImage
      [attr.data-src]="imageSrc"
      [alt]="imageAlt"
      width="400"
      height="300"
    />
  `
})
export class ImageComponent implements AfterViewInit {
  @ViewChild('lazyImage') lazyImage!: ElementRef;

  ngAfterViewInit() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset['src']!;
          observer.unobserve(img);
        }
      });
    });
    observer.observe(this.lazyImage.nativeElement);
  }
}
```

Reference: [https://v16.angular.io/guide/image-directive](https://v16.angular.io/guide/image-directive)

### 4.2 Use Pure Pipes for Data Transformation

**Impact: HIGH (Memoized computation, called only when input changes)**

Pure pipes are only executed when inputs change by reference. They're memoized, unlike template methods which run on every change detection cycle.

**Incorrect (Method called on every change detection):**

```typescript
@Component({
  template: `
    <div *ngFor="let product of products; trackBy: trackById">
      <span>{{ formatPrice(product.price) }}</span>
    </div>
  `
})
export class ProductListComponent {
  formatPrice(price: number): string {
    // Called on EVERY change detection cycle
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
  template: `
    <div *ngFor="let product of products; trackBy: trackById">
      <span>{{ product.price | price }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  trackById = (index: number, product: Product) => product.id;
}
```

**Why it matters:**

- Pure pipes are memoized by Angular

- Only recalculate when input reference changes

- Methods run on every change detection cycle

- Declare pipes in NgModule and add to exports

Reference: [https://v16.angular.io/guide/pipes](https://v16.angular.io/guide/pipes)

### 4.3 Use trackBy with *ngFor

**Impact: HIGH (Prevents unnecessary DOM recreation)**

Without `trackBy`, Angular recreates all DOM elements when the array reference changes. `trackBy` tells Angular how to identify items for efficient DOM reuse.

**Incorrect (DOM recreated on every update):**

```typescript
@Component({
  template: `
    <div *ngFor="let user of users">
      <app-user-card [user]="user"></app-user-card>
    </div>
  `
})
export class UserListComponent {
  users: User[] = [];

  refresh() {
    // New array = all DOM destroyed and recreated
    this.users = [...this.fetchedUsers];
  }
}
```

**Correct (trackBy enables DOM reuse):**

```typescript
@Component({
  template: `
    <div *ngFor="let user of users; trackBy: trackById">
      <app-user-card [user]="user"></app-user-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent {
  users: User[] = [];

  trackById(index: number, user: User): number {
    return user.id;
  }
}
```

**Why it matters:**

- Same IDs = DOM elements reused

- Only changed items are re-rendered

- Significant performance gain in large lists

- Track by `index` only when items have no unique ID

Reference: [https://v16.angular.io/api/common/NgForOf](https://v16.angular.io/api/common/NgForOf)

---

## 5. Dependency Injection

**Impact: MEDIUM-HIGH**

Proper DI with providedIn, InjectionToken, and factory providers.

### 5.1 Use Factory Providers for Complex Setup

**Impact: MEDIUM-HIGH (Conditional logic, dependency injection in factories)**

Factory providers allow conditional service creation with dependencies specified via the `deps` array.

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

**Correct (Factory provider with deps array):**

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

// app.module.ts
@NgModule({
  providers: [
    {
      provide: StorageService,
      useFactory: (platformId: object) => {
        return isPlatformBrowser(platformId)
          ? new LocalStorageService()
          : new MemoryStorageService();
      },
      deps: [PLATFORM_ID]
    }
  ]
})
export class AppModule {}
```

**Why it matters:**

- Use `deps` array to inject dependencies

- Conditional service creation based on environment

- Clean separation of implementations

- Easy to test each implementation independently

Reference: [https://angular.dev/guide/di/dependency-injection-providers](https://angular.dev/guide/di/dependency-injection-providers)

### 5.2 Use InjectionToken for Type-Safe Configuration

**Impact: MEDIUM-HIGH (Type safety, better testability)**

`InjectionToken` provides type-safe dependency injection for non-class values like configuration objects and feature flags.

**Incorrect (String tokens lose type safety):**

```typescript
@NgModule({
  providers: [
    { provide: 'API_URL', useValue: 'https://api.example.com' }
  ]
})
export class AppModule {}

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(@Inject('API_URL') private apiUrl: any) {}  // No type safety
}
```

**Correct (InjectionToken with @Inject):**

```typescript
// tokens.ts
export interface AppConfig {
  apiUrl: string;
  timeout: number;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('app.config');

// app.module.ts
@NgModule({
  providers: [
    {
      provide: APP_CONFIG,
      useValue: { apiUrl: 'https://api.example.com', timeout: 5000 }
    }
  ]
})
export class AppModule {}

// api.service.ts
@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(@Inject(APP_CONFIG) private config: AppConfig) {}  // Typed!
}
```

**Why it matters:**

- Full type safety with `@Inject()` decorator

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

**Correct (Tree-shakeable with constructor injection):**

```typescript
@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
  }
}

// Inject in constructor
@Component({...})
export class UserListComponent implements OnInit {
  users$!: Observable<User[]>;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.users$ = this.userService.getUsers();
  }
}
```

**Why it matters:**

- Unused services excluded from bundle

- No need to add to providers arrays

- Constructor injection is the standard pattern

- Use BehaviorSubject for service state

Reference: [https://angular.dev/guide/di](https://angular.dev/guide/di)

---

## 6. HTTP & Caching

**Impact: MEDIUM**

Class-based interceptors, TransferState for SSR, and caching strategies.

### 6.1 Use Class-Based HTTP Interceptors

**Impact: MEDIUM (Centralized request/response handling)**

Class-based interceptors centralize cross-cutting concerns like authentication and error handling, eliminating duplicated logic across services.

**Incorrect (Duplicated auth logic in services):**

```typescript
@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  getUsers(): Observable<User[]> {
    // Auth header added manually in every method
    const headers = new HttpHeaders().set(
      'Authorization', `Bearer ${this.authService.getToken()}`
    );
    return this.http.get<User[]>('/api/users', { headers });
  }
}
```

**Correct (Class-based interceptor):**

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

// app.module.ts
@NgModule({
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ]
})
export class AppModule {}

// Services are now clean
@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');  // No auth logic needed
  }
}
```

**Why it matters:**

- Centralized auth, logging, and error handling

- Services stay focused on business logic

- Use `multi: true` for multiple interceptors

- Interceptors run in order registered

Reference: [https://v16.angular.io/guide/http#intercepting-requests-and-responses](https://v16.angular.io/guide/http#intercepting-requests-and-responses)

### 6.2 Use TransferState for SSR

**Impact: MEDIUM (Eliminates duplicate requests on hydration)**

With Server-Side Rendering, HTTP requests run on the server. Without TransferState, the client repeats these requests during hydration. TransferState transfers server data to the client.

**Incorrect (Duplicate requests):**

```typescript
@Component({...})
export class ProductListComponent implements OnInit {
  products: Product[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Runs on server AND client = 2 requests
    this.http.get<Product[]>('/api/products')
      .subscribe(products => this.products = products);
  }
}
```

**Correct (Manual TransferState):**

```typescript
import { TransferState, makeStateKey } from '@angular/platform-browser';
import { isPlatformServer } from '@angular/common';

const PRODUCTS_KEY = makeStateKey<Product[]>('products');

@Component({
  template: `
    <div *ngFor="let product of products; trackBy: trackById">
      {{ product.name }}
    </div>
  `
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];

  constructor(
    private http: HttpClient,
    private transferState: TransferState,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // Check if data was transferred from server
    if (this.transferState.hasKey(PRODUCTS_KEY)) {
      this.products = this.transferState.get(PRODUCTS_KEY, []);
      this.transferState.remove(PRODUCTS_KEY);
    } else {
      this.http.get<Product[]>('/api/products').subscribe(products => {
        this.products = products;
        // Store on server for client
        if (isPlatformServer(this.platformId)) {
          this.transferState.set(PRODUCTS_KEY, products);
        }
      });
    }
  }

  trackById = (index: number, product: Product) => product.id;
}
```

**Reusable service pattern:**

```typescript
@Injectable({ providedIn: 'root' })
export class TransferStateService {
  constructor(
    private transferState: TransferState,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  fetch<T>(key: string, request: Observable<T>): Observable<T> {
    const stateKey = makeStateKey<T>(key);

    if (this.transferState.hasKey(stateKey)) {
      const data = this.transferState.get(stateKey, null as T);
      this.transferState.remove(stateKey);
      return of(data);
    }

    return request.pipe(
      tap(data => {
        if (isPlatformServer(this.platformId)) {
          this.transferState.set(stateKey, data);
        }
      })
    );
  }
}

// Usage
@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(
    private http: HttpClient,
    private transferStateService: TransferStateService
  ) {}

  getProducts(): Observable<Product[]> {
    return this.transferStateService.fetch(
      'products',
      this.http.get<Product[]>('/api/products')
    );
  }
}
```

Reference: [https://v16.angular.io/api/platform-browser/TransferState](https://v16.angular.io/api/platform-browser/TransferState)

---

## 7. Forms Optimization

**Impact: MEDIUM**

Reactive forms with typed controls (v14+) for better maintainability.

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

      <div *ngIf="userForm.controls['password']?.value !== userForm.controls['confirmPassword']?.value">
        Passwords don't match
      </div>
    </form>
  `
})
export class RegisterComponent {
  user = { email: '', password: '', confirmPassword: '' };
}
```

**Correct (Reactive form with FormBuilder):**

```typescript
@Component({
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <input formControlName="email" />
      <input type="password" formControlName="password" />
      <input type="password" formControlName="confirmPassword" />

      <div *ngIf="form.errors?.['passwordMismatch']" class="error">
        Passwords don't match
      </div>

      <button [disabled]="form.invalid">Submit</button>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent implements OnInit {
  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: [this.passwordMatchValidator]
    });
  }

  passwordMatchValidator(group: FormGroup): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }
}
```

**Why it matters:**

- Cross-field validation in component logic

- Synchronous access to form state

- Easy to test without template

- Works well with OnPush change detection

Reference: [https://v16.angular.io/guide/reactive-forms](https://v16.angular.io/guide/reactive-forms)

### 7.2 Use Typed Reactive Forms (v14+)

**Impact: MEDIUM (Compile-time type checking)**

Angular 14+ provides strictly typed reactive forms. Use `NonNullableFormBuilder` for non-nullable controls and explicit types for better IDE support.

**Incorrect (Untyped form):**

```typescript
@Component({...})
export class ProfileComponent {
  form = new FormGroup({
    name: new FormControl(''),
    email: new FormControl(''),
    age: new FormControl(0)
  });

  onSubmit() {
    const value = this.form.value;
    // value is Partial<{name: string | null, ...}>
    // Type is loose, nullable, and partial
    console.log(value.nmae); // Typo not caught
  }
}
```

**Correct (Typed form with NonNullableFormBuilder):**

```typescript
interface ProfileForm {
  name: FormControl<string>;
  email: FormControl<string>;
  age: FormControl<number>;
}

@Component({
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <input formControlName="name" />
      <input formControlName="email" type="email" />
      <input formControlName="age" type="number" />
      <button [disabled]="form.invalid">Save</button>
    </form>
  `
})
export class ProfileComponent {
  form: FormGroup<ProfileForm>;

  constructor(private fb: NonNullableFormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      age: [0, [Validators.required, Validators.min(0)]]
    });
  }

  onSubmit() {
    // getRawValue() returns fully typed, non-nullable object
    const value = this.form.getRawValue();
    // Type: { name: string; email: string; age: number }

    // Compile error: Property 'nmae' does not exist
    // console.log(value.nmae);

    this.saveProfile(value);
  }

  // Safe typed access
  get nameControl() {
    return this.form.controls.name; // FormControl<string>
  }
}
```

**Typed FormArray:**

```typescript
interface OrderForm {
  customer: FormControl<string>;
  items: FormArray<FormGroup<{
    product: FormControl<string>;
    quantity: FormControl<number>;
  }>>;
}

@Component({...})
export class OrderComponent {
  form: FormGroup<OrderForm>;

  constructor(private fb: NonNullableFormBuilder) {
    this.form = this.fb.group({
      customer: ['', Validators.required],
      items: this.fb.array([this.createItemGroup()])
    });
  }

  get itemsArray() {
    return this.form.controls.items;
  }

  createItemGroup() {
    return this.fb.group({
      product: ['', Validators.required],
      quantity: [1, Validators.min(1)]
    });
  }

  addItem() {
    this.itemsArray.push(this.createItemGroup());
  }
}
```

Reference: [https://v16.angular.io/guide/typed-forms](https://v16.angular.io/guide/typed-forms)

---

## 8. General Performance

**Impact: LOW-MEDIUM**

Web Workers and additional optimization patterns.

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

1. [https://v16.angular.io](https://v16.angular.io)
2. [https://v16.angular.io/guide/lazy-loading-ngmodules](https://v16.angular.io/guide/lazy-loading-ngmodules)
3. [https://v16.angular.io/guide/reactive-forms](https://v16.angular.io/guide/reactive-forms)
4. [https://rxjs.dev](https://rxjs.dev)
5. [https://v16.angular.io/api/common/AsyncPipe](https://v16.angular.io/api/common/AsyncPipe)
