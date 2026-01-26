---
title: Detach Change Detector for Heavy Operations
impact: CRITICAL
impactDescription: Eliminates change detection during computation
tags: change-detection, detach, performance
---

## Detach Change Detector for Heavy Operations

For components with heavy computations or animations, detaching the change detector excludes the component from change detection cycles. Reattach when updates are needed.

**Incorrect (Change detection runs during animation):**

```typescript
@Component({
  selector: 'app-animation',
  template: `<canvas #canvas></canvas>`
})
export class AnimationComponent implements OnInit {
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  ngOnInit() {
    this.animate();
  }

  animate() {
    this.drawFrame();
    requestAnimationFrame(() => this.animate());
    // Each frame causes unnecessary change detection
  }
}
```

**Correct (Detach during animation):**

```typescript
@Component({
  selector: 'app-animation',
  template: `
    <canvas #canvas></canvas>
    <p>FPS: {{ fps }}</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnimationComponent implements OnInit {
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  fps = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cdr.detach();  // Exclude from change detection
    this.animate();
    this.updateFps();
  }

  animate() {
    this.drawFrame();
    requestAnimationFrame(() => this.animate());
  }

  updateFps() {
    setInterval(() => {
      this.cdr.detectChanges();  // Manual update only when needed
    }, 1000);
  }
}
```

**Why it matters:**
- `detach()` excludes component from all automatic checks
- `detectChanges()` triggers manual check when needed
- Ideal for canvas animations, games, real-time visualizations
- Remember to `reattach()` in `ngOnDestroy` if needed

Reference: [Angular ChangeDetectorRef](https://angular.dev/api/core/ChangeDetectorRef)
