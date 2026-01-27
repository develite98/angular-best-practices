---
title: Avoid Barrel File Imports
impact: HIGH
impactDescription: Direct imports enable tree-shaking, reducing bundle size up to 30%
tags: bundle, tree-shaking, imports, barrel, performance
---

## Avoid Barrel File Imports

Barrel files (index.ts) re-export multiple modules from a single entry point. While convenient, they prevent effective tree-shaking and increase bundle size significantly.

**Incorrect (Barrel imports):**

```typescript
// services/index.ts (barrel file)
export * from './user.service';
export * from './auth.service';
export * from './analytics.service';
export * from './payment.service';
export * from './notification.service';
// ... 20 more services

// component.ts - imports from barrel
import { UserService } from './services';
// Problem: Bundler may include ALL services, not just UserService
// Even with tree-shaking, complex barrels often fail to eliminate unused code
```

```typescript
// Even worse - wildcard imports
import * as Services from './services';

// Using only one service, but entire barrel is included
constructor(private userService: Services.UserService) {}
```

**Correct (Direct imports):**

```typescript
// component.ts - direct import
import { UserService } from './services/user.service';
// Only UserService is bundled, tree-shaking works perfectly
```

```typescript
// For commonly used utilities, create small focused barrels
// utils/date/index.ts - small, focused barrel (OK)
export { formatDate } from './format-date';
export { parseDate } from './parse-date';

// utils/string/index.ts - separate barrel for strings
export { capitalize } from './capitalize';
export { truncate } from './truncate';

// Instead of one massive utils/index.ts
```

**Correct (Package exports for libraries):**

```json
// package.json - explicit exports for published libraries
{
  "name": "@myorg/ui-components",
  "exports": {
    "./button": "./src/button/index.js",
    "./input": "./src/input/index.js",
    "./modal": "./src/modal/index.js"
  }
}
```

```typescript
// Consumer code - tree-shakeable imports
import { Button } from '@myorg/ui-components/button';
// Only button code is bundled
```

**Project structure recommendation:**

```
// ❌ Avoid: One massive barrel
src/
├── services/
│   ├── index.ts         // exports 30 services
│   ├── user.service.ts
│   └── ...

// ✅ Better: No barrels, direct imports
src/
├── services/
│   ├── user.service.ts      // import directly
│   ├── auth.service.ts      // import directly
│   └── ...

// ✅ Also OK: Feature-based small barrels
src/
├── features/
│   ├── user/
│   │   ├── index.ts         // only user-related exports
│   │   ├── user.service.ts
│   │   └── user.component.ts
│   └── auth/
│       ├── index.ts         // only auth-related exports
│       └── auth.service.ts
```

**IDE tip - auto-imports:**

```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  // Prevents IDE from auto-importing from barrels
  "typescript.preferences.autoImportFileExcludePatterns": [
    "**/index.ts",
    "**/index"
  ]
}
```

**Why it matters:**
- Barrel files create complex dependency graphs that confuse bundlers
- `export *` syntax is especially problematic for tree-shaking
- Real-world impact: 30% bundle size reduction by switching to direct imports
- Build times also improve (15-70% faster) with simpler module graphs

**Exceptions where barrels are OK:**
- Published npm packages with explicit `exports` in package.json
- Small, cohesive feature modules (under 5 exports)
- Public API boundaries that rarely change

Reference: [Webpack Tree Shaking](https://webpack.js.org/guides/tree-shaking/)
