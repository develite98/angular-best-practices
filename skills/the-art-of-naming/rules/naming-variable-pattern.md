---
title: Use the P/HC/LC Pattern for Variable Names
impact: MEDIUM
impactDescription: Structured naming patterns produce consistent, predictable variable names across the codebase
tags: naming, pattern, variables, prefix, context, boolean, number, consistency
---

## Use the P/HC/LC Pattern for Variable Names

Name variables following the pattern `Prefix? + High Context (HC) + Low Context? (LC)`. The prefix describes the type or nature of the value, the high context is the primary subject, and the low context refines it. This produces names that read naturally and are predictable.

**Incorrect (No consistent pattern):**

```typescript
// ❌ No discernible pattern — each name follows different logic
const show: boolean = true;             // No prefix, no context
const msgDisplay: boolean = false;      // Contracted, inverted order
const total: number = 0;               // Too vague — total of what?
const quizScores: number = 85;          // Is this a single score or a collection?
const flag: boolean = true;             // "flag" says nothing
const cnt: number = 10;                // Contracted, ambiguous
```

**Correct (P/HC/LC pattern):**

```typescript
// ✅ Prefix + High Context + Low Context

// Booleans: Prefix(is/has/should) + HC + LC
const shouldDisplayMessage: boolean = true;
const isUserAuthenticated: boolean = false;
const hasFormErrors: boolean = true;
const canEditProfile: boolean = false;

// Numbers: Prefix(total/min/max/numberOf) + HC + LC
const totalQuizScore: number = 85;
const minPasswordLength: number = 8;
const maxRetryAttempts: number = 3;
const numberOfComponentFields: number = 5;
const numberOfVisitedTimes: number = 12;
```

**The pattern explained:**

```
Prefix? + High Context (HC) + Low Context? (LC)
```

| Name | Prefix | High Context (HC) | Low Context (LC) |
|------|--------|-------------------|------------------|
| `shouldDisplayMessage` | `should` | `Display` | `Message` |
| `totalQuizScore` | `total` | `Quiz` | `Score` |
| `isUserAuthenticated` | `is` | `User` | `Authenticated` |
| `maxRetryAttempts` | `max` | `Retry` | `Attempts` |
| `numberOfComponentFields` | `numberOf` | `Component` | `Fields` |

**Prefixes by type:**

| Type | Prefixes | Examples |
|------|----------|---------|
| Boolean | `is`, `are`, `should`, `has`, `have`, `can`, `did`, `will`, `any` | `isActive`, `shouldUpdate`, `hasChildren` |
| Number | `min`, `max`, `total`, `numberOf` | `minLength`, `maxRetries`, `totalScore` |
| Number (suffix) | — | `...Size`, `...Length`, `...Score`, `...Price`, `...Count`, `...Width`, `...Height` |

**Context ordering matters:**

```typescript
// High context emphasizes the primary subject
const shouldUpdateComponent: boolean = true;
// → YOU are about to update a component

const shouldComponentUpdate: boolean = true;
// → The COMPONENT will update itself, you control whether it should
```

**Why it matters:**
- P/HC/LC produces names that read like natural English phrases
- Team members can predict variable names without searching (e.g., "total" + "quiz" + "score")
- The prefix immediately tells you the type: `is*` = boolean, `total*` = number
- High context first makes autocomplete useful — type the subject, see all related variables

Reference: [Angular Style Guide](https://angular.dev/style-guide)
