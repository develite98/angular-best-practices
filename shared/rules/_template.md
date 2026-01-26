---
title: Rule Title Here
impact: MEDIUM
impactDescription: Brief impact description (e.g., "2-5x improvement")
tags: tag1, tag2
---

## Rule Title Here

One sentence explaining why this rule matters and what problem it solves.

**Incorrect (Brief description of anti-pattern):**

```typescript
@Component({
  selector: 'app-example',
  template: `...`
})
export class ExampleComponent {
  // Anti-pattern code here
}
```

**Correct (Brief description of best practice):**

```typescript
@Component({
  selector: 'app-example',
  template: `...`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleComponent {
  // Best practice code here
}
```

**Why it matters:**
- Key point 1
- Key point 2
- Key point 3

Reference: [Angular Documentation](https://angular.dev)
