# Angular Best Practices

Performance optimization guidelines for Angular applications, designed for AI agents and LLMs.

## Installation

Install the skill into your Angular project:

```bash
npx add-skill develite98/angular-best-practices
```

Select the version that matches your Angular project:

| Skill | Angular Version | Features |
|-------|-----------------|----------|
| `angular-best-practices-v20` | Angular 20+ | Signals, httpResource, @defer, @for/@if |
| `angular-best-practices-legacy` | Angular 12-16 | NgModules, RxJS, *ngFor/*ngIf |

## What's Included

Each skill contains 20+ rules across 8 categories:

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

## Project Structure

```
angular-best-practices/
├── skills/                              # Published skills
│   ├── angular-best-practices-v20+/
│   │   ├── SKILL.md                     # Skill metadata (for add-skill CLI)
│   │   ├── AGENTS.md                    # Compiled rules (AI reads this)
│   │   ├── metadata.json                # Build metadata
│   │   └── rules/                       # Version-specific rules
│   │       ├── change-signals.md
│   │       ├── bundle-defer.md
│   │       └── http-resource.md
│   │
│   └── angular-best-practices-legacy/
│       ├── SKILL.md
│       ├── AGENTS.md
│       ├── metadata.json
│       └── rules/
│           ├── change-rxjs-state.md
│           ├── bundle-ngmodule.md
│           └── bundle-scam.md
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

### 4. Build and validate

```bash
pnpm run dev
```

## License

MIT
