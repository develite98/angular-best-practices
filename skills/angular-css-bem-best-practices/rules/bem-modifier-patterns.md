---
title: Use BEM Modifiers Correctly for State and Variants
impact: HIGH
impactDescription: Proper modifiers eliminate specificity issues and enable predictable variant styling
tags: bem, css, scss, sass, modifier, state, variants, specificity
---

## Use BEM Modifiers Correctly for State and Variants

BEM modifiers use double hyphens (`--`) to express variants and states. Always apply modifiers alongside the base class, never as standalone classes. In Angular, bind modifiers using `[class]` bindings or `[ngClass]` for dynamic states.

**Incorrect (Wrong modifier patterns):**

```typescript
// ❌ Using standalone modifier classes without base class
// ❌ Using conditional CSS with unrelated class names
@Component({
  selector: 'app-alert',
  template: `
    <!-- ❌ Modifier without base class -->
    <div class="alert--error">
      <span class="alert__icon red-icon">!</span>
      <p class="alert__message bold">{{ message }}</p>
    </div>

    <!-- ❌ Using separate unrelated classes for states -->
    <button class="btn active highlighted large">Submit</button>
  `
})
export class AlertComponent {}
```

```css
/* ❌ CSS - Modifier without base class, utility-style classes */
.alert--error { border: 2px solid red; background: #ffe0e0; }
.red-icon { color: red; }
.bold { font-weight: bold; }
.active { background: blue; }
.highlighted { box-shadow: 0 0 5px gold; }
```

```scss
// ❌ SCSS - Nesting modifiers inside elements (creates wrong selectors)
.alert {
  border: 1px solid #ccc;

  &__icon {
    // ❌ This generates .alert__icon--error, NOT .alert--error .alert__icon
    &--error { color: red; }
  }

  &__message {
    // ❌ Mixing utility classes with BEM
    &.bold { font-weight: bold; }
  }
}
```

```sass
// ❌ SASS - Same nesting problem
.alert
  border: 1px solid #ccc

  &__icon
    // ❌ Generates .alert__icon--error
    &--error
      color: red

  &__message
    &.bold
      font-weight: bold
```

**Correct (Proper BEM modifier usage):**

```typescript
// ✅ Modifier always applied alongside base class
// ✅ Dynamic modifiers via Angular class binding
@Component({
  selector: 'app-alert',
  template: `
    <div class="alert" [class.alert--error]="type() === 'error'"
                        [class.alert--success]="type() === 'success'"
                        [class.alert--warning]="type() === 'warning'">
      <span class="alert__icon">
        {{ type() === 'error' ? '✕' : type() === 'success' ? '✓' : '⚠' }}
      </span>
      <p class="alert__message">{{ message() }}</p>
      <button class="alert__dismiss" (click)="dismiss.emit()">×</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertComponent {
  type = input<'error' | 'success' | 'warning'>('error');
  message = input.required<string>();
  dismiss = output<void>();
}
```

```css
/* ✅ CSS - Block modifier changes block and child elements */
.alert { display: flex; align-items: center; border: 1px solid #ccc; background: #f9f9f9; }
.alert__icon { color: #666; }
.alert__message { flex: 1; margin: 0; }
.alert__dismiss { background: none; border: none; cursor: pointer; color: #999; }

/* Block modifiers — change the block and its elements */
.alert--error { border-color: #e74c3c; background: #fdf0ef; }
.alert--error .alert__icon { color: #e74c3c; }

.alert--success { border-color: #27ae60; background: #edfcf2; }
.alert--success .alert__icon { color: #27ae60; }

.alert--warning { border-color: #f39c12; background: #fef9ed; }
.alert--warning .alert__icon { color: #f39c12; }
```

```scss
// ✅ SCSS - Block modifiers with clean nesting
.alert {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  background: #f9f9f9;

  &__icon { color: #666; }
  &__message { flex: 1; margin: 0; }
  &__dismiss { background: none; border: none; cursor: pointer; color: #999; }

  // Block modifiers
  &--error {
    border-color: #e74c3c;
    background: #fdf0ef;
    .alert__icon { color: #e74c3c; }
  }

  &--success {
    border-color: #27ae60;
    background: #edfcf2;
    .alert__icon { color: #27ae60; }
  }

  &--warning {
    border-color: #f39c12;
    background: #fef9ed;
    .alert__icon { color: #f39c12; }
  }
}
```

```sass
// ✅ SASS - Block modifiers with clean nesting
.alert
  display: flex
  align-items: center
  border: 1px solid #ccc
  background: #f9f9f9

  &__icon
    color: #666
  &__message
    flex: 1
    margin: 0
  &__dismiss
    background: none
    border: none
    cursor: pointer
    color: #999

  // Block modifiers
  &--error
    border-color: #e74c3c
    background: #fdf0ef
    .alert__icon
      color: #e74c3c

  &--success
    border-color: #27ae60
    background: #edfcf2
    .alert__icon
      color: #27ae60

  &--warning
    border-color: #f39c12
    background: #fef9ed
    .alert__icon
      color: #f39c12
```

**Modifier cheat sheet:**

| Type | Syntax | Example | Use For |
|------|--------|---------|---------|
| Block modifier | `.block--modifier` | `.alert--error` | Variant that changes the whole block |
| Element modifier | `.block__el--modifier` | `.btn__icon--large` | Variant for a single element |
| Boolean modifier | `.block--active` | `.nav--collapsed` | On/off states |
| Key-value modifier | `.block--size-large` | `.card--theme-dark` | Named variants |

**Why it matters:**
- Modifiers always accompany the base class, ensuring base styles are always applied
- No specificity wars — `.alert--error` (one class) vs `.alert.error` (two classes) have different specificity
- Angular's `[class.x]` binding is the idiomatic way to toggle BEM modifiers
- Predictable override behavior: modifiers always build on top of the base
- Easy to search: `alert--error` finds exactly the error variant

Reference: [BEM Modifiers](https://getbem.com/naming/)
