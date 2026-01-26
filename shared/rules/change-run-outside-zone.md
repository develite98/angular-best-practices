---
title: Run Non-UI Code Outside NgZone
impact: CRITICAL
impactDescription: Prevents unnecessary change detection triggers
tags: ngzone, change-detection, performance
---

## Run Non-UI Code Outside NgZone

NgZone patches async APIs to trigger change detection. For code that doesn't affect the UI, running outside the zone prevents unnecessary cycles.

**Incorrect (Event listener triggers change detection):**

```typescript
@Component({
  selector: 'app-scroll-tracker',
  template: `<div>Scroll position logged to console</div>`
})
export class ScrollTrackerComponent implements OnInit {
  ngOnInit() {
    // Every scroll event triggers change detection
    window.addEventListener('scroll', this.onScroll);
  }

  onScroll = () => {
    console.log('Scroll:', window.scrollY);  // No UI update needed
  };
}
```

**Correct (Run outside zone, enter for UI updates):**

```typescript
@Component({
  selector: 'app-scroll-tracker',
  template: `<div>Scroll position: {{ scrollPosition }}</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScrollTrackerComponent implements OnInit {
  scrollPosition = 0;

  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.onScroll);
    });
  }

  onScroll = () => {
    const newPosition = window.scrollY;
    if (Math.abs(newPosition - this.scrollPosition) > 100) {
      this.ngZone.run(() => {
        this.scrollPosition = newPosition;
        this.cdr.markForCheck();
      });
    }
  };
}
```

**Why it matters:**
- `runOutsideAngular()` prevents change detection triggers
- `run()` re-enters the zone for UI updates
- Use for scroll/resize/mousemove listeners
- Use for WebSocket connections and polling

Reference: [Angular NgZone](https://angular.dev/api/core/NgZone)
