Refer to docs/work-breakdown.md file, let's work on task $ARGUMENTS

- Check if the task has any dependencies on other incomplete tasks first.
- From main branch, pull the latest from remote.
- Create new branch with descriptive name (e.g., feat/wallet-connection, fix/cache-issue, chore/update-deps).
- Implement the feature/fix with proper error handling and edge cases.
- Tests must be included for new functionality (unit tests, integration tests as appropriate).
- When implementing, commit to git after completing each logical sub-task with short and concise message, so that we can see the work history that was done to finish a task.

## MANDATORY CHECKS BEFORE CREATING PR:
**CRITICAL: All these checks MUST pass locally before creating a PR. ALWAYS RUN THESE CHECKS!**

### Frontend Checks:
```bash
cd frontend
pnpm run lint          # Must pass with NO ERRORS (warnings may be ok)
pnpm run typecheck     # Must pass with no TypeScript errors  
pnpm run test          # All tests must pass
pnpm run build         # Build must succeed
```

### Backend Checks:
```bash
cd backend
pnpm run lint          # Must pass with NO ERRORS (warnings may be ok)
pnpm run test          # All tests must pass (use --forceExit if needed)
pnpm run build         # Build must succeed with no TypeScript errors
```

**⚠️ IMPORTANT: Always run `pnpm run lint` BEFORE creating a PR. Lint errors will block PR merge!**

### Overall Project:
```bash
make test              # Run all project tests (or test each service individually above)
```

- After completed, update the docs/work-breakdown.md file to mark the corresponding task(s) as completed.
- Update related docs/files (only if necessary). For example to update the README.md / CLAUDE.md if introducing new service / component / command that will be used across the development process.
- Push and create PR to main with clear description of changes, testing done, and any breaking changes (use gh CLI).
- If implementation gets blocked or fails, document the blocker and consider creating a separate task for resolution.