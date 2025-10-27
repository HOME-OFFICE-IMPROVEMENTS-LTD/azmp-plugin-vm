# Post-Release Tasks for v1.8.0

**Release Date:** October 27, 2025  
**Version:** v1.8.0  
**Status:** Released ✅

---

## ✅ Completed Tasks

- [x] All Phase 2 automation tests passed (8 E2E scenarios)
- [x] TypeScript compilation successful in both repos
- [x] azure-marketplace-generator tests passed (119/119)
- [x] Created v1.8.0 tag with comprehensive message
- [x] Pushed tag to origin
- [x] Created detailed release notes
- [x] Documented known monitoring test issues
- [x] Trusted Launch decision made (Option A - stashed for future release)
- [x] Production checklist created and committed

---

## 📋 Immediate Follow-Up Tasks

### 1. Create GitHub Release
**Priority:** HIGH  
**Assignee:** Release Manager  
**Due:** Within 24 hours

```bash
# Navigate to GitHub
# https://github.com/HOME-OFFICE-IMPROVEMENTS-LTD/azmp-plugin-vm/releases/new

# Use the following:
# - Tag: v1.8.0
# - Title: "Azure Marketplace Generator VM Plugin v1.8.0"
# - Description: Copy from RELEASE_NOTES_v1.8.0.md
# - Attach: Any relevant binaries or artifacts
# - Mark as: Latest release
```

### 2. Update CHANGELOG.md
**Priority:** HIGH  
**Assignee:** Development Team  
**Due:** Before next commit

Add v1.8.0 entry to CHANGELOG.md with:
- Release date
- Key features summary
- Breaking changes (none)
- Known issues
- Migration guide (none needed)

### 3. NPM Package Publishing (if applicable)
**Priority:** MEDIUM  
**Assignee:** Package Maintainer  
**Due:** Within 48 hours

```bash
cd /home/msalsouri/Projects/azmp-plugin-vm

# Update package.json version if needed
npm version 1.8.0

# Publish to npm
npm publish --access public

# Or if scoped package
npm publish
```

---

## 🔧 Technical Debt - v1.8.1/v1.9.0

### Fix Monitoring Template Tests
**Priority:** HIGH  
**Target Release:** v1.8.1 or v1.9.0  
**Estimated Effort:** 4-8 hours  
**Assigned:** TBD

**Issue Details:**
- 51 test failures in `src/__tests__/monitoring-template.test.ts`
- All failures related to data collection rule configuration
- Does NOT impact Phase 2 automation functionality

**Investigation Steps:**
1. Review test expectations in `monitoring-template.test.ts`
2. Analyze actual template output vs expected output
3. Determine if tests need updating OR templates need fixing
4. Run focused test: `npm test -- monitoring-template.test.ts`

**Files to Review:**
- `src/__tests__/monitoring-template.test.ts` - Test expectations
- `src/templates/monitoring/*` - Template files (if they exist)
- Template generation logic - Find where monitoring resources are generated

**Acceptance Criteria:**
- [ ] All 51 monitoring tests pass
- [ ] Full test suite passes (543/543)
- [ ] No regressions in other test areas
- [ ] Documentation updated if behavior changed

**Commands to Run:**
```bash
cd /home/msalsouri/Projects/azmp-plugin-vm

# Run monitoring tests specifically
npm test -- monitoring-template.test.ts

# Run full suite after fixes
npm test

# Run Phase 2 tests to ensure no regression
./test-phase2.sh
```

---

## 🎯 Trusted Launch Feature Completion

### Apply Stashed Trusted Launch Work
**Priority:** MEDIUM  
**Target Release:** v1.8.1 or v1.9.0  
**Estimated Effort:** 2-4 hours  
**Assigned:** TBD

**Current Status:**
Trusted Launch refinements are stashed in `stash@{0}`:
```bash
cd /home/msalsouri/Projects/azmp-plugin-vm
git stash list
# stash@{0}: On feature/v1.8.0: WIP: Trusted Launch template changes...
```

**Stash Contains:**
- Modified: `src/templates/mainTemplate.json.hbs`
  - Load balancer name fallback
  - Trusted Launch securityProfile
  - Public IP hostname/sshCommand outputs
- New files: `generate-templates.js`, `test-trusted-launch-config.json`
- Generated: `generated-deployment/` directory

