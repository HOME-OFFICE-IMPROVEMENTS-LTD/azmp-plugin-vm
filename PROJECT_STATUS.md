# Azure Marketplace VM Plugin – Project Status Report

**Date:** 2025-10-27  
**Current Version:** v1.10.0  
**Active Branch:** `main` (aligned with `develop`)  
**Overall Status:** ✅ Production release complete · 📝 Planning next milestone (v1.11.0 High Availability Cluster)

---

## 📊 Release Snapshot

| Area | Metric | Notes |
|------|--------|-------|
| Tests | 538 total (494 run, 44 skipped) | Jest + template validation suites all green |
| CLI Commands | 40+ | Coverage across provisioning, networking, security, cost |
| Helpers | 250+ | Includes cost optimization, HA, networking, security |
| Templates | `mainTemplate.json.hbs` (+partials) | Published with v1.7.0+ stream |
| npm | `@hoiltd/azmp-plugin-vm@1.10.0` | Released 2025-10-27 |
| GitHub | Tag `v1.10.0` | Merge commit `6388c09` |

---

## ✅ Recent Work (v1.9.0 – v1.10.0)

- **Performance & Security (v1.9.0):** Accelerated networking, trusted launch defaults, boot diagnostics.
- **Cost Optimization (v1.10.0):** Ephemeral OS disks, auto-shutdown schedules, cost-focused examples and documentation.
- **Documentation:** README + CHANGELOG updated; new examples committed; release published to npm and GitHub.

---

## 🚧 In Planning – v1.11.0 High Availability Cluster

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
