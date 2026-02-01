# Angular + BEM CSS Best Practices

**Version 1.0.0**
Community
January 2026

> **Note:**
> This document is for AI agents and LLMs to follow when writing, reviewing,
> or refactoring Angular component styles. Enforces BEM methodology with
> Angular's component architecture for CSS, SCSS, and SASS.

---

## Abstract

A methodology guide for combining Angular's component architecture with BEM (Block Element Modifier) CSS naming convention to create reusable components and enable code sharing in front-end development. Contains 6 rules with bad/good examples in CSS, SCSS, and SASS.

---

## When to Apply

Reference these guidelines when:
- Writing CSS/SCSS/SASS for Angular components
- Naming CSS classes in Angular templates
- Reviewing component styles for consistency
- Deciding whether to split a component based on styling complexity
- Setting up CSS architecture for a new Angular project
- Refactoring existing styles to follow BEM methodology

## Core Principles

- **1 Component = 1 BEM Block** — The block name matches the component selector
- **Max 2 Levels** — Only `Block` and `Block__Element`, never `Block__Element__SubElement`
- **Split When Deep** — If you need a third level, extract a child component
- **Flat Selectors** — No descendant, child, or tag-qualified selectors
- **Semantic Names** — Element names describe _what_, not _how_ or _where_
- **Modifiers for Variants** — Use `--modifier` for states and variants, always with the base class

## Rule Categories by Priority

| Priority | Rule | Impact | File |
|----------|------|--------|------|
| 1 | Block = Component Selector | CRITICAL | `bem-block-selector` |
| 2 | Max 2 Levels of Nesting | CRITICAL | `bem-max-nesting` |
| 3 | Split Child Components | CRITICAL | `bem-split-components` |
| 4 | Element Naming Conventions | HIGH | `bem-element-naming` |
| 5 | Modifier Patterns | HIGH | `bem-modifier-patterns` |
| 6 | No Cascading Selectors | HIGH | `bem-no-cascading` |

## Quick Reference

### 1. Block = Component Selector (CRITICAL)

- `bem-block-selector` - BEM block name must match the Angular component selector (minus prefix)

### 2. Maximum 2 Levels (CRITICAL)

- `bem-max-nesting` - Never nest beyond `.block__element` — no `.block__element__subelement`

### 3. Split Child Components (CRITICAL)

- `bem-split-components` - Extract child components when BEM depth would exceed 2 levels

### 4. Element Naming (HIGH)

- `bem-element-naming` - Use semantic, descriptive kebab-case names for BEM elements

### 5. Modifier Patterns (HIGH)

- `bem-modifier-patterns` - Use `--modifier` correctly for states and variants with Angular class bindings

### 6. No Cascading (HIGH)

- `bem-no-cascading` - Avoid descendant, child, and tag-qualified selectors — keep BEM flat

## BEM Cheat Sheet

```
.block                    → Component root (matches selector)
.block__element           → Child part of the component
.block--modifier          → Variant of the entire block
.block__element--modifier → Variant of a single element

✅ .user-card
✅ .user-card__avatar
✅ .user-card--featured
✅ .user-card__name--highlighted

❌ .user-card__header__title       (3 levels)
❌ .user-card .user-card__avatar   (descendant selector)
❌ div.user-card                   (tag-qualified)
```

---

## Rule 1: BEM Block Must Be the Component Selector

**Impact: CRITICAL** — Consistent naming eliminates selector conflicts and enables component-scoped styling

The BEM Block name must match the Angular component selector. This creates a 1:1 mapping between components and BEM blocks, eliminating naming conflicts and making the relationship between markup and styles immediately obvious.

**Incorrect (Block name differs from component selector):**

```typescript
// ❌ Component selector is 'app-user-profile' but BEM block is 'profile-card'
@Component({
  selector: 'app-user-profile',
  template: `
    <div class="profile-card">
      <div class="profile-card__avatar">...</div>
      <div class="profile-card__name">{{ name }}</div>
    </div>
  `
})
export class UserProfileComponent {}
```

