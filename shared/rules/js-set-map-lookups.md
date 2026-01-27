---
title: Use Set/Map for O(1) Lookups
impact: LOW-MEDIUM
impactDescription: O(n) to O(1) lookup performance
tags: javascript, set, map, data-structures, performance
---

## Use Set/Map for O(1) Lookups

Convert arrays to Set/Map when performing repeated membership checks or key lookups. Array methods like `includes()`, `find()`, and `indexOf()` are O(n), while Set/Map operations are O(1).

**Incorrect (O(n) per lookup):**

```typescript
@Component({...})
export class UserListComponent {
  users: User[] = [];
  selectedIds: string[] = [];

  isSelected(userId: string): boolean {
    // ❌ O(n) - scans entire array for each check
    return this.selectedIds.includes(userId);
  }

  // With 1000 users and 100 selected, this is 100,000 comparisons
  // Called on every change detection cycle!
}
```

**Correct (O(1) per lookup):**

```typescript
@Component({...})
export class UserListComponent {
  users: User[] = [];
  selectedIds = new Set<string>();

  isSelected(userId: string): boolean {
    // ✅ O(1) - instant hash lookup
    return this.selectedIds.has(userId);
  }

  toggleSelection(userId: string) {
    if (this.selectedIds.has(userId)) {
      this.selectedIds.delete(userId);
    } else {
      this.selectedIds.add(userId);
    }
  }
}
```

**Filtering with Set:**

```typescript
// ❌ Bad - O(n×m) where n=items, m=allowedIds
const allowedIds = ['a', 'b', 'c', 'd', 'e'];
const filtered = items.filter(item => allowedIds.includes(item.id));

// ✅ Good - O(n) where n=items
const allowedIds = new Set(['a', 'b', 'c', 'd', 'e']);
const filtered = items.filter(item => allowedIds.has(item.id));
```

**Map for key-value lookups:**

```typescript
// ❌ Bad - O(n) find for each lookup
interface User { id: string; name: string; }
const users: User[] = [...];

function getUserName(id: string): string {
  const user = users.find(u => u.id === id); // O(n)
  return user?.name ?? 'Unknown';
}

// ✅ Good - O(1) Map lookup
const userMap = new Map(users.map(u => [u.id, u]));

function getUserName(id: string): string {
  return userMap.get(id)?.name ?? 'Unknown'; // O(1)
}
```

**Building lookup maps in services:**

```typescript
@Injectable({ providedIn: 'root' })
export class ProductService {
  private productsMap = new Map<string, Product>();

  loadProducts(): Observable<Product[]> {
    return this.http.get<Product[]>('/api/products').pipe(
      tap(products => {
        // Build map for O(1) lookups
        this.productsMap = new Map(products.map(p => [p.id, p]));
      })
    );
  }

  getProductById(id: string): Product | undefined {
    return this.productsMap.get(id); // O(1) instead of array.find()
  }

  getProductsByIds(ids: string[]): Product[] {
    return ids
      .map(id => this.productsMap.get(id))
      .filter((p): p is Product => p !== undefined);
  }
}
```

**Deduplication:**

```typescript
// ❌ Bad - O(n²) with indexOf
const unique = items.filter((item, index) =>
  items.indexOf(item) === index
);

// ✅ Good - O(n) with Set
const unique = [...new Set(items)];

// For objects, dedupe by key
const uniqueById = [...new Map(items.map(i => [i.id, i])).values()];
```

**When to use which:**

| Data Structure | Use Case |
|----------------|----------|
| `Set` | Unique values, membership checks |
| `Map` | Key-value pairs, lookups by ID |
| `Array` | Ordered data, iteration, small collections (<100 items) |

**Performance comparison:**

```
Array.includes() on 10,000 items: ~0.5ms per lookup
Set.has() on 10,000 items: ~0.001ms per lookup (500× faster)
```

**Why it matters:**
- Change detection may call methods many times per second
- With large datasets, O(n) lookups become noticeable bottlenecks
- Set/Map use hash tables for constant-time operations

Reference: [MDN Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
