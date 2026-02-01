---
title: Avoid Cascading and Descendant Selectors with BEM
impact: HIGH
impactDescription: Eliminates specificity conflicts and keeps styles independent of DOM structure
tags: bem, css, scss, sass, specificity, cascading, descendant, selectors, decoupling
---

## Avoid Cascading and Descendant Selectors with BEM

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
.sidebar ul { list-style: none; }
.sidebar ul li { /* styles */ }
.sidebar ul li a { color: #333; text-decoration: none; }
.sidebar ul ul { /* styles */ }
.sidebar ul ul li a { color: #666; }
nav.sidebar { /* styles */ }
div.sidebar__item { /* styles */ }
```

```scss
// ❌ SCSS - Nesting creates deep descendant selectors
.sidebar {
  ul {
    list-style: none;

    li {
      a {
        color: #333;
        text-decoration: none;
      }

      ul {
        li a { color: #666; }
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
      a
        color: #333
        text-decoration: none

      ul
        li a
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
.sidebar { background: #fafafa; }
.sidebar__menu { list-style: none; padding: 0; margin: 0; }
.sidebar__item { /* styles */ }
.sidebar__item--has-submenu { /* styles */ }
.sidebar__link { display: block; color: #333; text-decoration: none; }
.sidebar__link:hover { background: #f0f0f0; }

/* sidebar-submenu.component.css */
.sidebar-submenu { list-style: none; padding: 0; margin: 0; }
.sidebar-submenu__item { /* styles */ }
.sidebar-submenu__link { display: block; color: #666; text-decoration: none; }
.sidebar-submenu__link:hover { color: #333; }
```

```scss
// ✅ SCSS - Flat BEM selectors

// sidebar.component.scss
.sidebar {
  background: #fafafa;

  &__menu { list-style: none; padding: 0; margin: 0; }
  &__item { /* styles */ }
  &__item--has-submenu { /* styles */ }
  &__link {
    display: block;
    color: #333;
    text-decoration: none;
    &:hover { background: #f0f0f0; }
  }
}

// sidebar-submenu.component.scss
.sidebar-submenu {
  list-style: none;
  padding: 0;
  margin: 0;

  &__item { /* styles */ }
  &__link {
    display: block;
    color: #666;
    text-decoration: none;
    &:hover { color: #333; }
  }
}
```

```sass
// ✅ SASS - Flat BEM selectors

// sidebar.component.sass
.sidebar
  background: #fafafa

  &__menu
    list-style: none
    padding: 0
    margin: 0
  &__item
    /* styles */
  &__item--has-submenu
    /* styles */
  &__link
    display: block
    color: #333
    text-decoration: none
    &:hover
      background: #f0f0f0

// sidebar-submenu.component.sass
.sidebar-submenu
  list-style: none
  padding: 0
  margin: 0

  &__item
    /* styles */
  &__link
    display: block
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
