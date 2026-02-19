# 🧠 Claude Memory: React Production-Grade Application Standards

> This memory should be loaded at the start of every React project to ensure production-quality code, clean architecture, and best-in-class standards used in large-scale applications.

---

## 📁 FILE & FOLDER STRUCTURE

Always use feature-based (vertical slice) architecture — NOT type-based:

```
src/
├── app/                        # App-level setup
│   ├── App.tsx
│   ├── Router.tsx
│   └── Providers.tsx           # All global providers wrapped here
│
├── assets/                     # Static files (images, fonts, icons)
│
├── components/                 # Truly shared/global UI components only
│   ├── ui/                     # Base UI primitives (Button, Input, Modal...)
│   └── layout/                 # Layout components (Navbar, Sidebar, Footer)
│
├── features/                   # Feature modules — the core of the app
│   └── [feature-name]/
│       ├── api/                # API calls for this feature (React Query hooks)
│       ├── components/         # Feature-specific components
│       ├── hooks/              # Feature-specific custom hooks
│       ├── store/              # Zustand slice for this feature
│       ├── types/              # TypeScript types/interfaces for this feature
│       ├── utils/              # Feature-specific utility functions
│       └── index.ts            # Public API — barrel export
│
├── hooks/                      # Global reusable custom hooks
├── lib/                        # Third-party library configs (axios, queryClient...)
├── pages/                      # Route-level page components (thin, no logic)
├── services/                   # External service wrappers (API base, auth...)
├── store/                      # Global Zustand stores
├── styles/                     # Global styles, Tailwind config, theme tokens
├── types/                      # Global TypeScript types
└── utils/                      # Global utility/helper functions
```

**Rules:**

- Pages are thin — they only compose features/components, zero business logic
- Each feature exports only through its `index.ts` (no deep imports from outside)
- No circular dependencies between features
- Co-locate tests next to the file they test: `Button.test.tsx` beside `Button.tsx`

---

## 🛠️ TECH STACK — BEST FREE & OPEN SOURCE LIBRARIES

### Core

- **React 18+** with TypeScript (strict mode)
- **Vite** — build tool (fast HMR, optimized builds)
- **React Router v6** — routing

### State Management

- **Zustand** — global client state (lightweight, no boilerplate)
- **TanStack Query (React Query) v5** — server state, caching, background sync

### UI & Styling

