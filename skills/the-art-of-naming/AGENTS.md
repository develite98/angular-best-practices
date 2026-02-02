# The Art of Naming

**Version 1.0.0**
Community
February 2026

> **Note:**
> This document is for AI agents and LLMs to follow when writing,
> reviewing, or refactoring TypeScript and Angular code. Covers naming
> conventions, casing rules, prefixes, boolean naming, the S-I-D principle,
> context duplication, and structured naming patterns.

---

## Abstract

Naming things is hard. This guide provides a structured methodology for naming variables, functions, classes, interfaces, and everything in between — producing code that is self-documenting, consistent, and readable.

---

## When to Apply

Reference these guidelines when:
- Naming new variables, functions, classes, interfaces, or types
- Reviewing code for naming consistency
- Refactoring code to improve readability
- Setting up linting rules for a new project
- Onboarding new team members to the codebase conventions

## Core Principles

- **S-I-D** — Every name must be **S**hort, **I**ntuitive, and **D**escriptive
- **No Contractions** — `onItemClick`, never `onItmClk`
- **Correct Casing** — camelCase for members, PascalCase for types, UPPER_CASE for constants
- **Meaningful Prefixes** — `I` for interfaces, `_` for private, `is/has/should` for booleans
- **No Context Duplication** — `MenuItem.handleClick()`, not `MenuItem.handleMenuItemClick()`
- **Structured Patterns** — P/HC/LC for variables, A/HC/LC for functions
- **Correct Action Verbs** — `get` (sync), `fetch` (async), `remove` (collection), `delete` (permanent)

## Rule Categories by Priority

| Priority | Rule | Impact | File |
|----------|------|--------|------|
| 1 | Casing Convention | CRITICAL | `naming-casing-convention` |
| 2 | S-I-D + No Contractions | CRITICAL | `naming-sid` |
| 3 | Prefix Conventions | HIGH | `naming-prefix-convention` |
| 4 | Boolean Naming | HIGH | `naming-boolean` |
| 5 | Context Duplication | HIGH | `naming-context-duplication` |
| 6 | Function Naming (A/HC/LC) | HIGH | `naming-function-pattern` |
| 7 | Variable Naming (P/HC/LC) | MEDIUM | `naming-variable-pattern` |

## Quick Reference

### 1. Casing Convention (CRITICAL)

- `naming-casing-convention` - camelCase for variables/functions, PascalCase for classes/enums/types, UPPER_CASE for exported constants

### 2. S-I-D + No Contractions (CRITICAL)

- `naming-sid` - Names must be Short, Intuitive, Descriptive — never use contractions

### 3. Prefix Conventions (HIGH)

- `naming-prefix-convention` - `I` for interfaces, `_` for private members, `T`/`R`/`U`/`V`/`K` for generics

### 4. Boolean Naming (HIGH)

- `naming-boolean` - Prefix booleans with `is`/`has`/`should`/`can`, keep names positive

### 5. Context Duplication (HIGH)

- `naming-context-duplication` - Don't repeat class/component name in member names

### 6. Function Naming (HIGH)

- `naming-function-pattern` - A/HC/LC pattern + correct action verbs (get/set/fetch/remove/delete/compose/handle)

### 7. Variable Naming (MEDIUM)

- `naming-variable-pattern` - P/HC/LC pattern for structured, predictable variable names

---

## Use Correct Casing Convention for Each Identifier Type

Apply the correct casing style based on what you are naming: `camelCase` for variables, functions, parameters, properties and methods; `PascalCase` for classes, enums, enum members, and types; `UPPER_CASE` for exported constants.

**Incorrect (Mixed or wrong casing):**

```typescript
// ❌ Wrong casing for each identifier type
const UserName: string = 'John';             // ❌ PascalCase for variable
const MAX_RETRIES = 3;                        // ❌ UPPER_CASE but not exported
function GetUserDetail(Id: string): void {}   // ❌ PascalCase for function and parameter
export const apiBaseUrl = '/api';             // ❌ camelCase for exported constant

class userService {                           // ❌ camelCase for class
  public MaxItems: number = 10;               // ❌ PascalCase for property
  public FetchData(): void {}                 // ❌ PascalCase for method
}

enum status {                                 // ❌ camelCase for enum
  active = 1,                                 // ❌ camelCase for enum member
  inactive = 2,
}

type userRole = 'admin' | 'user';             // ❌ camelCase for type
```

**Correct (Consistent casing per identifier type):**

