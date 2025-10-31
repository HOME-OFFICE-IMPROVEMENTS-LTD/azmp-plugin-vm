# Azure Marketplace Generator VM Plugin – Project Roadmap

**Repository:** azmp-plugin-vm  
**Current Version:** v2.1.0 (`develop`)  
**Status:** ✅ ARM-TTK compliance release staged · 📝 Planning v2.2.0 High Availability Cluster  
**Next Milestone:** v2.2.0 (High Availability Cluster)

---

## 📈 Release Journey

| Version | Theme | Highlights | Status |
|---------|-------|------------|--------|
| **v1.6.x – v1.7.x** | Marketplace Foundations | ARM templates, UI definition, validation tooling | ✅ Complete |
| **v1.8.x** | Security & Governance | Trusted launch, encryption patterns, compliance docs | ✅ Complete |
| **v1.9.0** (2025-10-27) | Performance & Security | Accelerated networking, trusted launch defaults, boot diagnostics | ✅ Released |
| **v1.10.0** (2025-10-27) | Cost Optimization | Ephemeral OS disks, auto-shutdown schedules, cost examples | ✅ Released |
| **v2.0.0** (2025-10-30) | Generator Integration | MVP completion, azure-marketplace-generator alignment | ✅ Released |
| **v2.1.0** (2025-10-31) | ARM-TTK Compliance | 46/47 tests passing, generator pruning enhancements, API updates | ✅ Ready to tag |
| **v2.2.0** (TBD) | High Availability Cluster | PPGs, multi-zone VMSS, load balancer + health probes | 🟡 In design |

> **Quality snapshot:** 538 tests (494 executed, 44 skipped) baseline maintained · 40+ CLI commands live · ARM-TTK validation at 46/47 tests across minimal & enterprise configs.

---

## ✅ Recent Release Highlights

### v1.9.0 – Performance & Security
- Accelerated networking with automatic eligibility checks.
- Trusted Launch defaults (Secure Boot + vTPM) for Gen2 images.
- Boot diagnostics configuration with managed storage fallback.
- Documentation refresh covering upgrade guidance and compliance posture.

### v2.0.0 – Marketplace Integration
- Completed P1 feature set for Azure Marketplace certification.
- Integrated plugin with azure-marketplace-generator workflows.
- Added CLI coverage across provisioning, networking, security, and cost.
- Documentation updates for onboarding and certification readiness.

### v2.1.0 – ARM-TTK Compliance
- Resolved 5 ARM-TTK validation failures (46/47 passing).
- Added networking selector outputs and metadata defaults.
- Enhanced generator pruning with parameter preservation whitelist.
- Updated Microsoft.Insights and Microsoft.Network API versions.

---

## 🎯 Upcoming Milestone: v2.2.0 High Availability Cluster

**Goal:** Ship end-to-end cluster capabilities that let marketplace offers deploy resilient, low-latency application tiers out-of-the-box.

**Scope Pillars**
- Proximity Placement Groups (PPGs) with region validation helpers.
- Load balancer wiring (public/internal) including backend pools, NAT rules, and health probes.
- Health extensions/recipes to expose HTTP/TCP probe endpoints.
- Multi-zone VM scale sets with autoscale profiles and PPG affinity.
- Config schema updates, CLI surface, example configs, and full documentation.

**Artifacts**
- `V1.11.0_PLANNING.md` – detailed architecture, work breakdown, test strategy (✅ drafted).
- Roadmap/status refresh (this document + `PROJECT_STATUS.md`).

**Target Timeline:** 5–6 focused implementation days plus validation buffer once approved.

---

## 🧭 Supporting Docs & Checklists

- `V1.11.0_PLANNING.md` – detailed sprint plan.
- `PROJECT_STATUS.md` – operational snapshot (updated alongside this roadmap).
- `CHANGELOG.md` – authoritative release history.
- `POST_RELEASE_TASKS.md` – checklist for publishing and follow-up.
- `docs/` – in-depth design notes and historical context.

---

## 🔭 Backlog (Post v1.11.0 Considerations)

- Global routing: Azure Traffic Manager / Front Door integration.
- Application Gateway WAF presets for layered security.
- DevOps automation: CI/CD, release orchestration, marketplace submission tooling.
- Observability packs: Azure Monitor workbooks, alert rules, log analytics baselines.

These initiatives remain candidates for v1.12.0+ after HA cluster delivery.
