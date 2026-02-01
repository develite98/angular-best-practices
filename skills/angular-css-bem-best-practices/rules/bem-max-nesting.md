---
title: Maximum 2 Levels of BEM Scope in a Component
impact: CRITICAL
impactDescription: Prevents unreadable selectors and signals when to decompose components
tags: bem, css, scss, sass, nesting, depth, specificity, maintainability
---

## Maximum 2 Levels of BEM Scope in a Component

A component's BEM structure must never exceed 2 levels: Block and Element (`.block__element`). If you find yourself needing a grandchild element (`.block__parent__child`), it is a clear signal to extract a child component. BEM elements are always direct children of the Block — never nested under other elements.

**Incorrect (Over 2 levels of BEM depth):**

```typescript
// ❌ Too many levels — "card__header__title__icon" is 4 levels deep
@Component({
  selector: 'app-product-card',
  template: `
    <div class="product-card">
      <div class="product-card__header">
        <div class="product-card__header__title">
          <span class="product-card__header__title__icon">★</span>
          <h3 class="product-card__header__title__text">{{ product.name }}</h3>
        </div>
        <div class="product-card__header__actions">
          <button class="product-card__header__actions__btn">Buy</button>
        </div>
      </div>
      <div class="product-card__body">
        <div class="product-card__body__description">
          <p class="product-card__body__description__text">{{ product.desc }}</p>
        </div>
      </div>
    </div>
  `
})
export class ProductCardComponent {}
```

```css
/* ❌ CSS - Deeply nested BEM selectors are unreadable */
.product-card__header__title__icon { color: gold; }
.product-card__header__title__text { font-weight: bold; }
.product-card__header__actions__btn { background: blue; }
.product-card__body__description__text { color: #666; }
```

```scss
// ❌ SCSS - Nesting & creates deeply chained selectors
.product-card {
  &__header {
    &__title {
      &__icon { color: gold; }
      &__text { font-weight: bold; }
    }
    &__actions {
      &__btn { background: blue; }
    }
  }
  &__body {
    &__description {
      &__text { color: #666; }
    }
  }
}
```

```sass
// ❌ SASS - Same problem in indented syntax
.product-card
  &__header
    &__title
      &__icon
        color: gold
      &__text
        font-weight: bold
    &__actions
      &__btn
        background: blue
  &__body
    &__description
      &__text
        color: #666
```

**Correct (Flat BEM — max 2 levels: Block + Element):**

```typescript
// ✅ All elements are direct children of the block — flat structure
@Component({
  selector: 'app-product-card',
  template: `
    <div class="product-card">
      <div class="product-card__header">
        <span class="product-card__icon">★</span>
        <h3 class="product-card__title">{{ product.name }}</h3>
        <button class="product-card__action">Buy</button>
      </div>
      <div class="product-card__body">
        <p class="product-card__description">{{ product.desc }}</p>
      </div>
    </div>
  `
})
export class ProductCardComponent {}
```

```css
/* ✅ CSS - Flat BEM selectors, easy to read and maintain */
.product-card { border: 1px solid #eee; }
.product-card__header { display: flex; align-items: center; }
.product-card__icon { color: gold; }
.product-card__title { font-weight: bold; flex: 1; }
.product-card__action { background: blue; color: white; border: none; }
.product-card__body { /* styles */ }
.product-card__description { color: #666; line-height: 1.5; }
```

```scss
// ✅ SCSS - Single level of & nesting, all elements flat under block
.product-card {
  border: 1px solid #eee;

  &__header { display: flex; align-items: center; }
  &__icon { color: gold; }
  &__title { font-weight: bold; flex: 1; }
  &__action { background: blue; color: white; border: none; }
  &__body { /* styles */ }
  &__description { color: #666; line-height: 1.5; }
}
```

```sass
// ✅ SASS - Single level of & nesting, all elements flat under block
.product-card
  border: 1px solid #eee

  &__header
    display: flex
    align-items: center
  &__icon
    color: gold
  &__title
    font-weight: bold
    flex: 1
  &__action
    background: blue
    color: white
    border: none
  &__body
    /* styles */
  &__description
    color: #666
    line-height: 1.5
```

**The rule visualized:**

```
✅ Allowed (2 levels max):
.block
.block__element
.block__element--modifier
.block--modifier

❌ Forbidden (3+ levels):
.block__element__subelement
.block__parent__child__grandchild
```

**Why it matters:**
- `.block__parent__child` selectors are unreadable and fragile
- Flat BEM elements decouple CSS from HTML nesting — you can restructure the DOM without renaming classes
- If you need a third level, it means your component does too much — extract a child component
- Flat selectors have consistent specificity (single class), preventing specificity wars
- Searching for `.product-card__title` is easy; searching for `.product-card__header__title__text` is not

Reference: [BEM FAQ - Should I use nested elements?](https://en.bem.info/methodology/faq/#why-does-bem-not-recommend-using-elements-within-elements-block__elem1__elem2)
