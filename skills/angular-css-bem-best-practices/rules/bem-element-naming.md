---
title: Use Correct BEM Element Naming Conventions
impact: HIGH
impactDescription: Consistent naming enables predictable, searchable, and self-documenting styles
tags: bem, css, scss, sass, naming, element, convention, readability
---

## Use Correct BEM Element Naming Conventions

BEM elements use double underscores (`__`) to separate the Block from the Element. Element names must be descriptive, use kebab-case, and describe **what the element is** — not what it looks like or where it sits in the DOM hierarchy.

**Incorrect (Poor element naming):**

```typescript
// ❌ Generic names, visual names, positional names
@Component({
  selector: 'app-pricing-card',
  template: `
    <div class="pricing-card">
      <div class="pricing-card__top">...</div>           <!-- ❌ positional -->
      <div class="pricing-card__div1">...</div>           <!-- ❌ meaningless -->
      <span class="pricing-card__red-text">Limited</span> <!-- ❌ visual -->
      <div class="pricing-card__wrapper">                 <!-- ❌ structural noise -->
        <span class="pricing-card__inner">$99</span>      <!-- ❌ structural noise -->
      </div>
      <ul class="pricing-card__ul">                       <!-- ❌ HTML tag name -->
        <li class="pricing-card__li">Feature 1</li>       <!-- ❌ HTML tag name -->
      </ul>
      <button class="pricing-card__btn-1">Buy</button>    <!-- ❌ numbered -->
    </div>
  `
})
export class PricingCardComponent {}
```

```css
/* ❌ CSS - Non-descriptive element names */
.pricing-card__top { /* styles */ }
.pricing-card__div1 { /* styles */ }
.pricing-card__red-text { color: red; }
.pricing-card__wrapper { display: flex; }
.pricing-card__inner { /* styles */ }
.pricing-card__ul { list-style: none; }
.pricing-card__li { /* styles */ }
.pricing-card__btn-1 { background: blue; }
```

```scss
// ❌ SCSS - Non-descriptive element names
.pricing-card {
  &__top { /* styles */ }
  &__div1 { /* styles */ }
  &__red-text { color: red; }
  &__wrapper { display: flex; }
  &__inner { /* styles */ }
  &__ul { list-style: none; }
  &__li { /* styles */ }
  &__btn-1 { background: blue; }
}
```

```sass
// ❌ SASS - Non-descriptive element names
.pricing-card
  &__top
    /* styles */
  &__div1
    /* styles */
  &__red-text
    color: red
  &__wrapper
    display: flex
  &__inner
    /* styles */
  &__ul
    list-style: none
  &__li
    /* styles */
  &__btn-1
    background: blue
```

**Correct (Semantic, descriptive element names):**

```typescript
// ✅ Names describe WHAT the element IS, not how it looks
@Component({
  selector: 'app-pricing-card',
  template: `
    <div class="pricing-card">
      <div class="pricing-card__header">...</div>
      <div class="pricing-card__plan-name">Pro Plan</div>
      <span class="pricing-card__badge">Limited</span>
      <div class="pricing-card__price">
        <span class="pricing-card__amount">$99</span>
        <span class="pricing-card__period">/month</span>
      </div>
      <ul class="pricing-card__feature-list">
        <li class="pricing-card__feature">Feature 1</li>
      </ul>
      <button class="pricing-card__cta">Buy Now</button>
    </div>
  `
})
export class PricingCardComponent {}
```

```css
/* ✅ CSS - Descriptive, semantic element names */
.pricing-card { border: 1px solid #e0e0e0; }
.pricing-card__header { border-bottom: 1px solid #f0f0f0; }
.pricing-card__plan-name { font-weight: bold; }
.pricing-card__badge { color: #e74c3c; font-weight: 600; }
.pricing-card__price { display: flex; align-items: baseline; }
.pricing-card__amount { font-weight: bold; }
.pricing-card__period { color: #999; }
.pricing-card__feature-list { list-style: none; }
.pricing-card__feature { border-bottom: 1px solid #f5f5f5; }
.pricing-card__cta { width: 100%; background: #3498db; color: white; border: none; cursor: pointer; }
```

```scss
// ✅ SCSS - Descriptive, semantic element names
.pricing-card {
  border: 1px solid #e0e0e0;

  &__header       { border-bottom: 1px solid #f0f0f0; }
  &__plan-name    { font-weight: bold; }
  &__badge        { color: #e74c3c; font-weight: 600; }
  &__price        { display: flex; align-items: baseline; }
  &__amount       { font-weight: bold; }
  &__period       { color: #999; }
  &__feature-list { list-style: none; }
  &__feature      { border-bottom: 1px solid #f5f5f5; }
  &__cta          { width: 100%; background: #3498db; color: white; border: none; cursor: pointer; }
}
```

```sass
// ✅ SASS - Descriptive, semantic element names
.pricing-card
  border: 1px solid #e0e0e0

  &__header
    border-bottom: 1px solid #f0f0f0
  &__plan-name
    font-weight: bold
  &__badge
    color: #e74c3c
    font-weight: 600
  &__price
    display: flex
    align-items: baseline
  &__amount
    font-weight: bold
  &__period
    color: #999
  &__feature-list
    list-style: none
  &__feature
    border-bottom: 1px solid #f5f5f5
  &__cta
    width: 100%
    background: #3498db
    color: white
    border: none
    cursor: pointer
```

**Naming rules:**

| Rule | Bad | Good |
|------|-----|------|
| No positional names | `__top`, `__left`, `__bottom` | `__header`, `__sidebar`, `__footer` |
| No visual names | `__red-text`, `__big-font` | `__error`, `__title` |
| No HTML tag names | `__ul`, `__li`, `__div` | `__feature-list`, `__feature` |
| No structural noise | `__wrapper`, `__inner`, `__container` | `__price`, `__content` |
| No numbered names | `__btn-1`, `__item-2` | `__cta`, `__primary-action` |
| Use kebab-case | `__featureList`, `__planName` | `__feature-list`, `__plan-name` |

**Why it matters:**
- Semantic names are self-documenting — you understand the UI without seeing the template
- Renaming a visual style (red to blue) doesn't require renaming CSS classes
- Kebab-case is consistent with Angular component selectors and CSS conventions
- Descriptive names make searching the codebase predictable (Ctrl+Shift+F for `pricing-card__cta`)
- New developers understand the component structure by reading class names alone

Reference: [BEM Naming Convention](https://getbem.com/naming/)
