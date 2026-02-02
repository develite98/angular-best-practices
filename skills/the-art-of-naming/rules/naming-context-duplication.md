---
title: Avoid Context Duplication in Names
impact: HIGH
impactDescription: Removing redundant context makes names shorter without losing meaning
tags: naming, context, duplication, redundancy, readability, classes, methods
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
