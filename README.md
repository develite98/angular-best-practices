# Angular Best Practices

Performance optimization guidelines and coding standards for Angular applications, designed for AI agents and LLMs.

## Installation

Install a skill into your Angular project:

```bash
npx skills add develite98/angular-best-practices
```

Select the skill that matches your needs:

| Skill | Description | Rules |
|-------|-------------|-------|
| `angular-best-practices-v20` | Performance optimization for Angular 20+ (Signals, httpResource, @defer, @for/@if) | 35+ rules, 8 categories |
| `angular-best-practices-legacy` | Performance optimization for Angular 12-16 (NgModules, RxJS, *ngFor/*ngIf) | 19+ rules, 8 categories |
| `angular-css-bem-best-practices` | BEM CSS methodology for Angular (component-scoped blocks, flat selectors, proper decomposition) | 6 rules |
| `the-art-of-naming` | Naming conventions for TypeScript & Angular (casing, S-I-D, prefixes, P/HC/LC, A/HC/LC patterns) | 7 rules |

## What's Included

### Performance Optimization (v20+ / legacy)

20+ rules across 8 categories:

| Priority | Category | Impact |
|----------|----------|--------|
| 1 | Change Detection | CRITICAL |
| 2 | Bundle & Lazy Loading | CRITICAL |
| 3 | RxJS Optimization | HIGH |
| 4 | Template Performance | HIGH |
| 5 | Dependency Injection | MEDIUM-HIGH |
| 6 | HTTP & Caching | MEDIUM |
| 7 | Forms Optimization | MEDIUM |
| 8 | General Performance | LOW-MEDIUM |

### BEM CSS Best Practices

6 rules for applying BEM methodology in Angular:

| Priority | Rule | Impact |
|----------|------|--------|
| 1 | Block = Component Selector | CRITICAL |
| 2 | Max 2 Levels of Nesting | CRITICAL |
| 3 | Split Child Components | CRITICAL |
| 4 | Element Naming Conventions | HIGH |
| 5 | Modifier Patterns | HIGH |
| 6 | No Cascading Selectors | HIGH |

### The Art of Naming

7 rules for consistent, self-documenting names:

| Priority | Rule | Impact |
|----------|------|--------|
| 1 | Casing Convention (camelCase, PascalCase, UPPER_CASE) | CRITICAL |
| 2 | S-I-D + No Contractions | CRITICAL |
| 3 | Prefix Conventions (I, _, T) | HIGH |
| 4 | Boolean Naming (is/has/should) | HIGH |
| 5 | Context Duplication | HIGH |
| 6 | Function Pattern (A/HC/LC) | HIGH |
| 7 | Variable Pattern (P/HC/LC) | MEDIUM |

## Project Structure

```
angular-best-practices/
├── skills/                              # Published skills
│   ├── angular-best-practices-v20+/
│   │   ├── SKILL.md                     # Skill metadata (for skills CLI)
│   │   ├── AGENTS.md                    # Compiled rules (AI reads this)
│   │   ├── metadata.json                # Build metadata
│   │   └── rules/                       # Version-specific rules
│   │       ├── change-signals.md
│   │       ├── bundle-defer.md
│   │       └── http-resource.md
│   │
│   ├── angular-best-practices-legacy/
│   │   ├── SKILL.md
│   │   ├── AGENTS.md
│   │   ├── metadata.json
│   │   └── rules/
│   │       ├── change-rxjs-state.md
│   │       ├── bundle-ngmodule.md
│   │       └── bundle-scam.md
│   │
│   ├── angular-css-bem-best-practices/
│   │   ├── SKILL.md
│   │   ├── AGENTS.md
│   │   ├── metadata.json
│   │   └── rules/
│   │       ├── bem-block-selector.md
│   │       ├── bem-max-nesting.md
│   │       └── bem-split-components.md
│   │
│   └── the-art-of-naming/
│       ├── SKILL.md
│       ├── AGENTS.md
│       ├── metadata.json
│       └── rules/
│           ├── naming-casing-convention.md
│           ├── naming-sid.md
│           └── naming-function-pattern.md
│
├── shared/                              # Shared source (not published)
│   └── rules/                           # Rules common to all versions
│       ├── _sections.md                 # Section definitions
│       ├── template-trackby.md
│       ├── rxjs-async-pipe.md
│       └── di-provided-in-root.md
│
├── build/                               # Build tooling
│   └── src/
│       ├── build.ts                     # Compiles rules → AGENTS.md
│       ├── validate.ts                  # Validates rule format
│       └── extract-tests.ts             # Extracts test cases
│
└── package.json
```

## How It Works

```
┌─────────────────┐     ┌──────────────────────┐
│  shared/rules/  │     │  skills/v20+/rules/  │
│  (common rules) │     │  (v20+ specific)     │
└────────┬────────┘     └──────────┬───────────┘
         │                         │
         └───────────┬─────────────┘
                     ↓
              pnpm run build
                     ↓
         ┌───────────────────────┐
         │  skills/v20+/AGENTS.md │
         │  (merged & compiled)   │
         └───────────────────────┘
                     ↓
              AI Agent reads
```

**Key points:**
- `shared/rules/` contains rules that work for ALL Angular versions
- `skills/*/rules/` contains version-specific rules
- Build process merges shared + version-specific into `AGENTS.md`
- AI agents only read `AGENTS.md` (the compiled output)

## Development

### Prerequisites

- Node.js 18+
- pnpm

### Setup

```bash
pnpm install
```

### Build

Compile all skills:

```bash
pnpm run build
```

Build specific version:

```bash
pnpm run build-agents -- v20+
pnpm run build-agents -- legacy
```

### Validate

Check rule format and structure:

```bash
pnpm run validate
```

### Development workflow

```bash
pnpm run dev    # build + validate
```

## Adding New Rules

### 1. Create rule file

Create a new `.md` file in the appropriate directory:

- `shared/rules/` - For rules that apply to ALL versions
- `skills/angular-best-practices-v20+/rules/` - For v20+ only
- `skills/angular-best-practices-legacy/rules/` - For legacy only

### 2. Rule file format

```markdown
# Rule Title

**Impact:** CRITICAL | HIGH | MEDIUM | LOW

Brief explanation of why this rule matters.

## Bad

\`\`\`typescript
// Incorrect implementation
\`\`\`

Why this is problematic.

## Good

\`\`\`typescript
// Correct implementation
\`\`\`

Why this is better.

## References

- https://angular.dev/guide/...
```

### 3. File naming convention

Use the category prefix:

| Category | Prefix | Example |
|----------|--------|---------|
| Change Detection | `change-` | `change-signals.md` |
| Bundle & Lazy Loading | `bundle-` | `bundle-defer.md` |
| RxJS Optimization | `rxjs-` | `rxjs-async-pipe.md` |
| Template Performance | `template-` | `template-trackby.md` |
| Dependency Injection | `di-` | `di-provided-in-root.md` |
| HTTP & Caching | `http-` | `http-resource.md` |
| Forms Optimization | `forms-` | `forms-reactive.md` |
| General Performance | `ssr-` / `perf-` | `ssr-hydration.md` |
| BEM CSS | `bem-` | `bem-block-selector.md` |
| Naming | `naming-` | `naming-sid.md` |

### 4. Build and validate

```bash
pnpm run dev
```

## License

MIT