```typescript
// ✅ camelCase for variables, functions, parameters, properties, methods
const userName: string = 'John';
function getUserDetail(id: string): void {}

// ✅ PascalCase for classes, enums, enum members, types
class UserService {
  public maxItems: number = 10;
  public fetchData(): void {}
}

enum Status {
  Active = 1,
  Inactive = 2,
}

type UserRole = 'admin' | 'user';

// ✅ UPPER_CASE for exported constants
export const API_BASE_URL = '/api';
export const MAX_RETRIES: number = 3;
export const NUMBER_OF_DOGS: number = 5;
```

**Casing rules summary:**

| Identifier | Casing | Example |
|------------|--------|---------|
| Variables | camelCase | `userName`, `shouldUpdate` |
| Functions | camelCase | `getUserDetail`, `handleClick` |
| Parameters | camelCase | `userId`, `filterName` |
| Properties | camelCase | `maxItems`, `isActive` |
| Methods | camelCase | `fetchData`, `resetForm` |
| Classes | PascalCase | `UserService`, `AppComponent` |
| Enums | PascalCase | `Status`, `UserRole` |
| Enum members | PascalCase | `Active`, `FirstMember` |
| Types | PascalCase | `UserRole`, `ApiResponse` |
| Exported constants | UPPER_CASE | `API_BASE_URL`, `MAX_RETRIES` |

**Why it matters:**
- You can determine what an identifier is (variable vs class vs constant) by glancing at its casing
- Consistent casing is a universal convention across TypeScript and Angular codebases
- Linters and formatters enforce these patterns — violating them creates noise
- Team members spend less time debating names when rules are clear