```css
/* ❌ CSS - Block name doesn't match selector */
.profile-card {
  display: flex;
  padding: 16px;
}
.profile-card__avatar {
  width: 48px;
  height: 48px;
}
.profile-card__name {
  font-weight: bold;
}
```

```scss
// ❌ SCSS - Block name doesn't match selector
.profile-card {
  display: flex;
  padding: 16px;

  &__avatar {
    width: 48px;
    height: 48px;
  }

  &__name {
    font-weight: bold;
  }
}
```

```sass
// ❌ SASS - Block name doesn't match selector
.profile-card
  display: flex
  padding: 16px

  &__avatar
    width: 48px
    height: 48px

  &__name
    font-weight: bold
```

**Correct (Block name matches component selector):**

```typescript
// ✅ Component selector is 'app-user-profile', BEM block is 'user-profile'
// Strip the prefix ('app-') to get the BEM block name
@Component({
  selector: 'app-user-profile',
  template: `
    <div class="user-profile">
      <div class="user-profile__avatar">...</div>
      <div class="user-profile__name">{{ name }}</div>
    </div>
  `
})
export class UserProfileComponent {}
```

```css
/* ✅ CSS - Block name matches component selector (without prefix) */
.user-profile {
  display: flex;
  padding: 16px;
}
.user-profile__avatar {
  width: 48px;
  height: 48px;
}
.user-profile__name {
  font-weight: bold;
}
```

```scss
// ✅ SCSS - Block name matches component selector (without prefix)
.user-profile {
  display: flex;
  padding: 16px;

  &__avatar {
    width: 48px;
    height: 48px;
  }

  &__name {
    font-weight: bold;
  }
}
```

```sass
// ✅ SASS - Block name matches component selector (without prefix)
.user-profile
  display: flex
  padding: 16px

  &__avatar
    width: 48px
    height: 48px

  &__name
    font-weight: bold
```

**Using :host as the Block:**

```typescript
// ✅ Even better: use :host as the Block, elements inside use the block name
@Component({
  selector: 'app-user-profile',
  template: `
    <div class="user-profile__avatar">...</div>
    <div class="user-profile__name">{{ name }}</div>
  `,
  styles: [`
    :host {
      display: flex;
      padding: 16px;
    }
    .user-profile__avatar {
      width: 48px;
      height: 48px;
    }
    .user-profile__name {
      font-weight: bold;
    }
  `]
})
export class UserProfileComponent {}
```

**Naming convention:**

| Component Selector | BEM Block Name |
|-------------------|----------------|
| `app-user-profile` | `user-profile` |
| `app-nav-bar` | `nav-bar` |
| `app-search-results` | `search-results` |
| `lib-date-picker` | `date-picker` |

**Why it matters:**
- 1:1 mapping between component and BEM block makes code navigation trivial
- Eliminates naming collisions across the application
- Angular's ViewEncapsulation already scopes styles per component, BEM block = component reinforces this
- Developers can find styles instantly by looking at the component selector
- Shared vocabulary between template, styles, and component class

