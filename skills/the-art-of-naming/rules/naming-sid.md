---
title: Names Must Be Short, Intuitive, and Descriptive (S-I-D) — No Contractions
impact: CRITICAL
impactDescription: S-I-D names are self-documenting and eliminate the need for comments
tags: naming, sid, short, intuitive, descriptive, contractions, readability, self-documenting
---

## Names Must Be Short, Intuitive, and Descriptive (S-I-D) — No Contractions

Every name must satisfy three criteria: **Short** (easy to type and remember), **Intuitive** (reads naturally, like common speech), and **Descriptive** (reflects what it does or possesses). Never use contractions — they save keystrokes but destroy readability.

**Incorrect (Violates S-I-D or uses contractions):**

```typescript
// ❌ Not descriptive — "a" could mean anything
const a = 5;

// ❌ Not intuitive — "Paginatable" is unnatural English
const isPaginatable: boolean = postsCount > 10;

// ❌ Not intuitive — made-up verb
const shouldPaginatize: boolean = postsCount > 10;

// ❌ Not short — excessively verbose
const listOfAllUsersWhoHaveBeenActiveInTheLastThirtyDays: IUser[] = [];

// ❌ Contractions — save keystrokes but kill readability
const onItmClk = (): void => {};
const usrNm: string = 'John';
const fltrdLst: string[] = [];
const chkPrmssn = (): boolean => true;
const prevDsplyState: boolean = false;
const calcTtlPrc = (): number => 0;
const updtCmpnt = (): void => {};
const slctdItms: string[] = [];
```

**Correct (Follows S-I-D, no contractions):**

```typescript
// ✅ Short + Intuitive + Descriptive
const postsCount: number = 5;
const hasPagination: boolean = postsCount > 10;
const shouldDisplayPagination: boolean = postsCount > 10;

// ✅ Short but still descriptive
const recentActiveUsers: IUser[] = [];

// ✅ Full words, no contractions
const onItemClick = (): void => {};
const userName: string = 'John';
const filteredList: string[] = [];
const checkPermission = (): boolean => true;
const previousDisplayState: boolean = false;
const calculateTotalPrice = (): number => 0;
const updateComponent = (): void => {};
const selectedItems: string[] = [];
```

**The S-I-D checklist:**

| Criterion | Question to Ask | Bad | Good |
|-----------|----------------|-----|------|
| **Short** | Can I type and remember it? | `listOfAllUsersWhoHaveBeenActive` | `recentActiveUsers` |
| **Intuitive** | Does it read like natural speech? | `isPaginatable`, `shouldPaginatize` | `hasPagination` |
| **Descriptive** | Does it tell me what it is/does? | `a`, `x`, `temp`, `data` | `postsCount`, `userName` |

**Common contraction patterns to avoid:**

| Contraction | Full Name |
|-------------|-----------|
| `btn` | `button` |
| `clk` | `click` |
| `itm` | `item` |
| `usr` | `user` |
| `msg` | `message` |
| `val` | `value` |
| `chk` | `check` |
| `calc` | `calculate` |
| `prev` | `previous` |
| `slct` | `select` |
| `cmpnt` | `component` |
| `fltr` | `filter` |
| `prmssn` | `permission` |
| `dsply` | `display` |

**Why it matters:**
- Code is read 10x more than it is written — optimize for readability, not typing speed
- Contractions force readers to mentally expand abbreviations on every read
- S-I-D names are self-documenting — they reduce the need for comments
- Finding a short, descriptive name is hard, but contracting is not an acceptable shortcut
- IDE autocompletion eliminates the "too long to type" argument

Reference: [Clean Code - Meaningful Names](https://angular.dev/style-guide)
