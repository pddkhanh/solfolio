Refer to docs/ui-implementation-tasks.md file, let's implement UI task $ARGUMENTS using the ui-developer agent

## Pre-Implementation Check
- Verify the task ID (TASK-UI-XXX) exists in docs/ui-implementation-tasks.md
- Check if the task has any dependencies on other incomplete UI tasks first
- Review the design specifications in docs/ui-ux-design-spec.md for this component
- Check animation patterns in docs/animation-guide.md if animations are involved

## Implementation Process

### STEP 1: Setup Branch
- From main branch, pull the latest from remote
- Create new branch with descriptive name (e.g., ui/portfolio-overview-card, ui/theme-system, ui/loading-states)

### STEP 2: Use UI Developer Agent
Launch the ui-developer agent to implement the specific task:
```
Use the ui-developer agent to implement $ARGUMENTS following the specifications in docs/ui-implementation-tasks.md
```

The agent will:
- Follow exact design specifications from docs/ui-ux-design-spec.md
- Implement animations using patterns from docs/animation-guide.md
- Ensure responsive design across all breakpoints
- Add proper TypeScript types
- Create reusable components
- Ensure accessibility (WCAG 2.1 AA)
- Optimize for performance (60 FPS animations)

### STEP 3: Testing Requirements
- **Unit Tests**: Add tests for new components in `__tests__` directories
- **Visual Testing**: Manually verify on different screen sizes (mobile, tablet, desktop)
- **E2E Tests**: Use e2e-test-automator agent to add/update E2E tests if the UI change affects user flows:
  ```
  Use the e2e-test-automator agent to update E2E tests for the new UI implementation
  ```
- **Performance**: Ensure Lighthouse score remains > 90
- **Accessibility**: Test with keyboard navigation and screen readers

### STEP 4: Commit Strategy
- Commit after completing each logical sub-component with descriptive messages:
  - `feat(ui): add theme provider with dark/light mode support`
  - `feat(ui): implement portfolio overview card with animations`
  - `style: add glassmorphism effect to navigation header`
  - `perf: add virtual scrolling to token list`
  - `a11y: improve keyboard navigation for modals`

## 🚨 MANDATORY PRE-PR CHECKLIST - NEVER SKIP! 🚨
**STOP! DO NOT CREATE A PR UNTIL ALL THESE PASS!**

### QUALITY CHECKS (ALL REQUIRED - NO EXCEPTIONS!)

#### Frontend Checks:
```bash
cd frontend
pnpm run lint          # ❌ MUST pass with EXIT CODE 0 (NO ERRORS!)
pnpm run typecheck     # ❌ MUST pass with EXIT CODE 0
pnpm run test          # ❌ ALL tests MUST pass
pnpm run test:e2e      # ❌ E2E tests MUST pass if UI affects user flows
pnpm run build         # ❌ Build MUST succeed
```

#### Performance Checks:
```bash
# Run Lighthouse CI or manual check
# Ensure Performance score > 90
# Check for animation jank (should be 60 FPS)
# Verify no layout shifts (CLS < 0.1)
```

#### Visual Checks:
- [ ] Component looks correct in dark theme
- [ ] Component looks correct in light theme
- [ ] Responsive on mobile (375px)
- [ ] Responsive on tablet (768px)
- [ ] Responsive on desktop (1280px+)
- [ ] Animations are smooth
- [ ] Loading states work properly
- [ ] Error states display correctly
- [ ] Empty states are well-designed

### FINAL VERIFICATION
```bash
# One more check to be absolutely certain:
pnpm run lint && pnpm run typecheck && echo "✅ Ready for PR!" || echo "❌ FIX ISSUES FIRST!"
```

## PR Creation Process

### Update Documentation:
1. Mark the task as completed in `docs/ui-implementation-tasks.md`
2. Update `docs/work-breakdown.md` if this completes a phase milestone
3. Add component usage examples if creating new reusable components
4. Document any new animation patterns in `docs/animation-guide.md` if applicable

### Create PR:
```bash
# Push branch to remote
git push -u origin [branch-name]

# Create PR with detailed description
gh pr create \
  --title "feat(ui): [Brief description of UI implementation]" \
  --body "## Summary
  Implements $ARGUMENTS from ui-implementation-tasks.md
  
  ## Visual Changes
  - [List key visual improvements]
  - [Include screenshots if possible]
  
  ## Technical Details
  - [List technical implementation details]
  - [Mention any new dependencies added]
  
  ## Testing
  - [ ] Unit tests added/updated
  - [ ] E2E tests added/updated
  - [ ] Tested on mobile/tablet/desktop
  - [ ] Dark/light themes work correctly
  - [ ] Lighthouse score > 90
  - [ ] Accessibility tested
  
  ## Checklist
  - [ ] Lint passes with no errors
  - [ ] TypeScript checks pass
  - [ ] All tests pass
  - [ ] Build succeeds
  - [ ] Follows design specifications
  - [ ] Animations are smooth (60 FPS)
  - [ ] Responsive on all devices"
```

## ⛔ CRITICAL REMINDERS

1. **Design Fidelity**: The implementation MUST match the design specifications exactly
2. **Performance**: Animations MUST run at 60 FPS with no jank
3. **Accessibility**: All interactive elements MUST be keyboard accessible
4. **Testing**: Both visual and automated tests MUST pass
5. **Code Quality**: Lint MUST pass with EXIT CODE 0 - NO ERRORS!

## Common UI Task Categories

- **Theme System** (TASK-UI-001 to UI-004): Foundation work
- **Core Components** (TASK-UI-005 to UI-008): Main UI elements
- **Visualizations** (TASK-UI-009 to UI-011): Charts and graphs
- **Polish** (TASK-UI-012 to UI-015): Animations and refinements
- **Mobile** (TASK-UI-016 to UI-018): Mobile optimizations
- **Advanced** (TASK-UI-019 to UI-024): Performance and features

If implementation gets blocked, document the blocker and consider breaking the task into smaller sub-tasks.