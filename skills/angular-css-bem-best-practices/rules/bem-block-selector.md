---
title: BEM Block Must Be the Component Selector
impact: CRITICAL
impactDescription: Consistent naming eliminates selector conflicts and enables component-scoped styling
tags: bem, css, scss, sass, naming, block, selector, component, encapsulation
---

## BEM Block Must Be the Component Selector

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
.profile-card { display: flex; }
.profile-card__avatar { border-radius: 50%; }
.profile-card__name { font-weight: bold; }
```

```scss
// ❌ SCSS - Block name doesn't match selector
.profile-card {
  display: flex;

  &__avatar { border-radius: 50%; }
  &__name { font-weight: bold; }
}
```

```sass
// ❌ SASS - Block name doesn't match selector
.profile-card
  display: flex

  &__avatar
    border-radius: 50%
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
.user-profile { display: flex; }
.user-profile__avatar { border-radius: 50%; }
.user-profile__name { font-weight: bold; }
```

```scss
// ✅ SCSS - Block name matches component selector (without prefix)
.user-profile {
  display: flex;

  &__avatar { border-radius: 50%; }
  &__name { font-weight: bold; }
}
```

```sass
// ✅ SASS - Block name matches component selector (without prefix)
.user-profile
  display: flex

  &__avatar
    border-radius: 50%
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
    }
    .user-profile__avatar { border-radius: 50%; }
    .user-profile__name { font-weight: bold; }
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
