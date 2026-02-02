---
title: Use Correct Casing Convention for Each Identifier Type
impact: CRITICAL
impactDescription: Consistent casing makes code instantly scannable and prevents naming collisions
tags: naming, casing, camelCase, PascalCase, UPPER_CASE, convention, typescript
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
