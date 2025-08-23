Refer to docs/work-breakdown.md file, let's work on task $ARGUMENTS

- Check if the task has any dependencies on other incomplete tasks first.
- From main branch, pull the latest from remote.
- Create new branch with descriptive name (e.g., feat/wallet-connection, fix/cache-issue, chore/update-deps).
- Implement the feature/fix with proper error handling and edge cases.
- Tests must be included for new functionality (unit tests, integration tests as appropriate).
- When implementing, commit to git after completing each logical sub-task with short and concise message, so that we can see the work history that was done to finish a task.

## 🚨 MANDATORY PRE-PR CHECKLIST - NEVER SKIP! 🚨
**STOP! DO NOT CREATE A PR UNTIL ALL THESE PASS!**

### STEP 1: Run ALL quality checks (REQUIRED - NO EXCEPTIONS!)
The following commands MUST be run and MUST pass before even thinking about creating a PR:

#### If working on Frontend:
```bash
cd frontend
pnpm run lint          # ❌ MUST pass with EXIT CODE 0 (NO ERRORS ALLOWED!)
pnpm run typecheck     # ❌ MUST pass with EXIT CODE 0
pnpm run test          # ❌ MUST pass - all tests green
pnpm run build         # ❌ MUST succeed without errors
```

#### If working on Backend:
```bash
cd backend
pnpm run lint          # ❌ MUST pass with EXIT CODE 0 (NO ERRORS ALLOWED!)
pnpm run test -- --forceExit  # ❌ MUST pass - all tests green
pnpm run build         # ❌ MUST succeed without errors
```

### STEP 2: Verify lint status (CRITICAL!)
**🛑 ABSOLUTE RULE: If `pnpm run lint` shows ANY errors (exit code !== 0), you MUST fix them before proceeding!**
- Warnings are acceptable but should be minimized
- Errors are NEVER acceptable and WILL block PR merge
- Run lint MULTIPLE times to ensure consistency
- If lint fails, fix ALL issues and commit the fixes before continuing

### STEP 3: Final verification before PR
```bash
# Run one more time to be absolutely sure:
pnpm run lint && echo "✅ Lint passed!" || echo "❌ STOP! Fix lint errors first!"
```

### STEP 4: Only NOW can you proceed with PR creation
- Update the docs/work-breakdown.md file to mark the corresponding task(s) as completed.
- Update related docs/files (only if necessary). For example to update the README.md / CLAUDE.md if introducing new service / component / command that will be used across the development process.
- Push branch to remote
- Create PR to main with clear description of changes, testing done, and any breaking changes (use gh CLI)

## ⛔ REMEMBER: Creating a PR with lint errors is UNACCEPTABLE!
**The user has explicitly stated that lint MUST pass before PR creation. This is non-negotiable.**

If implementation gets blocked or fails, document the blocker and consider creating a separate task for resolution.