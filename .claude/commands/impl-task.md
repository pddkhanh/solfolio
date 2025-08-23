Refer to docs/work-breakdown.md file, let's work on task $ARGUMENTS

- Check if the task has any dependencies on other incomplete tasks first.
- From main branch, pull the latest from remote.
- Create new branch with descriptive name (e.g., feat/wallet-connection, fix/cache-issue, chore/update-deps).
- Implement the feature/fix with proper error handling and edge cases.
- Write tests for new functionality (unit tests, integration tests as appropriate).
- Run existing tests and ensure all pass (npm test, pnpm test, etc.).
- Run lint and type checks before committing (npm run lint, npm run typecheck, etc.).
- When implementing, commit to git after completing each logical sub-task with short and concise message, so that we can see the work history that was done to finish a task.
- After completed, update the docs/work-breakdown.md file to mark the corresponding task(s) as completed.
- Update related docs/files (only if necessary). For example to update the README.md / CLAUDE.md if introducing new service / component / command that will be used across the development process.
- Push and create PR to main with clear description of changes, testing done, and any breaking changes (use gh CLI).
- If implementation gets blocked or fails, document the blocker and consider creating a separate task for resolution.