Reference: [BEM Naming](https://getbem.com/naming/)

---

## Rule 2: Maximum 2 Levels of BEM Scope in a Component

**Impact: CRITICAL** — Prevents unreadable selectors and signals when to decompose components

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
.product-card__header__title__icon {
  color: gold;
}
.product-card__header__title__text {
  font-size: 18px;
}
.product-card__header__actions__btn {
  background: blue;
}
.product-card__body__description__text {
  color: #666;
}
```

```scss
// ❌ SCSS - Nesting & creates deeply chained selectors
.product-card {
  &__header {
    &__title {
      &__icon {
        color: gold;
      }
      &__text {
        font-size: 18px;
      }
    }
    &__actions {
      &__btn {
        background: blue;
      }
    }
  }
  &__body {
    &__description {
      &__text {
        color: #666;
      }
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
        font-size: 18px
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
.product-card {
  border: 1px solid #eee;
  border-radius: 8px;
}
.product-card__header {
  display: flex;
  align-items: center;
  padding: 16px;
}
.product-card__icon {
  color: gold;
  margin-right: 8px;
}
.product-card__title {
  font-size: 18px;
  flex: 1;
}
.product-card__action {
  background: blue;
  color: white;
  border: none;
  padding: 8px 16px;
}
.product-card__body {
  padding: 0 16px 16px;
}
.product-card__description {
  color: #666;
  line-height: 1.5;
}
```

```scss
// ✅ SCSS - Single level of & nesting, all elements flat under block
.product-card {
  border: 1px solid #eee;
  border-radius: 8px;

  &__header {
    display: flex;
    align-items: center;
    padding: 16px;
  }

  &__icon {
    color: gold;
    margin-right: 8px;
  }

  &__title {
    font-size: 18px;
    flex: 1;
  }

  &__action {
    background: blue;
    color: white;
    border: none;
    padding: 8px 16px;
  }

  &__body {
    padding: 0 16px 16px;
  }

  &__description {
    color: #666;
    line-height: 1.5;
  }
}
```

```sass
// ✅ SASS - Single level of & nesting, all elements flat under block
.product-card
  border: 1px solid #eee
  border-radius: 8px

  &__header
    display: flex
    align-items: center
    padding: 16px

  &__icon
    color: gold
    margin-right: 8px

  &__title
    font-size: 18px
    flex: 1

  &__action
    background: blue
    color: white
    border: none
    padding: 8px 16px

  &__body
    padding: 0 16px 16px

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

---

## Rule 3: Split Child Components When BEM Depth Exceeds 2 Levels

**Impact: CRITICAL** — Enforces component decomposition, improving reusability and maintainability

When a BEM structure needs more than Block + Element depth, extract the nested section into its own Angular component with its own BEM Block. Each component owns exactly one Block. This is the companion rule to "Maximum 2 levels" — it tells you _what to do_ when you exceed the limit.

**Incorrect (Monolithic component with deep BEM nesting):**

```typescript
// ❌ One component trying to handle card + header + user-info + actions
@Component({
  selector: 'app-comment-card',
  template: `
    <div class="comment-card">
      <div class="comment-card__header">
        <img class="comment-card__header__avatar" [src]="comment.author.avatar" />
        <div class="comment-card__header__info">
          <span class="comment-card__header__info__name">{{ comment.author.name }}</span>
          <span class="comment-card__header__info__date">{{ comment.date | date }}</span>
        </div>
        <div class="comment-card__header__actions">
          <button class="comment-card__header__actions__edit">Edit</button>
          <button class="comment-card__header__actions__delete">Delete</button>
        </div>
      </div>
      <div class="comment-card__body">
        <p class="comment-card__body__text">{{ comment.text }}</p>
        <div class="comment-card__body__reactions">
          @for (reaction of comment.reactions; track reaction.type) {
            <span class="comment-card__body__reactions__item">
              {{ reaction.emoji }} {{ reaction.count }}
            </span>
          }
        </div>
      </div>
    </div>
  `
})
export class CommentCardComponent {}
```

```scss
// ❌ SCSS - Deep nesting nightmare
.comment-card {
  &__header {
    &__avatar { width: 40px; height: 40px; border-radius: 50%; }
    &__info {
      &__name { font-weight: bold; }
      &__date { color: #999; font-size: 12px; }
    }
    &__actions {
      &__edit { color: blue; }
      &__delete { color: red; }
    }
  }
  &__body {
    &__text { line-height: 1.6; }
    &__reactions {
      &__item { cursor: pointer; padding: 4px 8px; }
    }
  }
}
```

```sass
// ❌ SASS - Same deep nesting problem
.comment-card
  &__header
    &__avatar
      width: 40px
      height: 40px
      border-radius: 50%
    &__info
      &__name
        font-weight: bold
      &__date
        color: #999
        font-size: 12px
    &__actions
      &__edit
        color: blue
      &__delete
        color: red
  &__body
    &__text
      line-height: 1.6
    &__reactions
      &__item
        cursor: pointer
        padding: 4px 8px
```

**Correct (Decomposed into child components, each with its own BEM Block):**

```typescript
// ✅ Parent component — owns the "comment-card" block
@Component({
  selector: 'app-comment-card',
  template: `
    <div class="comment-card">
      <app-comment-header
        [author]="comment.author"
        [date]="comment.date"
        (edit)="onEdit()"
        (delete)="onDelete()"
      />
      <app-comment-body
        [text]="comment.text"
        [reactions]="comment.reactions"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentCardComponent {
  comment = input.required<Comment>();
}
```

```typescript
// ✅ Child component — owns the "comment-header" block
@Component({
  selector: 'app-comment-header',
  template: `
    <div class="comment-header">
      <img class="comment-header__avatar" [src]="author().avatar" />
      <div class="comment-header__info">
        <span class="comment-header__name">{{ author().name }}</span>
        <span class="comment-header__date">{{ date() | date }}</span>
      </div>
      <div class="comment-header__actions">
        <button class="comment-header__edit" (click)="edit.emit()">Edit</button>
        <button class="comment-header__delete" (click)="delete.emit()">Delete</button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentHeaderComponent {
  author = input.required<Author>();
  date = input.required<Date>();
  edit = output<void>();
  delete = output<void>();
}
```

```typescript
// ✅ Child component — owns the "comment-body" block
@Component({
  selector: 'app-comment-body',
  template: `
    <div class="comment-body">
      <p class="comment-body__text">{{ text() }}</p>
      <div class="comment-body__reactions">
        @for (reaction of reactions(); track reaction.type) {
          <span class="comment-body__reaction">
            {{ reaction.emoji }} {{ reaction.count }}
          </span>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentBodyComponent {
  text = input.required<string>();
  reactions = input.required<Reaction[]>();
}
```

```css
/* ✅ CSS - Each component has its own flat BEM block */

/* comment-card.component.css */
.comment-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

/* comment-header.component.css */
.comment-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}
.comment-header__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
.comment-header__info {
  flex: 1;
  margin-left: 12px;
}
.comment-header__name {
  font-weight: bold;
}
.comment-header__date {
  color: #999;
  font-size: 12px;
}
.comment-header__actions {
  display: flex;
  gap: 8px;
}
.comment-header__edit {
  color: blue;
}
.comment-header__delete {
  color: red;
}

/* comment-body.component.css */
.comment-body {
  padding: 16px;
}
.comment-body__text {
  line-height: 1.6;
}
.comment-body__reactions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.comment-body__reaction {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 12px;
  background: #f5f5f5;
}
```

```scss
// ✅ SCSS - Each component file is flat

// comment-card.component.scss
.comment-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

// comment-header.component.scss
.comment-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;

  &__avatar { width: 40px; height: 40px; border-radius: 50%; }
  &__info   { flex: 1; margin-left: 12px; }
  &__name   { font-weight: bold; }
  &__date   { color: #999; font-size: 12px; }
  &__actions { display: flex; gap: 8px; }
  &__edit   { color: blue; }
  &__delete { color: red; }
}

// comment-body.component.scss
.comment-body {
  padding: 16px;

  &__text      { line-height: 1.6; }
  &__reactions { display: flex; gap: 8px; margin-top: 12px; }
  &__reaction  { cursor: pointer; padding: 4px 8px; border-radius: 12px; background: #f5f5f5; }
}
```

```sass
// ✅ SASS - Each component file is flat

// comment-card.component.sass
.comment-card
  border: 1px solid #eee
  border-radius: 8px
  overflow: hidden

// comment-header.component.sass
.comment-header
  display: flex
  align-items: center
  padding: 12px 16px
  border-bottom: 1px solid #f0f0f0

  &__avatar
    width: 40px
    height: 40px
    border-radius: 50%
  &__info
    flex: 1
    margin-left: 12px
  &__name
    font-weight: bold
  &__date
    color: #999
    font-size: 12px
  &__actions
    display: flex
    gap: 8px
  &__edit
    color: blue
  &__delete
    color: red

// comment-body.component.sass
.comment-body
  padding: 16px

  &__text
    line-height: 1.6
  &__reactions
    display: flex
    gap: 8px
    margin-top: 12px
  &__reaction
    cursor: pointer
    padding: 4px 8px
    border-radius: 12px
    background: #f5f5f5
```

**Decision flowchart:**

```
Is your BEM nesting > 2 levels?
  ├── YES → Extract the nested part into a child component
  │         with its own BEM Block
  └── NO  → Keep it in the current component
```

**File structure after decomposition:**

```
comment-card/
├── comment-card.component.ts       # Block: comment-card
├── comment-card.component.scss
├── comment-header/
│   ├── comment-header.component.ts  # Block: comment-header
│   └── comment-header.component.scss
└── comment-body/
    ├── comment-body.component.ts    # Block: comment-body
    └── comment-body.component.scss
```

**Why it matters:**
- Each component is small, focused, and independently testable
- Child components are reusable — `comment-header` can be used in other contexts
- Flat BEM in each component means styles are easy to read and maintain
- Angular's ViewEncapsulation scopes each component's styles automatically
- Component decomposition aligns with OnPush change detection for better performance

Reference: [BEM Methodology - Redefinition levels](https://en.bem.info/methodology/redefinition-levels/)

---

## Rule 4: Use Correct BEM Element Naming Conventions

**Impact: HIGH** — Consistent naming enables predictable, searchable, and self-documenting styles

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
.pricing-card__top { padding: 20px; }
.pricing-card__div1 { margin: 10px; }
.pricing-card__red-text { color: red; }
.pricing-card__wrapper { display: flex; }
.pricing-card__inner { font-size: 24px; }
.pricing-card__ul { list-style: none; }
.pricing-card__li { padding: 4px 0; }
.pricing-card__btn-1 { background: blue; }
```

```scss
// ❌ SCSS - Non-descriptive element names
.pricing-card {
  &__top { padding: 20px; }
  &__div1 { margin: 10px; }
  &__red-text { color: red; }
  &__wrapper { display: flex; }
  &__inner { font-size: 24px; }
  &__ul { list-style: none; }
  &__li { padding: 4px 0; }
  &__btn-1 { background: blue; }
}
```

```sass
// ❌ SASS - Non-descriptive element names
.pricing-card
  &__top
    padding: 20px
  &__div1
    margin: 10px
  &__red-text
    color: red
  &__wrapper
    display: flex
  &__inner
    font-size: 24px
  &__ul
    list-style: none
  &__li
    padding: 4px 0
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
.pricing-card {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 24px;
}
.pricing-card__header {
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}
.pricing-card__plan-name {
  font-size: 20px;
  font-weight: bold;
}
.pricing-card__badge {
  color: #e74c3c;
  font-size: 12px;
  font-weight: 600;
}
.pricing-card__price {
  display: flex;
  align-items: baseline;
  margin: 16px 0;
}
.pricing-card__amount {
  font-size: 48px;
  font-weight: bold;
}
.pricing-card__period {
  color: #999;
  margin-left: 4px;
}
.pricing-card__feature-list {
  list-style: none;
  padding: 0;
}
.pricing-card__feature {
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}
.pricing-card__cta {
  width: 100%;
  padding: 12px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
```

```scss
// ✅ SCSS - Descriptive, semantic element names
.pricing-card {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 24px;

  &__header       { padding-bottom: 16px; border-bottom: 1px solid #f0f0f0; }
  &__plan-name    { font-size: 20px; font-weight: bold; }
  &__badge        { color: #e74c3c; font-size: 12px; font-weight: 600; }
  &__price        { display: flex; align-items: baseline; margin: 16px 0; }
  &__amount       { font-size: 48px; font-weight: bold; }
  &__period       { color: #999; margin-left: 4px; }
  &__feature-list { list-style: none; padding: 0; }
  &__feature      { padding: 8px 0; border-bottom: 1px solid #f5f5f5; }
  &__cta          { width: 100%; padding: 12px; background: #3498db; color: white; border: none; border-radius: 6px; cursor: pointer; }
}
```

```sass
// ✅ SASS - Descriptive, semantic element names
.pricing-card
  border: 1px solid #e0e0e0
  border-radius: 12px
  padding: 24px

  &__header
    padding-bottom: 16px
    border-bottom: 1px solid #f0f0f0
  &__plan-name
    font-size: 20px
    font-weight: bold
  &__badge
    color: #e74c3c
    font-size: 12px
    font-weight: 600
  &__price
    display: flex
    align-items: baseline
    margin: 16px 0
  &__amount
    font-size: 48px
    font-weight: bold
  &__period
    color: #999
    margin-left: 4px
  &__feature-list
    list-style: none
    padding: 0
  &__feature
    padding: 8px 0
    border-bottom: 1px solid #f5f5f5
  &__cta
    width: 100%
    padding: 12px
    background: #3498db
    color: white
    border: none
    border-radius: 6px
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

---

## Rule 5: Use BEM Modifiers Correctly for State and Variants

**Impact: HIGH** — Proper modifiers eliminate specificity issues and enable predictable variant styling

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
.alert--error {
  border: 2px solid red;
  background: #ffe0e0;
}
.red-icon {
  color: red;
}
.bold {
  font-weight: bold;
}
.active {
  background: blue;
}
.highlighted {
  box-shadow: 0 0 5px gold;
}
.large {
  padding: 16px 32px;
}
```

```scss
// ❌ SCSS - Nesting modifiers inside elements (creates wrong selectors)
.alert {
  border: 1px solid #ccc;

  &__icon {
    font-size: 20px;

    // ❌ This generates .alert__icon--error, NOT .alert--error .alert__icon
    &--error {
      color: red;
    }
  }

  &__message {
    // ❌ Mixing utility classes with BEM
    &.bold {
      font-weight: bold;
    }
  }
}
```

```sass
// ❌ SASS - Same nesting problem
.alert
  border: 1px solid #ccc

  &__icon
    font-size: 20px

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
/* ✅ CSS - Block modifier changes block and child elements via specificity-safe selectors */
.alert {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #f9f9f9;
}
.alert__icon {
  font-size: 20px;
  margin-right: 12px;
  color: #666;
}
.alert__message {
  flex: 1;
  margin: 0;
}
.alert__dismiss {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #999;
}

/* Block modifiers — change the block and its elements */
.alert--error {
  border-color: #e74c3c;
  background: #fdf0ef;
}
.alert--error .alert__icon {
  color: #e74c3c;
}

.alert--success {
  border-color: #27ae60;
  background: #edfcf2;
}
.alert--success .alert__icon {
  color: #27ae60;
}

.alert--warning {
  border-color: #f39c12;
  background: #fef9ed;
}
.alert--warning .alert__icon {
  color: #f39c12;
}
```

```scss
// ✅ SCSS - Block modifiers with clean nesting
.alert {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #f9f9f9;

  &__icon {
    font-size: 20px;
    margin-right: 12px;
    color: #666;
  }

  &__message {
    flex: 1;
    margin: 0;
  }

  &__dismiss {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #999;
  }

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
  padding: 12px 16px
  border: 1px solid #ccc
  border-radius: 6px
  background: #f9f9f9

  &__icon
    font-size: 20px
    margin-right: 12px
    color: #666

  &__message
    flex: 1
    margin: 0

  &__dismiss
    background: none
    border: none
    font-size: 18px
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

**Element modifiers (for element-level variants):**

```typescript
// ✅ Element modifiers for individual element variants
@Component({
  selector: 'app-button-group',
  template: `
    <div class="button-group">
      <button class="button-group__btn button-group__btn--primary"
              (click)="save.emit()">
        Save
      </button>
      <button class="button-group__btn button-group__btn--secondary"
              (click)="cancel.emit()">
        Cancel
      </button>
      <button class="button-group__btn button-group__btn--disabled"
              [disabled]="true">
        Locked
      </button>
    </div>
  `
})
export class ButtonGroupComponent {}
```

```scss
// ✅ SCSS - Element modifiers
.button-group {
  display: flex;
  gap: 8px;

  &__btn {
    padding: 8px 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;

    &--primary   { background: #3498db; color: white; border-color: #3498db; }
    &--secondary { background: white; color: #333; }
    &--disabled  { opacity: 0.5; cursor: not-allowed; }
  }
}
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

---

## Rule 6: Avoid Cascading and Descendant Selectors with BEM

**Impact: HIGH** — Eliminates specificity conflicts and keeps styles independent of DOM structure

Never use descendant selectors (`.parent .child`), child selectors (`.parent > .child`), or tag-qualified selectors (`div.block`) with BEM. Each BEM class is unique and self-describing — it should work regardless of DOM nesting. The only exception is block modifiers affecting child elements (`.block--modifier .block__element`).

**Incorrect (Cascading and descendant selectors):**

```typescript
// ❌ Relying on DOM hierarchy for styling
@Component({
  selector: 'app-sidebar',
  template: `
    <nav class="sidebar">
      <ul class="sidebar__menu">
        <li class="sidebar__item">
          <a class="sidebar__link">Dashboard</a>
          <ul class="sidebar__submenu">
            <li class="sidebar__item">
              <a class="sidebar__link">Overview</a>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  `
})
export class SidebarComponent {}
```

```css
/* ❌ CSS - Descendant selectors create DOM-dependent, fragile styles */
.sidebar ul {
  list-style: none;
}
.sidebar ul li {
  padding: 8px;
}
.sidebar ul li a {
  color: #333;
  text-decoration: none;
}
.sidebar ul ul {
  padding-left: 20px;
}
.sidebar ul ul li a {
  font-size: 14px;
  color: #666;
}
nav.sidebar {
  width: 250px;
}
div.sidebar__item {
  margin: 4px 0;
}
```

```scss
// ❌ SCSS - Nesting creates deep descendant selectors
.sidebar {
  ul {
    list-style: none;

    li {
      padding: 8px;

      a {
        color: #333;
        text-decoration: none;
      }

      ul {
        padding-left: 20px;

        li a {
          font-size: 14px;
          color: #666;
        }
      }
    }
  }
}
```

```sass
// ❌ SASS - Same cascading problem
.sidebar
  ul
    list-style: none

    li
      padding: 8px

      a
        color: #333
        text-decoration: none

      ul
        padding-left: 20px

        li a
          font-size: 14px
          color: #666
```

**Correct (Flat BEM selectors, no cascading):**

```typescript
// ✅ Each element has its own unique BEM class — no DOM dependency
@Component({
  selector: 'app-sidebar',
  template: `
    <nav class="sidebar">
      <ul class="sidebar__menu">
        <li class="sidebar__item">
          <a class="sidebar__link">Dashboard</a>
        </li>
        <li class="sidebar__item sidebar__item--has-submenu">
          <a class="sidebar__link">Settings</a>
          <app-sidebar-submenu [items]="settingsItems()" />
        </li>
      </ul>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {}
```

```typescript
// ✅ Submenu extracted to own component with its own BEM block
@Component({
  selector: 'app-sidebar-submenu',
  template: `
    <ul class="sidebar-submenu">
      @for (item of items(); track item.id) {
        <li class="sidebar-submenu__item">
          <a class="sidebar-submenu__link">{{ item.label }}</a>
        </li>
      }
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarSubmenuComponent {
  items = input.required<MenuItem[]>();
}
```

```css
/* ✅ CSS - Flat BEM selectors, no cascading, no tag qualifiers */

/* sidebar.component.css */
.sidebar {
  width: 250px;
  background: #fafafa;
}
.sidebar__menu {
  list-style: none;
  padding: 0;
  margin: 0;
}
.sidebar__item {
  padding: 4px 0;
}
.sidebar__item--has-submenu {
  padding-bottom: 0;
}
.sidebar__link {
  display: block;
  padding: 8px 16px;
  color: #333;
  text-decoration: none;
}
.sidebar__link:hover {
  background: #f0f0f0;
}

/* sidebar-submenu.component.css */
.sidebar-submenu {
  list-style: none;
  padding: 0 0 0 20px;
  margin: 0;
}
.sidebar-submenu__item {
  padding: 2px 0;
}
.sidebar-submenu__link {
  display: block;
  padding: 6px 16px;
  font-size: 14px;
  color: #666;
  text-decoration: none;
}
.sidebar-submenu__link:hover {
  color: #333;
}
```

```scss
// ✅ SCSS - Flat BEM selectors

// sidebar.component.scss
.sidebar {
  width: 250px;
  background: #fafafa;

  &__menu {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  &__item {
    padding: 4px 0;

    &--has-submenu {
      padding-bottom: 0;
    }
  }

  &__link {
    display: block;
    padding: 8px 16px;
    color: #333;
    text-decoration: none;

    &:hover {
      background: #f0f0f0;
    }
  }
}

// sidebar-submenu.component.scss
.sidebar-submenu {
  list-style: none;
  padding: 0 0 0 20px;
  margin: 0;

  &__item {
    padding: 2px 0;
  }

  &__link {
    display: block;
    padding: 6px 16px;
    font-size: 14px;
    color: #666;
    text-decoration: none;

    &:hover {
      color: #333;
    }
  }
}
```

```sass
// ✅ SASS - Flat BEM selectors

// sidebar.component.sass
.sidebar
  width: 250px
  background: #fafafa

  &__menu
    list-style: none
    padding: 0
    margin: 0

  &__item
    padding: 4px 0

    &--has-submenu
      padding-bottom: 0

  &__link
    display: block
    padding: 8px 16px
    color: #333
    text-decoration: none

    &:hover
      background: #f0f0f0

// sidebar-submenu.component.sass
.sidebar-submenu
  list-style: none
  padding: 0 0 0 20px
  margin: 0

  &__item
    padding: 2px 0

  &__link
    display: block
    padding: 6px 16px
    font-size: 14px
    color: #666
    text-decoration: none

    &:hover
      color: #333
```

**Allowed vs forbidden selectors:**

| Selector | Allowed? | Why |
|----------|----------|-----|
| `.block__element` | ✅ | Flat BEM — correct |
| `.block--modifier .block__element` | ✅ | Block modifier changing child — correct |
| `.block__element--modifier` | ✅ | Element modifier — correct |
| `.block .block__element` | ❌ | Redundant descendant — unnecessary |
| `.block > .block__element` | ❌ | Child combinator — couples to DOM |
| `div.block` | ❌ | Tag qualifier — fragile |
| `.block ul li a` | ❌ | Tag descendant — high specificity, fragile |
| `.parent .block` | ❌ | External context — block should be context-free |

**Why it matters:**
- BEM class names are globally unique — descendant selectors are redundant
- Flat selectors (single class) all have the same specificity (0,1,0), preventing specificity wars
- Styles don't break when you move elements around in the DOM
- Tag-qualified selectors (e.g., `div.block`) fail if you change the HTML tag
- Angular ViewEncapsulation already scopes styles — combining it with flat BEM is the most maintainable approach

Reference: [BEM FAQ - CSS Specificity](https://en.bem.info/methodology/faq/#why-are-the-css-rules-for-a-block-not-applied-to-its-element)
