---
title: Offload Heavy Computation to Web Workers
impact: LOW-MEDIUM
impactDescription: Keeps UI responsive during intensive tasks
tags: web-workers, performance, computation
---

## Offload Heavy Computation to Web Workers

Heavy computations on the main thread block the UI. Web Workers run in a separate thread, keeping the UI responsive.

**Incorrect (Heavy computation blocks UI):**

```typescript
@Component({
  template: `
    <button (click)="processData()">Process</button>
    <div>Result: {{ result }}</div>
    <!-- UI freezes while processing -->
  `
})
export class DataProcessorComponent {
  result = '';

  processData() {
    // Blocks main thread for seconds
    const data = this.generateLargeDataset();
    this.result = this.heavyComputation(data);
  }
}
```

**Correct (Web Worker keeps UI responsive):**

```typescript
// ng generate web-worker data-processor

// data-processor.worker.ts
addEventListener('message', ({ data }) => {
  const result = heavyComputation(data);
  postMessage(result);
});

// data-processor.component.ts
@Component({
  template: `
    <button (click)="processData()" [disabled]="isProcessing()">
      {{ isProcessing() ? 'Processing...' : 'Process' }}
    </button>
    <div>Result: {{ result() }}</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataProcessorComponent {
  result = signal('');
  isProcessing = signal(false);
  private worker = new Worker(
    new URL('./data-processor.worker', import.meta.url)
  );

  constructor() {
    this.worker.onmessage = ({ data }) => {
      this.result.set(data);
      this.isProcessing.set(false);
    };
  }

  processData() {
    this.isProcessing.set(true);
    this.worker.postMessage(this.generateLargeDataset());
  }
}
```

**Why it matters:**
- UI remains responsive during computation
- Use for data parsing, image processing, encryption
- Generate with `ng generate web-worker <name>`
- Consider Comlink library for easier communication

Reference: [Angular Web Workers](https://angular.dev/guide/web-worker)
