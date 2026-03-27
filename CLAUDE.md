# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev                # Start Vite dev server (web)

# Build
npm run build             # TypeScript + Vite production build
npm run build:apk         # Build Android APK
npm run build:ios         # Build iOS app
npm run build:ios-ipa     # Build iOS IPA package

# Mobile dev (live reload)
npm run dev:ios-live      # Live reload on iOS device
npm run dev:android-live  # Live reload on Android device
npm run open-xcode        # Open Xcode project
```

No test runner is configured. ESLint is the only automated code quality tool:
```bash
npx eslint .
```

## Architecture

**ezbill** is a cross-platform expense-splitting app (Splitwise-style) built with React + Capacitor. The web app runs in a native shell on iOS/Android via Capacitor; `dist/` is the web directory synced to native projects.

### Key Abstractions

**Storage** (`src/lib/storage.ts`): Detects runtime and uses Capacitor Preferences (mobile) or `localStorage` (web). All persistence goes through this layer. Data keys: `ezbill_expenses`, `ezbill_trips`, `auth_user`.

**Domain Models** (`src/services/expense.model.ts`): Core types — `Expense`, `Trip`, `Participant`, `BillItem`, `Settlement`. Two expense types: `NOTE` (lump sum) and `BILL` (itemized). Three split modes: `EVEN`, `PERCENTAGE`, `AMOUNT`.

**Expense Store** (`src/stores/expenseStore.ts`): Zustand store for the in-flight expense being created/edited. Persisted by services, not the store itself.

### Data Flow for Expense Creation

1. User fills `CreateExpensePage` → state accumulates in `expenseStore`
2. `ExpenseTypeSelector`, `ParticipantSelector`, `BillItemsEditor`, `SplitOptions` each write to the store
3. On save, `expense.service.ts` or `bill.service.ts` persists to storage via `storage.ts`
4. `splitCalculator.ts` computes per-participant amounts; `settlementCalculator.ts` produces optimal payment flows

### Routing

React Router v7, defined in `src/app/router.tsx`. `AuthGuard` wraps protected routes and redirects unauthenticated users. Bottom navigation (Home / Trips / Friends / Profile) is `AppLayout` + `BottomTab`.

### Tailwind Theming

CSS variables drive the design system — never use raw colors. Defined in `tailwind.config.ts`:
- `--accent-primary`, `--accent-secondary` — brand colors
- `--surface-page`, `--surface-card`, `--surface-elevated` — backgrounds
- `--text-primary`, `--text-secondary`, `--text-muted`, `--text-inverse`
- `--status-success/warning/error/info`

### Environment

Backend API: `VITE_API_BASE_URL` (defaults to `http://localhost:3000`). Production points to `https://ezbill-be.vercel.app`.