**Decision Options:**

#### Option A: Apply and Release as v1.8.1
```bash
cd /home/msalsouri/Projects/azmp-plugin-vm

# Apply stash
git stash pop

# Review changes
git diff

# Test
npm run build
npm test
./test-phase2.sh

# If all tests pass:
git add .
git commit -m "feat: add Trusted Launch template refinements"
git push origin feature/v1.8.0
git tag -a v1.8.1 -m "Release v1.8.1: Trusted Launch enhancements"
git push origin v1.8.1
```

#### Option B: Create New Feature Branch
```bash
cd /home/msalsouri/Projects/azmp-plugin-vm

# Create new branch
git checkout -b feature/trusted-launch-enhancements
git stash pop

# Continue development
# Test thoroughly
# Create PR when ready
```

#### Option C: Include in v1.9.0
Keep stashed until next major feature release, combine with other improvements.

**Acceptance Criteria:**
- [ ] All Trusted Launch changes applied
- [ ] Tests pass (including monitoring tests if fixed)
- [ ] Documentation updated
- [ ] Templates generate correctly
- [ ] ARM-TTK validation passes

---

## 📊 Monitoring & Metrics

### Track Release Adoption
- [ ] Monitor npm download statistics
- [ ] Track GitHub release downloads
- [ ] Monitor issue reports for v1.8.0
- [ ] Collect user feedback

### Success Metrics
- **Installation Count:** Track via npm
- **Usage Statistics:** CLI telemetry (if enabled)
- **Issue Reports:** GitHub issues tagged v1.8.0
- **User Feedback:** Support channels, discussions

---

## 📝 Documentation Updates

### Update README.md
**Priority:** MEDIUM  
**Due:** Within 1 week

Add v1.8.0 highlights to README:
- Quick start with new commands
- Link to AUTOMATION_HOOKS.md
- Badge showing latest version

### Update GitHub Wiki (if exists)
**Priority:** LOW  
**Due:** Within 2 weeks

- Add automation examples
- Update command reference
- Add troubleshooting section

### Blog Post / Announcement (optional)
**Priority:** LOW  
**Due:** Within 1 month

Announce v1.8.0 release with:
- Feature highlights
- Use case examples
- Migration guide (none needed)
- Future roadmap

---

## 🔄 Continuous Integration

### Update CI/CD Pipelines
**Priority:** MEDIUM  
**Due:** Within 1 week

- [ ] Update version references in CI scripts
- [ ] Add Phase 2 E2E tests to CI pipeline
- [ ] Configure automated npm publishing
- [ ] Add monitoring test failure notifications

### Add Test Coverage Reporting
**Priority:** LOW  
**Due:** Within 2 weeks

- [ ] Integrate coverage tool (e.g., codecov)
- [ ] Set coverage thresholds
- [ ] Add coverage badge to README

---

## 🗂️ Repository Cleanup

### Clean Stashes in azure-marketplace-generator
**Priority:** LOW  
**Due:** After confirming no needed work

```bash
cd /home/msalsouri/Projects/azure-marketplace-generator

# Review stashes
git stash list
# stash@{0}: Phase 1/2 work - superseded
# stash@{1}: Backup
# stash@{2}: organize-root-files

# Drop superseded stashes if confirmed not needed
git stash drop stash@{0}  # Phase 1/2 duplicate work
```

### Archive Old Branches
**Priority:** LOW  
**Due:** Within 1 month

Review and clean up old feature branches in both repos.

---

## 📞 Communication Plan

### Internal Communication
- [ ] Notify development team of release
- [ ] Share release notes with stakeholders
- [ ] Update project status documentation

### External Communication (if applicable)
- [ ] Announce on GitHub Discussions
- [ ] Update marketplace listings
- [ ] Notify users via mailing list

---

## 🎯 Next Sprint Planning

### v1.9.0 Roadmap Ideas
- Complete Trusted Launch features
- Fix all monitoring template tests
- Add more cleanup commands
- Improve error handling
- Enhanced logging and telemetry

### v2.0.0 Future Vision
- Multi-region support
- Advanced approval workflows
- Web UI for approval management
- Prometheus metrics export
- Automated rollback capabilities

---

**Last Updated:** October 27, 2025  
**Next Review:** After v1.8.1 release planning