Reference: [Angular Style Guide](https://angular.dev/style-guide)

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

---

## Use Correct Prefix Conventions for Interfaces, Private Members, and Generics

Prefix interface names with `I`, private members with `_`, and generic type parameters with `T`, `R`, `U`, `V`, `K`. These prefixes communicate intent immediately without requiring additional context.

**Incorrect (Missing or wrong prefixes):**

```typescript
// ❌ Interface without I prefix — looks like a class or type
export interface User {
  name: string;
  email: string;
}

// ❌ Private members without underscore — no visual distinction from public
export class UserService {
  private apiUrl: string = '/api/users';
  private cache: Map<string, User> = new Map();

  private loadFromCache(id: string): User | undefined {
    return this.cache.get(id);
  }
}

// ❌ Generic parameters without conventional prefix — unclear
export class Repository<Entity, Response> {
  public find(id: string): Response { /* ... */ }
}

export function transform<Input, Output>(data: Input): Output { /* ... */ }
```

**Correct (Proper prefixes):**

```typescript
// ✅ Interface prefixed with I
export interface IUser {
  name: string;
  email: string;
}

export interface IApiResponse<T> {
  data: T;
  status: number;
}

// ✅ Private members prefixed with underscore
export class UserService {
  private readonly _apiUrl: string = '/api/users';
  private _cache: Map<string, IUser> = new Map();

  private _loadFromCache(id: string): IUser | undefined {
    return this._cache.get(id);
  }

  // ✅ Public members have no prefix
  public getUser(id: string): IUser | undefined {
    return this._loadFromCache(id);
  }
}

// ✅ Generic type parameters prefixed with T, R, U, V, K
export class Repository<TEntity, TResponse> {
  public find(id: string): TResponse { /* ... */ }
}

export function transform<TInput, TOutput>(data: TInput): TOutput { /* ... */ }

// ✅ Common generic parameter conventions
export class GenericClass<T, R, U, V> {
  public t: T | undefined;
  public r: R | undefined;
  public u: U | undefined;
  public v: V | undefined;
}

// K for key types
export type KeyOf<T, K extends keyof T> = T[K];
```

**Prefix rules summary:**

| Identifier | Prefix | Example |
|------------|--------|---------|
| Interfaces | `I` | `IUser`, `IApiResponse` |
| Private properties | `_` | `_cache`, `_apiUrl` |
| Private methods | `_` | `_loadFromCache`, `_validate` |
| Generic types | `T`, `R`, `U`, `V` | `TEntity`, `TResponse` |
| Generic key types | `K` | `K extends keyof T` |

**Why it matters:**
- `I` prefix distinguishes interfaces from classes at a glance (is `User` a class or interface?)
- `_` prefix signals "do not access from outside" before you even check the access modifier
- `T` prefix on generics is a universal TypeScript/Java/C# convention that developers expect
- These prefixes are searchable — `_` finds all private members, `I` finds all interfaces

Reference: [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

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

---

## Avoid Context Duplication in Names

A name should not duplicate the context in which it is defined. When a method or property lives inside a class, the class name already provides context — repeating it in the member name is redundant. Always remove the context from a name if that doesn't decrease its readability.

**Incorrect (Context duplicated in member names):**

```typescript
// ❌ Class name "MenuItem" is repeated in every member
class MenuItem {
  menuItemName: string = '';
  menuItemPrice: number = 0;
  menuItemCategory: string = '';
  isMenuItemAvailable: boolean = true;

  handleMenuItemClick = (event: MouseEvent): void => { /* ... */ };
  getMenuItemDetails = (): string => { /* ... */ };
  updateMenuItemPrice = (newPrice: number): void => { /* ... */ };
}

// ❌ Usage reads redundantly
const item = new MenuItem();
item.menuItemName;                  // "MenuItem.menuItemName"
item.handleMenuItemClick(event);    // "MenuItem.handleMenuItemClick"
item.getMenuItemDetails();          // "MenuItem.getMenuItemDetails"
```

```typescript
// ❌ Same problem in Angular components
@Component({ selector: 'app-user-profile' })
export class UserProfileComponent {
  userProfileName: string = '';
  userProfileAvatar: string = '';
  isUserProfileLoading: boolean = false;

  fetchUserProfileData(): void { /* ... */ }
  updateUserProfileSettings(): void { /* ... */ }
}
```

**Correct (Context-free member names):**

```typescript
// ✅ Class name provides context — members don't repeat it
class MenuItem {
  name: string = '';
  price: number = 0;
  category: string = '';
  isAvailable: boolean = true;

  handleClick = (event: MouseEvent): void => { /* ... */ };
  getDetails = (): string => { /* ... */ };
  updatePrice = (newPrice: number): void => { /* ... */ };
}

// ✅ Usage reads naturally
const item = new MenuItem();
item.name;              // "MenuItem.name" — clear
item.handleClick(event); // "MenuItem.handleClick" — clean
item.getDetails();       // "MenuItem.getDetails" — concise
```

```typescript
// ✅ Angular component without context duplication
@Component({ selector: 'app-user-profile' })
export class UserProfileComponent {
  name: string = '';
  avatar: string = '';
  isLoading: boolean = false;

  fetchData(): void { /* ... */ }
  updateSettings(): void { /* ... */ }
}

// ✅ Usage reads naturally
this.name;          // In UserProfileComponent, "name" is clearly the user profile name
this.fetchData();   // In UserProfileComponent, "fetchData" is clearly fetching profile data
```

**When context IS needed:**

```typescript
// ✅ When accessing from outside, the class provides context
const menuItem = new MenuItem();
console.log(menuItem.name);     // Context comes from the variable name

// ✅ When two different contexts collide, be explicit
class OrderComponent {
  customerName: string = '';   // ✅ Need "customer" to distinguish from order name
  orderName: string = '';      // ✅ Need "order" to distinguish from customer name
}
```

**Why it matters:**
- `MenuItem.handleClick()` reads better than `MenuItem.handleMenuItemClick()`
- Shorter names are easier to scan in code reviews and IDE autocomplete
- The class/component already provides the context — duplication adds noise
- When you rename a class, you don't need to rename all its members
- Exception: add context when there's genuine ambiguity between multiple entities

Reference: [Clean Code - Meaningful Names](https://angular.dev/style-guide)

---

## Use the A/HC/LC Pattern and Correct Action Verbs for Functions

Name functions following the pattern `Action (A) + High Context (HC) + Low Context? (LC)`. The action verb is the most important part — it describes what the function _does_. Use the correct verb for the correct operation: `get` for synchronous access, `fetch` for async requests, `remove` for collection operations, `delete` for permanent erasure.

**Incorrect (Wrong or missing action verbs):**

```typescript
// ❌ No action verb — what does this do?
function userData(id: string): IUser { /* ... */ }
function posts(): Observable<IPost[]> { /* ... */ }

// ❌ Wrong action verb
function getPostsFromApi(): Observable<IPost[]> { /* ... */ }  // ❌ "get" implies sync, this is async
function deleteTodoFromList(id: string, list: ITodo[]): ITodo[] {  // ❌ "delete" implies permanent erasure
  return list.filter(item => item.id !== id);                       //    but this just filters a collection
}
function handleGetUser(id: string): IUser { /* ... */ }          // ❌ "handle" is for event callbacks, not data access
```

**Correct (A/HC/LC pattern with proper verbs):**

```typescript
// ✅ Action + High Context + Low Context
function getPost(id: string): IPost { /* ... */ }
function getPostData(id: string): IPostData { /* ... */ }
function handleClickOutside(event: MouseEvent): void { /* ... */ }
```

**The pattern explained:**

```
Action (A) + High Context (HC) + Low Context? (LC)
```

| Name | Action (A) | High Context (HC) | Low Context (LC) |
|------|------------|-------------------|------------------|
| `getPost` | `get` | `Post` | — |
| `getPostData` | `get` | `Post` | `Data` |
| `handleClickOutside` | `handle` | `Click` | `Outside` |
| `fetchUserProfile` | `fetch` | `User` | `Profile` |
| `removeFilter` | `remove` | `Filter` | — |
| `deletePost` | `delete` | `Post` | — |
| `composePageUrl` | `compose` | `Page` | `Url` |

---

### Action verb reference

**`get` — Synchronous data access**

Accesses data immediately. Use for internal getters and synchronous lookups.

```typescript
// ✅ Synchronous — returns immediately
function getFruitsCount(): number {
  return this.fruits.length;
}
```

**`set` — Assign a value**

Declaratively sets a variable with value A to value B.

```typescript
// ✅ Sets a value
function setFruits(nextFruits: number): void {
  this.fruits = nextFruits;
}

setFruits(5);
```

**`reset` — Restore initial state**

Sets a variable back to its initial value or state.

```typescript
// ✅ Restores initial state
const initialFruits: number = 5;

function resetFruits(): void {
  this.fruits = initialFruits;
}
```

**`fetch` — Asynchronous data request**

Requests data that takes time (i.e., async/network request). Use instead of `get` for any I/O operation.

```typescript
// ✅ Async — returns Observable or Promise
function fetchPosts(postCount: number): Observable<IPost[]> {
  return this.http.get<IPost[]>('/api/posts', { params: { count: postCount } });
}
```

**`remove` — Remove from a collection**

Removes something _from_ somewhere without destroying it. Use for filtering or detaching.

```typescript
// ✅ Removes from a collection — the item still exists elsewhere
function removeFilter(filterName: string, filters: string[]): string[] {
  return filters.filter(name => name !== filterName);
}

const selectedFilters: string[] = ['price', 'availability', 'size'];
removeFilter('price', selectedFilters);
```

**`delete` — Permanent erasure**

Completely erases something. Use for database operations and permanent destruction.

```typescript
// ✅ Permanently deletes — the item is gone
function deletePost(id: number): Observable<boolean> {
  return this.http.delete<boolean>(`/api/posts/${id}`);
}
```

**`compose` — Create from existing data**

Creates new data by combining or transforming existing data.

```typescript
// ✅ Composes a new value from inputs
function composePageUrl(pageName: string, pageId: number): string {
  return `${pageName.toLowerCase()}-${pageId}`;
}
```

**`handle` — Event callback**

Handles an action. Use when naming callback methods for events.

```typescript
// ✅ Handles an event
function handleLinkClick(): void {
  console.log('Clicked a link!');
}

link.addEventListener('click', handleLinkClick);
```

---

**Action verb cheat sheet:**

| Verb | When to Use | Sync/Async | Example |
|------|------------|------------|---------|
| `get` | Access internal data | Sync | `getFruitsCount()` |
| `set` | Assign a value | Sync | `setFruits(5)` |
| `reset` | Restore to initial | Sync | `resetFruits()` |
| `fetch` | Request from API/DB | Async | `fetchPosts()` |
| `remove` | Detach from collection | Sync | `removeFilter()` |
| `delete` | Permanent erasure | Async | `deletePost()` |
| `compose` | Create from existing | Sync | `composePageUrl()` |
| `handle` | Event callback | Sync | `handleLinkClick()` |

**Why it matters:**
- The action verb tells you _what_ the function does before reading the body
- `get` vs `fetch` signals sync vs async — critical for understanding data flow
- `remove` vs `delete` signals temporary vs permanent — prevents accidental data loss
- A/HC/LC produces predictable names: developers can guess function names without searching
- Consistent verbs make API surfaces predictable across the entire codebase

Reference: [Angular Style Guide](https://angular.dev/style-guide)

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
