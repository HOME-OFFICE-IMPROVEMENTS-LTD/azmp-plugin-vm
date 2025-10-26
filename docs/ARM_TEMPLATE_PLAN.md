# Phase 5 – ARM Template Architecture Plan

This document captures the structure and conventions that will be used while
implementing the Phase 5 ARM template sprint. It serves as a shared blueprint
for the `mainTemplate.json.hbs`, `createUiDefinition.json.hbs`, and
`viewDefinition.json.hbs` files, as well as the supporting Handlebars partials.

## Goals

1. **Use every helper** – Each of the 233 existing helpers should be exercised
   by the templates so that every capability can be deployed from the ARM
   artifacts.
2. **Composable layout** – Break the massive template into focused partials so
   that the structure is maintainable and can evolve as the helper catalogue
   grows.
3. **Marketplace ready** – Ensure the UI and view definitions align with the
   Azure Marketplace requirements (wizard flows, validation, and offer
   presentation).
4. **Validation friendly** – Keep the output deterministic and compatible with
   ARM TTK and `az deployment what-if` validation.

## Template Workspace

```
src/templates/
├── mainTemplate.json.hbs
├── createUiDefinition.json.hbs
├── viewDefinition.json.hbs
└── partials/
    ├── parameters/
    ├── variables/
    ├── resources/
    │   ├── networking/
    │   ├── security/
    │   ├── compute/
    │   ├── monitoring/
    │   ├── cost/
    │   └── extensions/
    └── outputs/
```

* **Parameters** – Standardized inputs (location, naming, SKU selections,
  identities, networking blocks, etc.). These will orchestrate helper invocations
  such as `net:vnet.parameters`, `security:diskEncryption.parameters`, and
  `identity:managedIdentity.parameters`.
* **Variables** – Shared expressions for resource IDs, diagnostics, tags, and
  concatenations. This is where helpers like `security:policyVariables`,
  `monitoring:diagnosticsVariables`, and `availability:zoneVariables` will be
  used.
* **Resources** – Split by capability to keep the JSON manageable:
  * `networking` → VNet, subnets, NSGs, load balancers, application gateways,
    Bastion, peering (`net:*`, `nsg:*`, `lb:*`, `appgw:*`, `bastion:*` helpers).
  * `security` → Disk encryption sets, Key Vault integration, policies,
    Defender configuration (`security:*`, `identity:*` helpers).
  * `compute` → VM, VMSS, availability sets/zones, extensions (`vm:*`,
    `availability:*`, `extensions:*`, `scaling:*` helpers).
  * `monitoring` → Diagnostics, log analytics, workbooks, alerts (`monitor:*`,
    `workbook:*`, `perf:*` helpers).
  * `cost` → Budgets, cost analyses, recommendations (`cost:*` helpers).
  * `extensions` → All VM extension resources (`ext:*` helpers).
* **Outputs** – Portal links, workbook IDs, connection strings, cost summaries
  (`monitor:viewLinks`, `cost:reportOutputs`, etc.).

## createUiDefinition Layout

* **Basics blade** – VM name, location, size, image, authentication. Uses
  `identity:` and `security:` helper outputs for validation metadata.
* **Networking blade** – Virtual network selection/creation, subnet choices,
  NSG toggles powered by `net:ui.*` helpers.
* **Security blade** – Disk encryption, Defender, Just-In-Time access toggles,
  Trusted Launch options.
* **Extensions & Monitoring blade** – Pick extensions, enable diagnostics,
  select workbooks/alerts.
* **Cost & Scaling blade** – Surface right-sizing, budget recommendations, and
  autoscale presets.

Each blade will leverage helpers that emit UI controls (`net:uiDropdown`,
`security:uiToggle`, `cost:uiNotification`, etc.) to keep logic centralized.

## viewDefinition Layout

* **Hero section** – Offer summary, key value propositions using
  `monitor:summaryTiles` and `cost:roiHighlights`.
* **Feature tiles** – Networking, security, HA/DR, monitoring, and cost
  sections with aligned helper-generated descriptions.
* **Pricing callouts** – Inline with `cost:pricingCallout`.

## Helper Coverage Matrix (high level)

| Capability          | Key Helpers (examples)                                  |
|---------------------|---------------------------------------------------------|
| Networking          | `net:vnet`, `net:subnet`, `net:peering`, `nsg:rule`     |
| Security            | `security:diskEncryption`, `security:baseline`, `identity:managedIdentity` |
| Compute / HA        | `availability:set`, `scaling:vmss`, `extensions:install`|
| Monitoring          | `monitor:cpuAlert`, `workbook:definition`, `perf:simulateScaling` |
| Cost Optimization   | `cost:budgetDefinition`, `cost:rightSizeRecommendation` |

Detailed tracking will live in the implementation PR checklist to ensure every
helper family is represented.

## Validation Strategy

1. **Schema enforcement** – JSON schema validation (`arm-template-test-toolkit`).
2. **Deployment sanity** – `az deployment what-if` against a sandbox subscription.
3. **Unit fixtures** – Snapshot tests for sample parameter sets (basic VM,
   HA pair, VMSS advanced).
4. **UI verification** – Use Partner Center validation scripts for
   `createUiDefinition` and `viewDefinition`.

## Next Steps

1. Scaffold the `partials/` directory with empty files matching the structure
   above (ensures incremental development is straightforward).
2. Refactor existing templates to consume partials and helpers.
3. Implement validation tooling and CLI generation commands.

This document will evolve as we discover gaps while coding, but it captures the
initial architecture required to start Phase 5 with confidence.

