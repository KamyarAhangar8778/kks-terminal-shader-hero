# Testing & Quality Assurance Policy

## Project Testing Policy

- **No Test Files Policy**: By project directive, this repository does not use or require unit test files (`*.test.ts`, `*.spec.ts`). All test files have been removed from the repository.
- **Verification Strategy**: Quality assurance, static analysis, type safety, and linting are strictly verified via:
  - `npm run lint` (ESLint code quality and style validation)
  - `npm run typecheck` (`tsc --noEmit` strict TypeScript verification)
  - `npm run build` (Next.js production build compilation)
  - Interactive UI verification and manual browser testing