- **Tailwind CSS v3** — utility-first styling
- **shadcn/ui** — copy-paste accessible component primitives (built on Radix UI)
- **Radix UI** — unstyled accessible headless components (used under shadcn)
- **Lucide React** — icon library (lightweight, tree-shakeable)
- **clsx + tailwind-merge** — conditional classNames without conflicts
- **Framer Motion** — animations (only import what's needed)

### Forms & Validation

- **React Hook Form** — performant forms, minimal re-renders
- **Zod** — schema validation (use for forms + API response validation)
- **@hookform/resolvers** — connect Zod to React Hook Form

### Data Fetching & API

- **Axios** — HTTP client with interceptors for auth/errors
- **TanStack Query** — data fetching, caching, optimistic updates

### Tables & Data Display

- **TanStack Table v8** — headless table (sorting, filtering, pagination)

### Date & Time

- **date-fns** — tree-shakeable date utility (NOT moment.js)

### Utilities

- **lodash-es** — utility functions (ES module version, tree-shakeable)
- **uuid** — generating unique IDs client-side

### Dev Tools & Quality

- **ESLint** + **eslint-plugin-react** + **eslint-plugin-react-hooks**
- **Prettier** — code formatting
- **Husky** + **lint-staged** — pre-commit hooks
- **TypeScript strict mode** — always enabled

### Testing

- **Vitest** — unit/integration testing (Vite-native)
- **React Testing Library** — component testing
- **MSW (Mock Service Worker)** — API mocking in tests

---

## 🗂️ ZUSTAND STATE MANAGEMENT — BEST PRACTICES

### Store Structure

- One store per feature/domain — never one giant global store
- Keep UI state (loading, modals) separate from domain/entity state
- Use slices pattern for large stores

### Store Template

```typescript
// features/auth/store/authStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  setUser: (user: User) => void;
  logout: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      immer((set) => ({
        // State
        user: null,
        isAuthenticated: false,

        // Actions
        setUser: (user) =>
          set((state) => {
            state.user = user;
            state.isAuthenticated = true;
          }),

        logout: () =>
          set((state) => {
            state.user = null;
            state.isAuthenticated = false;
          }),
      })),
      { name: 'auth-storage' }
    ),
    { name: 'AuthStore' }
  )
);
```

### Zustand Rules

- Use `immer` middleware for complex nested state mutations
- Use `devtools` middleware in development for Redux DevTools support
- Use `persist` middleware only for data that truly needs to survive refresh
- Use **selectors** to prevent unnecessary re-renders:

  ```typescript
  // ✅ Good — only re-renders when user changes
  const user = useAuthStore((state) => state.user);

  // ❌ Bad — re-renders on ANY store change
  const { user } = useAuthStore();
  ```

- Never put server/async state in Zustand — use TanStack Query for that
- Don't call store actions inside render — use event handlers or effects

---

## 🌐 DATA FETCHING — TANSTACK QUERY BEST PRACTICES

### Setup

```typescript
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### Query Hook Template

```typescript
// features/users/api/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from './usersApi';

export const userKeys = {
  all: ['users'] as const,
  list: (filters?: UserFilters) => [...userKeys.all, 'list', filters] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
};

export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => usersApi.getAll(filters),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.update,
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.setQueryData(userKeys.detail(updatedUser.id), updatedUser);
    },
  });
}
```

---

## 🔒 SECURITY — NON-NEGOTIABLE RULES

### Environment Variables

- Never hardcode secrets — always use `.env` files
- Prefix client-side vars with `VITE_` and know they are PUBLIC
- Never put API keys, secrets, or tokens in `VITE_` vars — these go to server only
- Add `.env.local`, `.env.*.local` to `.gitignore`
- Commit a `.env.example` with placeholder values, never real values

### API & Auth

- Store auth tokens in **httpOnly cookies** — never in `localStorage` (XSS vulnerable)
- If you must use localStorage, never store sensitive data — only non-sensitive preferences
- Use Axios interceptors for attaching auth headers and handling 401 globally
- Always validate and sanitize data coming from APIs using **Zod**
- Never trust user input — validate on both client AND server

### XSS Prevention

- Never use `dangerouslySetInnerHTML` unless absolutely necessary — and if so, sanitize with **DOMPurify**
- Don't render raw HTML from user-generated content or API responses

### Dependencies

- Regularly run `npm audit` and fix vulnerabilities
- Avoid abandoned packages — check last publish date and GitHub stars
- Pin major versions to avoid breaking changes from auto-updates

---

## ⚡ PERFORMANCE — BEST PRACTICES

### Code Splitting & Lazy Loading

```typescript
// ✅ Always lazy-load page-level components
import { lazy, Suspense } from 'react'

const DashboardPage = lazy(() => import('@/pages/DashboardPage'))

// Wrap in Suspense with a skeleton/spinner fallback
<Suspense fallback={<PageSkeleton />}>
  <DashboardPage />
</Suspense>
```

### Memoization — Use Wisely

```typescript
// useMemo — for expensive calculations only
const sortedData = useMemo(() => expensiveSort(data), [data])

// useCallback — for stable function references passed to memoized children
const handleSubmit = useCallback((values) => { ... }, [dependency])

