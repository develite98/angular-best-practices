---
title: Split Child Components When BEM Depth Exceeds 2 Levels
impact: CRITICAL
impactDescription: Enforces component decomposition, improving reusability and maintainability
tags: bem, css, scss, sass, components, decomposition, refactoring, architecture
---

## Split Child Components When BEM Depth Exceeds 2 Levels

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
    &__avatar { border-radius: 50%; }
    &__info {
      &__name { font-weight: bold; }
      &__date { color: #999; }
    }
    &__actions {
      &__edit { color: blue; }
      &__delete { color: red; }
    }
  }
  &__body {
    &__text { line-height: 1.6; }
    &__reactions {
      &__item { cursor: pointer; }
    }
  }
}
```

```sass
// ❌ SASS - Same deep nesting problem
.comment-card
  &__header
    &__avatar
      border-radius: 50%
    &__info
      &__name
        font-weight: bold
      &__date
        color: #999
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
.comment-card { border: 1px solid #eee; overflow: hidden; }

/* comment-header.component.css */
.comment-header { display: flex; align-items: center; }
.comment-header__avatar { border-radius: 50%; }
.comment-header__info { flex: 1; }
.comment-header__name { font-weight: bold; }
.comment-header__date { color: #999; }
.comment-header__actions { display: flex; }
.comment-header__edit { color: blue; }
.comment-header__delete { color: red; }

/* comment-body.component.css */
.comment-body__text { line-height: 1.6; }
.comment-body__reactions { display: flex; }
.comment-body__reaction { cursor: pointer; background: #f5f5f5; }
```

```scss
// ✅ SCSS - Each component file is flat

// comment-header.component.scss
.comment-header {
  display: flex;
  align-items: center;

  &__avatar { border-radius: 50%; }
  &__info   { flex: 1; }
  &__name   { font-weight: bold; }
  &__date   { color: #999; }
  &__actions { display: flex; }
  &__edit   { color: blue; }
  &__delete { color: red; }
}

// comment-body.component.scss
.comment-body {
  &__text      { line-height: 1.6; }
  &__reactions { display: flex; }
  &__reaction  { cursor: pointer; background: #f5f5f5; }
}
```

```sass
// ✅ SASS - Each component file is flat

// comment-header.component.sass
.comment-header
  display: flex
  align-items: center

  &__avatar
    border-radius: 50%
  &__info
    flex: 1
  &__name
    font-weight: bold
  &__date
    color: #999
  &__actions
    display: flex
  &__edit
    color: blue
  &__delete
    color: red

// comment-body.component.sass
.comment-body
  &__text
    line-height: 1.6
  &__reactions
    display: flex
  &__reaction
    cursor: pointer
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
