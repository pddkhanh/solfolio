Implement UI task $ARGUMENTS from docs/ui-implementation-tasks.md

## 📋 WORKFLOW (MUST FOLLOW IN ORDER!)

### 1️⃣ CREATE BRANCH FIRST
```bash
git checkout main && git pull
git checkout -b ui/[task-name]  # e.g., ui/theme-system, ui/portfolio-card
```

### 2️⃣ IMPLEMENT WITH UI AGENT
Launch the ui-developer agent with this prompt:
```
Implement TASK-UI-$ARGUMENTS from docs/ui-implementation-tasks.md

Key requirements:
- Follow design specs in docs/ui-ux-design-spec.md exactly
- Use animation patterns from docs/animation-guide.md for any animations
- Ensure responsive design (mobile/tablet/desktop)
- Add proper TypeScript types
- Maintain 60 FPS for animations
```

### 3️⃣ UPDATE/ADD E2E TESTS
If the UI change affects user flows, update or add E2E tests:
```bash
# Check if existing E2E tests need updates
cd frontend && pnpm run test:e2e

# If needed, use the e2e-test-automator agent:
# "Update E2E tests for the new [component name] implementation"
```

### 4️⃣ RUN ALL QUALITY CHECKS (MUST ALL PASS!)
```bash
cd frontend
pnpm run lint          # ❌ MUST EXIT CODE 0 - NO ERRORS!
pnpm run typecheck     # ❌ MUST EXIT CODE 0
pnpm run test          # ❌ ALL TESTS MUST PASS
pnpm run test:e2e      # ❌ E2E TESTS MUST PASS
pnpm run build         # ❌ BUILD MUST SUCCEED
```

### 5️⃣ CREATE PR (ONLY AFTER ALL CHECKS PASS!)
```bash
git add -A
git commit -m "feat(ui): implement [task description] (TASK-UI-$ARGUMENTS)"
git push -u origin [branch-name]

gh pr create \
  --title "feat(ui): implement [task description] (TASK-UI-$ARGUMENTS)" \
  --body "## Summary
Implements TASK-UI-$ARGUMENTS from ui-implementation-tasks.md

## Changes
- [List key changes]

## Testing
- ✅ Lint passes with no errors
- ✅ TypeScript checks pass
- ✅ All unit tests pass
- ✅ E2E tests updated/added and passing
- ✅ Build succeeds
- ✅ Tested on mobile/tablet/desktop
- ✅ Animations run at 60 FPS"
```

## ⚠️ CRITICAL REQUIREMENTS
- **NEVER skip branch creation** - Always create branch BEFORE implementing
- **NEVER create PR with failing checks** - ALL checks must pass first
- **ALWAYS follow design specs** - Check docs/ui-ux-design-spec.md
- **ALWAYS test animations** - Must be smooth 60 FPS
- **ALWAYS update E2E tests** - If UI affects user workflows