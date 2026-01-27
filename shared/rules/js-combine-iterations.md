---
title: Combine Multiple Array Iterations
impact: LOW-MEDIUM
impactDescription: Reduces array iterations from N to 1
tags: javascript, arrays, loops, performance, iterations
---

## Combine Multiple Array Iterations

Multiple `.filter()`, `.map()`, or `.reduce()` calls iterate the array multiple times. When processing the same array for different purposes, combine into a single loop.

**Incorrect (3 iterations over same array):**

```typescript
@Component({...})
export class UserStatsComponent {
  users: User[] = [];

  getStats() {
    // ❌ Iterates users array 3 times
    const admins = this.users.filter(u => u.role === 'admin');
    const activeUsers = this.users.filter(u => u.isActive);
    const totalAge = this.users.reduce((sum, u) => sum + u.age, 0);

    return { admins, activeUsers, averageAge: totalAge / this.users.length };
  }
}
```

**Correct (1 iteration):**

```typescript
@Component({...})
export class UserStatsComponent {
  users: User[] = [];

  getStats() {
    // ✅ Single iteration, multiple results
    const admins: User[] = [];
    const activeUsers: User[] = [];
    let totalAge = 0;

    for (const user of this.users) {
      if (user.role === 'admin') admins.push(user);
      if (user.isActive) activeUsers.push(user);
      totalAge += user.age;
    }

    return { admins, activeUsers, averageAge: totalAge / this.users.length };
  }
}
```

**With reduce for complex aggregations:**

```typescript
// ❌ Bad - 4 iterations
const total = orders.reduce((sum, o) => sum + o.total, 0);
const count = orders.length;
const pending = orders.filter(o => o.status === 'pending').length;
const shipped = orders.filter(o => o.status === 'shipped').length;

// ✅ Good - 1 iteration with reduce
const stats = orders.reduce(
  (acc, order) => ({
    total: acc.total + order.total,
    count: acc.count + 1,
    pending: acc.pending + (order.status === 'pending' ? 1 : 0),
    shipped: acc.shipped + (order.status === 'shipped' ? 1 : 0)
  }),
  { total: 0, count: 0, pending: 0, shipped: 0 }
);
```

**Map and filter in one pass:**

```typescript
// ❌ Bad - 2 iterations
const activeUserNames = users
  .filter(u => u.isActive)
  .map(u => u.name);

// ✅ Good - 1 iteration with flatMap or reduce
const activeUserNames = users.flatMap(u =>
  u.isActive ? [u.name] : []
);

// Or with reduce
const activeUserNames = users.reduce<string[]>(
  (names, u) => u.isActive ? [...names, u.name] : names,
  []
);

// Or simple loop (fastest)
const activeUserNames: string[] = [];
for (const u of users) {
  if (u.isActive) activeUserNames.push(u.name);
}
```

**Grouping data:**

```typescript
// ❌ Bad - multiple filter calls for each group
const byStatus = {
  pending: orders.filter(o => o.status === 'pending'),
  processing: orders.filter(o => o.status === 'processing'),
  shipped: orders.filter(o => o.status === 'shipped'),
  delivered: orders.filter(o => o.status === 'delivered')
};

// ✅ Good - single iteration grouping
const byStatus = orders.reduce<Record<string, Order[]>>(
  (groups, order) => {
    const status = order.status;
    groups[status] = groups[status] || [];
    groups[status].push(order);
    return groups;
  },
  {}
);

// ✅ Even better with Object.groupBy (ES2024)
const byStatus = Object.groupBy(orders, order => order.status);
```

**In computed signals:**

```typescript
@Component({...})
export class OrderDashboardComponent {
  orders = input.required<Order[]>();

  // ❌ Bad - 3 computed = 3 iterations when orders change
  pendingOrders = computed(() =>
    this.orders().filter(o => o.status === 'pending')
  );
  totalRevenue = computed(() =>
    this.orders().reduce((sum, o) => sum + o.total, 0)
  );
  orderCount = computed(() => this.orders().length);

  // ✅ Good - 1 computed = 1 iteration
  stats = computed(() => {
    const orders = this.orders();
    const pending: Order[] = [];
    let revenue = 0;

    for (const order of orders) {
      if (order.status === 'pending') pending.push(order);
      revenue += order.total;
    }

    return {
      pending,
      revenue,
      count: orders.length
    };
  });
}
```

**When multiple iterations ARE okay:**

```typescript
// ✅ OK - small arrays (under 100 items)
const filtered = smallArray.filter(x => x.active).map(x => x.name);

// ✅ OK - readability matters more than micro-optimization
// When array is small and code is read often
const adults = users.filter(u => u.age >= 18);
const adultNames = adults.map(u => u.name);
```

**Why it matters:**
- 10,000 items × 3 iterations = 30,000 operations
- 10,000 items × 1 iteration = 10,000 operations (3× fewer)
- Each iteration has function call overhead
- Matters most for large datasets or frequent recalculations

Reference: [JavaScript Array Performance](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
