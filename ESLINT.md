# ESLint Configuration

## Installed Packages

```json
{
  "eslint": "^9.39.4",
  "@eslint/js": "^9.39.4",
  "@typescript-eslint/eslint-plugin": "^8.58.1",
  "@typescript-eslint/parser": "^8.58.1",
  "eslint-plugin-react": "^7.37.5",
  "eslint-plugin-react-hooks": "^7.0.1",
  "eslint-plugin-import": "^2.32.0",
  "eslint-import-resolver-typescript": "^4.4.4"
}
```

## Scripts

```bash
# Check for linting errors
npm run lint

# Auto-fix fixable issues
npm run lint:fix

# Type checking (separate from linting)
npm run type-check
```

## Configuration Overview

### TypeScript Rules (Professional Setup)

**Type Safety:**
- `no-explicit-any`: warn
- `no-unsafe-assignment/call/member-access/return`: warn
- `no-floating-promises`: error (promises must be handled)
- `await-thenable`: error
- `no-misused-promises`: error

**Best Practices:**
- `prefer-nullish-coalescing`: Use `??` instead of `||`
- `prefer-optional-chain`: Use `?.` for safe access
- `prefer-as-const`: Prefer const assertions
- `no-non-null-assertion`: warn about `!` usage
- `no-unnecessary-type-assertion`: Remove redundant assertions

**Code Quality:**
- `no-shadow`: Prevent variable shadowing
- `naming-convention`: PascalCase for interfaces, types, enums

### React Rules

- `react-in-jsx-scope`: off (React 17+)
- `prop-types`: off (using TypeScript)
- `jsx-key`: error (keys in lists required)
- `self-closing-comp`: error (enforce `<Component />`)
- React Hooks rules enforced

### Import Organization

Auto-sorts imports into groups:
1. Built-in modules (node:*)
2. External packages (react, etc.)
3. Internal modules (@/*)
4. Parent/sibling imports (../, ./)
5. Index imports
6. Type imports

Features:
- Alphabetical sorting within groups
- Empty line between groups
- No duplicate imports
- Detects circular dependencies

### General Rules

- `no-console`: warn (except console.warn/error)
- `prefer-const`: error
- `no-var`: error
- `eqeqeq`: Use `===` always (except for null checks)
- `curly`: Always use braces
- `no-debugger`: warn
- `prefer-template`: Use template literals

## Common Issues & Fixes

### Import ordering
**Error:** "There should be at least one empty line between import groups"
**Fix:** Run `npm run lint:fix` - auto-fixable

### Self-closing components
**Error:** "Empty components are self-closing"
**Fix:** Change `<Component></Component>` to `<Component />`

### Floating promises
**Error:** "Promises must be awaited..."
**Fix:** Add `await`, `.catch()`, `.then()`, or `void` prefix

### Type safety
**Warning:** "Unexpected any. Specify a different type"
**Fix:** Replace `any` with proper types or interfaces

### Nullish coalescing
**Warning:** "Prefer using nullish coalescing operator (`??`)"
**Fix:** Replace `||` with `??` when checking for null/undefined

## Integration with VSCode

Add to `.vscode/settings.json`:

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "typescript",
    "typescriptreact"
  ]
}
```

## Ignoring Rules

For specific lines:
```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = something;
```

For entire file:
```typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
```

## Current Status

After running `npm run lint:fix`:
- ✅ All import ordering issues auto-fixed
- ✅ Self-closing components auto-fixed
- ⚠️ 2 errors remaining (need manual fix)
- ⚠️ 139 warnings (mostly type safety improvements)

Most warnings are about:
- Using `any` types (consider proper typing)
- Alert usage (consider better UX)
- Nullish coalescing preferences
- Non-null assertions
