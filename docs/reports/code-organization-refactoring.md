# 🔧 Project Refactoring Plan - Code Organization

## 🚨 Current Issues Identified

### 1. **Duplicate Utility Functions**

❌ **Problem**: `formatCurrency` exists in 4 different places!

- `src/lib/data/index.tsx` (original)
- `src/lib/charts/index.tsx` (re-exports from data)
- `src/lib/analytics/investments.ts` (duplicate implementation)
- `src/features/budget/utils/needsWantsSavingsUtils.tsx` (another duplicate)

### 2. **Scattered Formatting Utilities**

❌ **Problem**: Format/Parse functions spread across multiple files

- Date parsing in `lib/data/index.tsx`
- Currency formatting in 4 places
- Amount parsing in `lib/data/index.tsx`
- No centralized formatting module

### 3. **Mixed Concerns in lib/**

❌ **Problem**: `lib/` contains different types of logic

- `lib/calculations/` - Pure math functions ✅
- `lib/analytics/` - Business logic ✅
- `lib/data/` - Data processing + formatting utilities ⚠️
- `lib/charts/` - Chart config + utilities ⚠️

### 4. **Budget Utils Need Splitting**

❌ **Problem**: Two large budget utility files (657 + 587 lines)

- `budgetUtils.tsx` - Budget CRUD + calculations mixed
- `needsWantsSavingsUtils.tsx` - Classification + calculations + storage

### 5. **No Clear Formatting Module**

❌ **Problem**: Formatting scattered everywhere

- Currency formatting (4 places)
- Date formatting (various places)
- Label truncation (charts)
- Number formatting (various)

---

## ✅ Proposed Solution

### Phase 1: Create Core Utilities Structure

```
src/
├── lib/
│   ├── calculations/          # ✅ Keep - Pure math (totals, averages, etc.)
│   ├── analytics/             # ✅ Keep - Business logic (tax, investments)
│   ├── formatters/            # ⭐ NEW - All formatting functions
│   │   ├── index.ts           # Main exports
│   │   ├── currency.ts        # Currency formatting
│   │   ├── date.ts            # Date formatting
│   │   ├── number.ts          # Number formatting
│   │   └── text.ts            # Text truncation, labels
│   ├── parsers/               # ⭐ NEW - All parsing functions
│   │   ├── index.ts           # Main exports
│   │   ├── currency.ts        # Parse currency strings
│   │   ├── date.ts            # Parse dates
│   │   └── amount.ts          # Parse amounts
│   ├── validators/            # ⭐ NEW - Data validation
│   │   ├── index.ts
│   │   ├── transaction.ts
│   │   └── date.ts
│   └── storage/               # ⭐ NEW - LocalStorage abstraction
│       ├── index.ts
│       ├── budget.ts
│       └── goals.ts
├── features/
│   └── budget/
│       └── services/          # ⭐ RENAME from utils/
│           ├── budgetCrud.ts  # ⭐ NEW - Budget CRUD only
│           ├── budgetCalc.ts  # ⭐ NEW - Budget calculations
│           └── classification.ts # ⭐ NEW - Category classification
```

### Phase 2: Consolidation Map

#### Currency Formatting → `lib/formatters/currency.ts`

```typescript
// Single source of truth
export const formatCurrency = (value: number, options?: FormatOptions): string
export const formatCompactCurrency = (value: number): string
export const formatCurrencyWithSymbol = (value: number, symbol: string): string
```

**Remove duplicates from:**

- ✂️ `lib/charts/index.tsx` - Use import from formatters
- ✂️ `lib/analytics/investments.ts` - Use import
- ✂️ `features/budget/utils/needsWantsSavingsUtils.tsx` - Use import

#### Date Utilities → `lib/formatters/date.ts` + `lib/parsers/date.ts`

```typescript
// formatters/date.ts
export const formatDate = (date: Date, format: string): string
export const formatMonthYear = (date: Date): string
export const formatRelativeDate = (date: Date): string

// parsers/date.ts
export const parseDate = (dateString: string, timeString: string): Date | null
export const parseDateString = (dateString: string): Date | null
```

#### Storage Operations → `lib/storage/`

```typescript
// storage/budget.ts
export const saveBudgets = (budgets: Budget[]): void
export const loadBudgets = (): Budget[]
export const clearBudgets = (): void

// storage/goals.ts
export const saveGoals = (goals: Goal[]): void
export const loadGoals = (): Goal[]
```

### Phase 3: Budget Services Refactoring

**Current:**

```
features/budget/utils/
├── budgetUtils.tsx (657 lines - CRUD + calculations + health scores)
└── needsWantsSavingsUtils.tsx (587 lines - classification + calculations + storage)
```

**Target:**

```
features/budget/services/
├── budgetCrud.ts (~150 lines - Create, Read, Update, Delete budgets)
├── budgetCalculations.ts (~200 lines - Budget math, comparisons, progress)
├── categoryClassification.ts (~100 lines - Needs/Wants/Savings classification)
└── budgetHealth.ts (~150 lines - Health scoring, consistency checks)
```

---

## 📊 Benefits

### 1. **Single Source of Truth**

✅ Each utility function exists in ONE place only
✅ No duplicate implementations
✅ Easier to maintain and update

### 2. **Clear Separation of Concerns**

✅ `formatters/` - Display formatting
✅ `parsers/` - Input parsing  
✅ `validators/` - Data validation
✅ `storage/` - Persistence layer
✅ `calculations/` - Pure math
✅ `analytics/` - Business logic

### 3. **Better Discoverability**

✅ "Where's currency formatting?" → `lib/formatters/currency.ts`
✅ "Where's date parsing?" → `lib/parsers/date.ts`
✅ Easy for new developers to find what they need

### 4. **Testability**

✅ Small, focused modules are easier to test
✅ Clear boundaries for unit tests
✅ Mock dependencies easily

### 5. **Reduced File Sizes**

✅ Break down 600+ line files into 100-200 line modules
✅ Easier to read and understand
✅ Better code review experience

---

## 🎯 Implementation Order

### Priority 1: High Impact, Low Risk (Week 1)

1. ✅ Create `lib/formatters/` with currency, date, number, text
2. ✅ Create `lib/parsers/` with currency, date, amount
3. ✅ Update all imports to use new formatters/parsers
4. ✅ Remove duplicate implementations
5. ✅ Add tests for formatters and parsers

### Priority 2: Medium Impact (Week 2)

6. ✅ Create `lib/storage/` for localStorage operations
7. ✅ Create `lib/validators/` for data validation
8. ✅ Split budget utils into focused services
9. ✅ Update feature imports

### Priority 3: Polish (Week 3)

10. ✅ Add comprehensive JSDoc to all utilities
11. ✅ Create utility documentation in `docs/`
12. ✅ Add integration tests
13. ✅ Performance optimization

---

## 📝 File Size Guidelines

- **Small Module**: < 150 lines (formatters, parsers)
- **Medium Module**: 150-300 lines (services, calculators)
- **Large Module**: 300-500 lines (complex features, hooks)
- **Too Large**: > 500 lines (needs splitting!)

---

## 🔗 Related Documentation

- [Architecture Guide](./docs/architecture/comprehensive-guide.md)
- [TypeScript Migration](./docs/migration/typescript-migration.md)

---

**Status**: 📋 Planning Phase  
**Next Action**: Begin Phase 1 implementation
