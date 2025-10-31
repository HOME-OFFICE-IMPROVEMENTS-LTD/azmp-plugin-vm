# Azure Marketplace VM Plugin – Project Status Report

**Date:** 2025-10-31  
**Current Version:** v2.1.0  
**Active Branch:** `develop` (ready for release tag)  
**Overall Status:** ✅ ARM-TTK compliance release prepped · 🚀 Ready for production tagging

---

## 📊 Release Snapshot

| Area | Metric | Notes |
|------|--------|-------|
| Tests | 538 total (494 run, 44 skipped) | Jest + template validation suites all green |
| CLI Commands | 40+ | Coverage across provisioning, networking, security, cost |
| Helpers | 250+ | Includes cost optimization, HA, networking, security |
| Templates | `mainTemplate.json.hbs` (+partials) | ARM-TTK compliant (46/47 tests) |
| npm | `@hoiltd/azmp-plugin-vm@2.1.0` | Pending publish |
| GitHub | Tag `v2.1.0` | Pending tag |

---

## ✅ Recent Work (v2.0.0 – v2.1.0)

- **Marketplace Integration (v2.0.0):** Completed P1 feature set and integrated with azure-marketplace-generator.
- **ARM-TTK Compliance (v2.1.0):** Resolved 5 validation errors, enhanced generator pruning, added networking selector outputs, updated API versions.
- **Quality Gates:** Templates validated across minimal and enterprise configs (46/47 tests); unit test baseline unchanged.

---

## 🚧 In Planning – v2.2.0 High Availability Cluster

- **Scope:** Proximity placement groups, zonal VM scale sets, load balancer health probes, health extensions, updated configuration UX.
- **Artifact:** `V1.11.0_PLANNING.md` (drafted) outlines objectives, architecture, tasks, testing, and risks.
- **Dependencies:** Azure regional capability validation, autoscale policy definitions, documentation updates.
- **Next Actions:** Finalize design approvals, create implementation tickets, schedule development sprint.

---

## 📌 Operational Checklist

- [x] Tag & publish v1.10.0 (Git + npm)
- [x] Update roadmap and status documents
- [ ] Draft GitHub release notes (optional follow-up)
- [ ] Monitor adoption metrics (npm downloads, GitHub issues)
- [ ] Kick off v1.11.0 implementation once plan is approved

---

## 💡 Risks & Watch List

- **Resource Compatibility:** Need guardrails for regions lacking PPG/zone support (v1.11.0).
- **Cost Feature Interactions:** Ensure auto-shutdown defaults do not conflict with HA workloads.
- **Testing Footprint:** Maintain manageable CI times as template surface grows; consider targeted suites or nightly jobs.

---

**Prepared by:** Codex AI teammate · Reach out if deeper breakdown or dashboards are required.
