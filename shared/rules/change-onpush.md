---
title: Use OnPush Change Detection Strategy
impact: CRITICAL
impactDescription: 2-10x fewer change detection cycles
tags: change-detection, onpush, performance
---

## Use OnPush Change Detection Strategy

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

Reference: [Angular Change Detection](https://angular.dev/best-practices/skipping-subtrees)
