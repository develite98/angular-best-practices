---
title: Prefix Booleans with a Verb and Keep Names Positive
impact: HIGH
impactDescription: Boolean prefixes eliminate ambiguity — you know it's a yes/no question instantly
tags: naming, boolean, prefix, is, has, should, can, positive, readability
---

## Prefix Booleans with a Verb and Keep Names Positive

Boolean variables must be prefixed with an allowed verb (`is`, `has`, `should`, `can`, `did`, `will`, `are`, `have`, `any`) and must express the **positive** condition. Negative booleans like `isNotActive` or `isDisabled` force double-negation in conditionals and hurt readability.

**Incorrect (No prefix or negative names):**

```typescript
// ❌ No boolean prefix — is this a boolean, string, or object?
const online: boolean = true;
const paidFor: boolean = true;
const children: boolean = true;
const visible: boolean = false;

// ❌ Negative boolean names — forces double negation
const isNotActive: boolean = false;
const isDisabled: boolean = true;
const hasNoBillingAddress: boolean = false;
const isInvalid: boolean = true;

// ❌ Double negation in conditionals
if (!isNotActive) {
  // What does this mean? Active? Not not active?
}
if (!isDisabled) {
  // Hard to parse mentally
}
```

**Correct (Verb prefix and positive names):**

```typescript
// ✅ Boolean prefixed with allowed verb
const isOnline: boolean = true;
const isPaidFor: boolean = true;
const hasChildren: boolean = true;
const isVisible: boolean = false;

// ✅ Positive names — no mental gymnastics
const isActive: boolean = true;
const isEnabled: boolean = true;
const hasBillingAddress: boolean = true;
const isValid: boolean = true;

// ✅ Clean conditionals with positive names
if (isActive) {
  // Clear: the thing is active
}
if (!isEnabled) {
  // Clear: the thing is not enabled
}
if (hasBillingAddress) {
  // Clear: billing address exists
}
```

**Allowed boolean prefixes:**

| Prefix | Use For | Example |
|--------|---------|---------|
| `is` | State of being | `isActive`, `isOnline`, `isValid` |
| `are` | Plural state | `areAllSelected`, `areVisible` |
| `has` | Possession (singular) | `hasChildren`, `hasBillingAddress` |
| `have` | Possession (plural) | `havePermissions`, `haveLoaded` |
| `should` | Recommendation/expectation | `shouldUpdate`, `shouldDisplayPagination` |
| `can` | Ability/permission | `canEdit`, `canDelete`, `canSubmit` |
| `did` | Past completion | `didLoad`, `didFetch`, `didComplete` |
| `will` | Future intent | `willRedirect`, `willUpdate` |
| `any` | Existence check | `anySelected`, `anyErrors` |

**Why it matters:**
- `isActive` reads as a question: "Is it active?" — instantly understood as boolean
- `active` alone could be a string, object, or function — the prefix removes ambiguity
- Positive names make conditionals readable: `if (isEnabled)` vs `if (!isDisabled)`
- Double negation (`!isNotActive`) is a common source of logic bugs
- Consistent prefixes make boolean variables searchable across the codebase

Reference: [Angular Style Guide](https://angular.dev/style-guide)
