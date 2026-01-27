---
title: Use Smart and Dumb Component Pattern
impact: MEDIUM
impactDescription: Separation of concerns improves testability, reusability, and maintainability
tags: architecture, components, smart, dumb, presentational, container, patterns
---

## Use Smart and Dumb Component Pattern

Separate components into "Smart" (container) components that handle logic/data and "Dumb" (presentational) components that only render UI. This improves testability, reusability, and makes change detection more efficient.

**Incorrect (God component doing everything):**

```typescript
// ❌ One component handles data, logic, AND presentation
@Component({
  selector: 'app-user-dashboard',
  template: `
    <div class="dashboard">
      <h1>Welcome, {{ user?.name }}</h1>
      @if (loading) {
        <div class="spinner">Loading...</div>
      }
      @for (order of orders; track order.id) {
        <div class="order-card" [class.urgent]="isUrgent(order)">
          <h3>Order #{{ order.id }}</h3>
          <p>{{ order.date | date }}</p>
          <p>{{ formatPrice(order.total) }}</p>
          <button (click)="cancelOrder(order)">Cancel</button>
          <button (click)="viewDetails(order)">Details</button>
        </div>
      }
      <form [formGroup]="filterForm" (ngSubmit)="applyFilters()">
        <!-- complex filter form -->
      </form>
    </div>
  `
})
export class UserDashboardComponent implements OnInit {
  user: User | null = null;
  orders: Order[] = [];
  loading = true;
  filterForm: FormGroup;

  constructor(
    private userService: UserService,
    private orderService: OrderService,
    private router: Router,
    private fb: FormBuilder,
    private analytics: AnalyticsService
  ) {
    this.filterForm = this.fb.group({...});
  }

  ngOnInit() {
    this.loadUser();
    this.loadOrders();
  }

  loadUser() { /* ... */ }
  loadOrders() { /* ... */ }
  isUrgent(order: Order): boolean { /* ... */ }
  formatPrice(price: number): string { /* ... */ }
  cancelOrder(order: Order) { /* ... */ }
  viewDetails(order: Order) { /* ... */ }
  applyFilters() { /* ... */ }
  // 500+ lines of mixed concerns
}
```

**Correct (Smart + Dumb separation):**

```typescript
// ✅ SMART Component (Container) - handles data and logic
@Component({
  selector: 'app-user-dashboard',
  template: `
    <app-dashboard-header
      [user]="user()"
      [loading]="loading()"
    />

    <app-order-filters
      [initialFilters]="filters()"
      (filtersChange)="onFiltersChange($event)"
    />

    <app-order-list
      [orders]="filteredOrders()"
      [loading]="loading()"
      (cancel)="onCancelOrder($event)"
      (viewDetails)="onViewDetails($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDashboardComponent {
  private userService = inject(UserService);
  private orderService = inject(OrderService);
  private router = inject(Router);

  // State
  user = signal<User | null>(null);
  orders = signal<Order[]>([]);
  loading = signal(true);
  filters = signal<OrderFilters>({});

  // Derived state
  filteredOrders = computed(() =>
    this.applyFilters(this.orders(), this.filters())
  );

  constructor() {
    this.loadData();
  }

  private loadData() {
    forkJoin({
      user: this.userService.getCurrentUser(),
      orders: this.orderService.getOrders()
    }).subscribe({
      next: ({ user, orders }) => {
        this.user.set(user);
        this.orders.set(orders);
        this.loading.set(false);
      }
    });
  }

  onFiltersChange(filters: OrderFilters) {
    this.filters.set(filters);
  }

  onCancelOrder(order: Order) {
    this.orderService.cancel(order.id).subscribe(() => {
      this.orders.update(orders =>
        orders.filter(o => o.id !== order.id)
      );
    });
  }

  onViewDetails(order: Order) {
    this.router.navigate(['/orders', order.id]);
  }

  private applyFilters(orders: Order[], filters: OrderFilters): Order[] {
    return orders.filter(o => /* filter logic */);
  }
}
```

```typescript
// ✅ DUMB Component (Presentational) - only renders UI
@Component({
  selector: 'app-order-list',
  template: `
    @if (loading()) {
      <div class="spinner">Loading orders...</div>
    } @else if (orders().length === 0) {
      <div class="empty">No orders found</div>
    } @else {
      @for (order of orders(); track order.id) {
        <app-order-card
          [order]="order"
          (cancel)="cancel.emit(order)"
          (viewDetails)="viewDetails.emit(order)"
        />
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderListComponent {
  // Inputs only - no injected services
  orders = input.required<Order[]>();
  loading = input(false);

  // Outputs only - delegates actions to parent
  cancel = output<Order>();
  viewDetails = output<Order>();
}
```

```typescript
// ✅ DUMB Component - single order card
@Component({
  selector: 'app-order-card',
  template: `
    <div class="order-card" [class.urgent]="isUrgent()">
      <h3>Order #{{ order().id }}</h3>
      <p>{{ order().date | date }}</p>
      <p>{{ order().total | currency }}</p>
      <button (click)="cancel.emit()">Cancel</button>
      <button (click)="viewDetails.emit()">Details</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderCardComponent {
  order = input.required<Order>();

  cancel = output<void>();
  viewDetails = output<void>();

  // Pure computation, no side effects
  isUrgent = computed(() => {
    const daysOld = this.getDaysOld(this.order().date);
    return this.order().status === 'pending' && daysOld > 3;
  });

  private getDaysOld(date: Date): number {
    return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  }
}
```

---

**Characteristics:**

| Aspect | Smart (Container) | Dumb (Presentational) |
|--------|-------------------|----------------------|
| Services | Injects services | No services |
| State | Manages state | Receives via @Input |
| Side effects | Makes HTTP calls, navigates | Emits events via @Output |
| Reusability | App-specific | Highly reusable |
| Testing | Integration tests | Unit tests (easy) |
| Change Detection | May use Default | Always use OnPush |

---

**File structure recommendation:**

```
features/
└── orders/
    ├── containers/                  # Smart components
    │   └── order-dashboard/
    │       └── order-dashboard.component.ts
    ├── components/                  # Dumb components
    │   ├── order-list/
    │   │   └── order-list.component.ts
    │   ├── order-card/
    │   │   └── order-card.component.ts
    │   └── order-filters/
    │       └── order-filters.component.ts
    ├── services/
    │   └── order.service.ts
    └── orders.routes.ts
```

**Why it matters:**
- Dumb components are easy to unit test (no mocking services)
- Dumb components are reusable across features
- OnPush works perfectly with input-only components
- Clear data flow makes debugging easier
- Smart components are easier to integration test

Reference: [Angular Component Architecture](https://angular.dev/guide/components)
