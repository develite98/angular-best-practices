---
title: Avoid Function Calls in Templates
impact: CRITICAL
impactDescription: Functions run on every change detection cycle, causing severe performance issues
tags: template, performance, change-detection, pipes
---

## Avoid Function Calls in Templates

Calling functions directly in templates forces Angular to execute them on every change detection cycle, even if inputs haven't changed. This can cause hundreds of unnecessary executions per second.

**Incorrect (Function called on every cycle):**

```typescript
@Component({
  selector: 'app-user-card',
  template: `
    <div class="user">
      <!-- getFullName() runs 100+ times on scroll, clicks, any event -->
      <h2>{{ getFullName() }}</h2>
      <span>{{ calculateAge(user.birthDate) }}</span>
      <p>{{ formatAddress(user.address) }}</p>
    </div>
  `
})
export class UserCardComponent {
  @Input() user!: User;

  getFullName(): string {
    console.log('getFullName called'); // Logs hundreds of times!
    return `${this.user.firstName} ${this.user.lastName}`;
  }

  calculateAge(birthDate: Date): number {
    const today = new Date();
    return today.getFullYear() - birthDate.getFullYear();
  }

  formatAddress(address: Address): string {
    return `${address.street}, ${address.city}`;
  }
}
```

**Correct (Use pipes or computed values):**

```typescript
// Option 1: Pure Pipe (recommended for reusable transformations)
@Pipe({ name: 'fullName', standalone: true, pure: true })
export class FullNamePipe implements PipeTransform {
  transform(user: User): string {
    return `${user.firstName} ${user.lastName}`;
  }
}

@Pipe({ name: 'age', standalone: true, pure: true })
export class AgePipe implements PipeTransform {
  transform(birthDate: Date): number {
    return new Date().getFullYear() - birthDate.getFullYear();
  }
}

@Component({
  selector: 'app-user-card',
  template: `
    <div class="user">
      <!-- Pipes only run when input changes -->
      <h2>{{ user | fullName }}</h2>
      <span>{{ user.birthDate | age }}</span>
      <p>{{ user.address.street }}, {{ user.address.city }}</p>
    </div>
  `,
  imports: [FullNamePipe, AgePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserCardComponent {
  @Input() user!: User;
}

// Option 2: Computed signal (Angular 16+)
@Component({
  selector: 'app-user-card',
  template: `
    <div class="user">
      <h2>{{ fullName() }}</h2>
      <span>{{ age() }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserCardComponent {
  user = input.required<User>();

  fullName = computed(() =>
    `${this.user().firstName} ${this.user().lastName}`
  );

  age = computed(() =>
    new Date().getFullYear() - this.user().birthDate.getFullYear()
  );
}
```

**Why it matters:**
- Pure pipes are memoized - only re-execute when inputs change by reference
- Computed signals track dependencies automatically
- Without this, a list of 100 items with 3 functions = 300+ calls per change detection
- Common symptom: app feels "janky" or slow during scrolling/typing

**When functions ARE acceptable:**
- Event handlers: `(click)="handleClick()"` - only called on actual events
- Template reference variables: `#input` with `input.value`

Reference: [Angular Pipes](https://angular.dev/guide/pipes)
