# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section ID (in parentheses) is the filename prefix used to group rules.

---

## 1. Change Detection (change)

**Impact:** CRITICAL
**Description:** Change detection is the #1 performance factor in Angular. Using OnPush strategy, Signals, and proper zone management can dramatically reduce unnecessary checks and improve responsiveness.

## 2. Bundle & Lazy Loading (bundle)

**Impact:** CRITICAL
**Description:** Reducing initial bundle size and leveraging lazy loading improves Time to Interactive and First Contentful Paint. Standalone components and @defer blocks enable fine-grained code splitting.

## 3. RxJS Optimization (rxjs)

**Impact:** HIGH
**Description:** Proper RxJS usage prevents memory leaks, reduces unnecessary computations, and ensures efficient data flow. The async pipe and takeUntilDestroyed are essential patterns.

## 4. Template Performance (template)

**Impact:** HIGH
**Description:** Optimizing templates with trackBy, pure pipes, and NgOptimizedImage reduces DOM operations and improves rendering performance.

## 5. Dependency Injection (di)

**Impact:** MEDIUM-HIGH
**Description:** Proper DI configuration enables tree-shaking, improves testability, and ensures services are instantiated efficiently.

## 6. HTTP & Caching (http)

**Impact:** MEDIUM
**Description:** Efficient HTTP handling with interceptors, caching strategies, and transfer state reduces network requests and improves perceived performance.

## 7. Forms Optimization (forms)

**Impact:** MEDIUM
**Description:** Using reactive forms with proper typing improves maintainability and enables better change detection integration.

## 8. General Performance (perf)

**Impact:** LOW-MEDIUM
**Description:** Additional performance patterns including Web Workers for heavy computations and SSR optimizations.
