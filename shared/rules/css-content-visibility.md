---
title: Use CSS content-visibility for Off-Screen Content
impact: HIGH
impactDescription: 10× faster initial render by skipping off-screen layout
tags: css, rendering, performance, content-visibility, long-lists
---

## Use CSS content-visibility for Off-Screen Content

Apply `content-visibility: auto` to defer rendering of off-screen content. The browser skips layout and paint for elements not in the viewport, dramatically improving initial render time.

**Incorrect (renders all items immediately):**

```typescript
@Component({
  selector: 'app-message-list',
  template: `
    <div class="messages">
      <!-- All 1000 messages rendered and laid out immediately -->
      @for (message of messages; track message.id) {
        <div class="message">
          <app-avatar [user]="message.author" />
          <div class="content">{{ message.text }}</div>
          <span class="time">{{ message.time | date:'short' }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .message {
      padding: 12px;
      border-bottom: 1px solid #eee;
    }
  `]
})
export class MessageListComponent {
  messages: Message[] = []; // 1000+ messages
}
```

**Correct (defers off-screen rendering):**

```typescript
@Component({
  selector: 'app-message-list',
  template: `
    <div class="messages">
      @for (message of messages; track message.id) {
        <div class="message">
          <app-avatar [user]="message.author" />
          <div class="content">{{ message.text }}</div>
          <span class="time">{{ message.time | date:'short' }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .message {
      padding: 12px;
      border-bottom: 1px solid #eee;

      /* ✅ Skip layout/paint for off-screen items */
      content-visibility: auto;

      /* Hint at size to prevent layout shift when scrolling */
      contain-intrinsic-size: 0 80px;
    }
  `]
})
export class MessageListComponent {
  messages: Message[] = []; // 1000+ messages - no problem!
}
```

**For card layouts:**

```scss
// Product grid with many items
.product-card {
  content-visibility: auto;
  contain-intrinsic-size: 300px 400px; // width height

  // Also add containment for extra performance
  contain: layout style paint;
}
```

**For sections/pages:**

```typescript
@Component({
  selector: 'app-long-page',
  template: `
    <section class="hero">...</section>
    <section class="features content-section">...</section>
    <section class="testimonials content-section">...</section>
    <section class="pricing content-section">...</section>
    <section class="faq content-section">...</section>
    <section class="footer content-section">...</section>
  `,
  styles: [`
    .content-section {
      content-visibility: auto;
      contain-intrinsic-size: 0 500px; /* Estimated section height */
    }
  `]
})
export class LongPageComponent {}
```

**Dynamic height estimation:**

```typescript
@Component({
  selector: 'app-dynamic-list',
  template: `
    @for (item of items; track item.id) {
      <div
        class="item"
        [style.contain-intrinsic-size]="'0 ' + estimateHeight(item) + 'px'"
      >
        {{ item.content }}
      </div>
    }
  `,
  styles: [`
    .item {
      content-visibility: auto;
    }
  `]
})
export class DynamicListComponent {
  estimateHeight(item: Item): number {
    // Rough estimation based on content length
    const baseHeight = 60;
    const charsPerLine = 50;
    const lineHeight = 20;
    const lines = Math.ceil(item.content.length / charsPerLine);
    return baseHeight + (lines * lineHeight);
  }
}
```

**Combining with virtual scroll:**

```typescript
// For extremely long lists (10,000+ items), combine both:
// - Virtual scroll: only creates DOM nodes for visible items
// - content-visibility: optimizes the rendered items

@Component({
  template: `
    <cdk-virtual-scroll-viewport itemSize="80" class="list">
      <div
        *cdkVirtualFor="let item of items"
        class="item"
      >
        {{ item.name }}
      </div>
    </cdk-virtual-scroll-viewport>
  `,
  styles: [`
    .item {
      content-visibility: auto;
      contain-intrinsic-size: 0 80px;
    }
  `]
})
export class HugeListComponent {}
```

**When to use content-visibility:**

| Scenario | Recommendation |
|----------|----------------|
| List with 50-500 items | ✅ `content-visibility: auto` |
| List with 500+ items | ✅ Virtual scroll + content-visibility |
| Long scrolling page | ✅ On each section |
| Modal/dialog content | ❌ Usually all visible |
| Above-the-fold content | ❌ Must render immediately |

**Browser support note:**

```scss
// Progressive enhancement - works in Chrome, Edge, Opera
// Safari/Firefox ignore it safely
.item {
  content-visibility: auto;
  contain-intrinsic-size: 0 80px;

  // Fallback for unsupported browsers (optional)
  @supports not (content-visibility: auto) {
    // No special handling needed - just renders normally
  }
}
```

**Why it matters:**
- 1000 items without content-visibility: browser computes layout for all 1000
- 1000 items with content-visibility: browser computes layout for ~10 visible
- Real-world impact: 10× faster initial paint for long lists
- No JavaScript required - pure CSS optimization

Reference: [MDN content-visibility](https://developer.mozilla.org/en-US/docs/Web/CSS/content-visibility)