// React.memo — for components that re-render with same props often
export const ExpensiveList = React.memo(({ items }) => { ... })
```

**Do NOT over-memoize** — memoization itself has a cost. Only use it when you can measure a real performance problem.

### Rendering Optimization

- Use **virtualization** for long lists: `@tanstack/react-virtual`
- Avoid creating objects/arrays inside JSX (new reference on every render)
- Keep component trees shallow where possible
- Avoid anonymous functions as event handlers in hot render paths

### Bundle Size

- Use tree-shakeable libraries (date-fns, lodash-es — NOT lodash)
- Analyze bundle with `vite-bundle-visualizer`
- Use dynamic imports for heavy libraries (charts, PDF viewers, etc.)
- Set up proper caching headers on the server for static assets

### Images

- Use modern formats (WebP, AVIF)
- Always set width and height to prevent layout shift (CLS)
- Use `loading="lazy"` for below-the-fold images

---

## 🎨 UI & DESIGN SYSTEM — BEST PRACTICES

### Tailwind + shadcn/ui Setup

- Use `cn()` helper (clsx + tailwind-merge) for all className merging:

  ```typescript
  import { clsx, type ClassValue } from 'clsx';
  import { twMerge } from 'tailwind-merge';

  export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
  }
  ```

- Define design tokens in `tailwind.config.ts` (colors, spacing, fonts)
- Use CSS variables for theming (light/dark mode support)
- Never use magic numbers — always reference tokens

### Component Design Rules

- Build components from the inside out: base primitives → composed components → feature components → pages
- Every component accepts a `className` prop for extensibility
- Use compound component pattern for complex UI (Select, Dialog, etc.)
- Always handle loading, error, and empty states for data-driven components
- Every interactive element must be keyboard accessible (use Radix UI to get this for free)

### Responsive Design

- Mobile-first: start with mobile styles, add breakpoints upward (`sm:`, `md:`, `lg:`)
- Use Tailwind's responsive prefixes — never write media queries manually unless necessary

---

## 🧹 CLEAN CODE — STANDARDS

### TypeScript

- `strict: true` always — no `any`, no type assertions without justification
- Define types close to where they're used; share via `types/` only when truly shared
- Use `interface` for object shapes, `type` for unions/intersections/primitives
- Export types with `export type` (not `export`) for clarity

### Component Rules

- One component per file
- Max ~150 lines per component — split if larger
- Destructure props at the function signature
- Use named exports (not default exports) for better refactoring support
  - Exception: page components can use default exports for React Router lazy loading
- Keep JSX clean — extract complex logic into custom hooks

### Naming Conventions

- Components: `PascalCase` — `UserCard.tsx`
- Hooks: `camelCase` prefixed with `use` — `useUserProfile.ts`
- Stores: `camelCase` with `Store` suffix — `useAuthStore.ts`
- Utils: `camelCase` — `formatDate.ts`
- Constants: `SCREAMING_SNAKE_CASE` — `MAX_RETRIES`
- Types/Interfaces: `PascalCase` — `UserProfile`, `ApiResponse<T>`

### Custom Hook Rules

- One concern per hook
- Hooks should not directly return JSX — that's a component
- Prefix all hooks with `use`
- Return an object (not array) unless it's a simple value/setter pair

### API Layer

- Never call `fetch`/`axios` directly inside components — always abstract into service functions
- Centralize API base URL and headers in one `lib/axios.ts` config
- Use Zod to parse API responses at the boundary — don't trust raw data shapes

---

## 📋 PROJECT SETUP CHECKLIST

For every new React project, ensure:

- [ ] Vite + React + TypeScript initialized
- [ ] TypeScript `strict: true` in `tsconfig.json`
- [ ] ESLint + Prettier configured with pre-commit hooks (Husky + lint-staged)
- [ ] Tailwind CSS + shadcn/ui initialized
- [ ] React Router v6 setup with lazy-loaded page routes
- [ ] Axios instance configured (`lib/axios.ts`) with interceptors
- [ ] TanStack Query client configured (`lib/queryClient.ts`)
- [ ] Zustand installed with devtools middleware
- [ ] React Hook Form + Zod resolver installed
- [ ] `cn()` utility created in `lib/utils.ts`
- [ ] `.env.example` committed, `.env.local` gitignored
- [ ] Absolute path aliases configured in `vite.config.ts` (`@/` → `src/`)
- [ ] Vitest + React Testing Library configured
- [ ] Error boundary component created at app root

---

## 🚀 PRODUCTION DEPLOYMENT CHECKLIST

Before shipping:

- [ ] All `console.log` removed or behind a debug flag
- [ ] No hardcoded URLs or secrets in source code
- [ ] `npm audit` passes with no high/critical vulnerabilities
- [ ] Bundle size analyzed and optimized
- [ ] All routes code-split with lazy loading
- [ ] Images optimized (WebP, lazy loading, explicit dimensions)
- [ ] Error boundaries in place for graceful failure handling
- [ ] Loading and error states handled for every async operation
- [ ] Accessibility audit passed (keyboard navigation, ARIA labels, color contrast)
- [ ] Environment variables validated at startup (using Zod)
- [ ] Source maps disabled or secured in production build

---

## 🔑 KEY PRINCIPLES — ALWAYS FOLLOW

1. **Server state (API data) → TanStack Query. Client state (UI) → Zustand.** Never mix them.
2. **Validate at the boundary.** Parse and validate all external data (API, forms, env vars) with Zod before it enters your app.
3. **Features are isolated.** No feature imports directly from another feature's internals — only through its public `index.ts`.
4. **Pages are dumb.** Pages only compose, they don't contain logic.
5. **Accessibility is not optional.** Use Radix UI / shadcn components to get it for free.
6. **Measure before optimizing.** Don't add `useMemo`/`useCallback`/`React.memo` without profiling first.
7. **Type everything.** If you're writing `any`, you're writing a future bug.
8. **Co-locate.** Keep files that change together close together (feature-based, not type-based).
9. **Fail loudly in dev, gracefully in prod.** Use error boundaries + dev-only assertions.
10. **Write code for the next developer.** Clear naming, small functions, no clever tricks.
