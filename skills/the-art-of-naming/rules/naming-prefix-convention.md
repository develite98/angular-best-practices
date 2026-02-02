---
title: Use Correct Prefix Conventions for Interfaces, Private Members, and Generics
impact: HIGH
impactDescription: Prefixes signal intent and scope at a glance without reading documentation
tags: naming, prefix, interface, private, generics, typescript, convention
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
