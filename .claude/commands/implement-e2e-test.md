Implement E2E test for test case $ARGUMENTS from docs/regression-tests.md

- Pull latest from main and create branch
- Read test specification for $ARGUMENTS from docs/regression-tests.md
- Use the e2e-test-automator agent to implement the test following the specification
- Ensure test includes proper mock data and helper functions
- Commit after each logical sub-task (e.g., helpers, fixtures, test implementation)

## Validation (MUST PASS before PR!)
```bash
cd frontend
pnpm run typecheck
pnpm run lint                       # No lint errors allowed
pnpm test:e2e --grep "$ARGUMENTS"  # Test must pass
```

## After validation passes:
- Push branch to remote
- Create PR with gh CLI describing the test implementation
- PR title: "feat(e2e): Add E2E test for $ARGUMENTS"

Remember: The e2e-test-automator agent has access to playwright-mcp tools and knows the project structure. It will handle the actual test implementation details.