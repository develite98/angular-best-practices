---
title: Use Virtual Scrolling for Large Lists
impact: HIGH
impactDescription: Renders only visible items, reducing DOM nodes from 1000s to ~20
tags: template, performance, cdk, virtual-scroll, large-lists
---

## Use Virtual Scrolling for Large Lists

Rendering thousands of items creates thousands of DOM nodes, causing slow initial render, high memory usage, and janky scrolling. Virtual scrolling renders only visible items.

**Incorrect (Renders all items):**

```typescript
@Component({
  selector: 'app-product-list',
  template: `
    <!-- 10,000 products = 10,000 DOM nodes = slow & memory hungry -->
    <div class="product-list">
      @for (product of products; track product.id) {
        <app-product-card [product]="product" />
      }
    </div>
  `
})
export class ProductListComponent {
  products: Product[] = []; // 10,000 items loaded
}
```

**Correct (Virtual scrolling):**

```typescript
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-product-list',
  template: `
    <!-- Only ~10-20 visible items rendered at a time -->
    <cdk-virtual-scroll-viewport
      itemSize="80"
      class="product-list"
    >
      <app-product-card
        *cdkVirtualFor="let product of products; trackBy: trackById"
        [product]="product"
      />
    </cdk-virtual-scroll-viewport>
  `,
  styles: [`
    .product-list {
      height: 600px; /* Fixed height required */
      width: 100%;
    }
  `],
  imports: [ScrollingModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  products: Product[] = []; // 10,000 items - no problem!

  trackById(index: number, product: Product): number {
    return product.id;
  }
}
```

**For variable height items:**

```typescript
@Component({
  selector: 'app-chat-messages',
  template: `
    <cdk-virtual-scroll-viewport
      [itemSize]="50"
      [minBufferPx]="200"
      [maxBufferPx]="400"
      class="chat-container"
    >
      <div
        *cdkVirtualFor="let msg of messages; trackBy: trackById; templateCacheSize: 20"
        class="message"
        [class.sent]="msg.isSent"
      >
        {{ msg.text }}
      </div>
    </cdk-virtual-scroll-viewport>
  `,
  imports: [ScrollingModule]
})
export class ChatMessagesComponent {
  messages: Message[] = [];

  trackById(index: number, msg: Message): string {
    return msg.id;
  }
}
```

**Advanced: Infinite scroll with virtual scrolling:**

```typescript
@Component({
  selector: 'app-infinite-list',
  template: `
    <cdk-virtual-scroll-viewport
      itemSize="50"
      (scrolledIndexChange)="onScroll($event)"
      class="list-container"
    >
      <div *cdkVirtualFor="let item of items; trackBy: trackById">
        {{ item.name }}
      </div>
      @if (loading) {
        <div class="loader">Loading more...</div>
      }
    </cdk-virtual-scroll-viewport>
  `,
  imports: [ScrollingModule]
})
export class InfiniteListComponent {
  items: Item[] = [];
  loading = false;

  @ViewChild(CdkVirtualScrollViewport) viewport!: CdkVirtualScrollViewport;

  onScroll(index: number): void {
    const end = this.viewport.getRenderedRange().end;
    const total = this.viewport.getDataLength();

    if (end >= total - 5 && !this.loading) {
      this.loadMore();
    }
  }

  private loadMore(): void {
    this.loading = true;
    // Fetch next page...
  }
}
```

**Why it matters:**
- 10,000 items without virtual scroll: ~500MB memory, 5+ seconds render
- 10,000 items with virtual scroll: ~50MB memory, instant render
- Only visible items + small buffer are in DOM at any time
- `templateCacheSize` reuses DOM nodes for better performance

**When NOT to use virtual scrolling:**
- Lists under 100 items (overhead not worth it)
- Items need to be fully rendered for SEO
- Complex item heights that can't be estimated

Reference: [Angular CDK Scrolling](https://material.angular.io/cdk/scrolling/overview)
