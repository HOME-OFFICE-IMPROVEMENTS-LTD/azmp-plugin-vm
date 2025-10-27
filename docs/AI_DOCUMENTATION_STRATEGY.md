# Documentation Strategy for AI Assistants

## Summary

For providing documentation context to AI assistants (GitHub Copilot, etc.) for Azure Managed Applications development.

## Implemented Structure

```
project-root/
├── .aitk/
│   └── instructions/
│       ├── tools.instructions.md                    ← AI Toolkit tools
│       └── createuidefinition.instructions.md       ← NEW: Patterns & best practices
├── docs/
│   └── reference/
│       ├── README.md                                ← NEW: How to use reference docs
│       └── *.pdf                                    ← Optional: Downloaded PDFs (gitignored)
└── .gitignore                                       ← Updated: Ignore docs/reference/*.pdf
```

## Usage Patterns

### ✅ RECOMMENDED: Live Documentation Fetch

```markdown
@fetch https://learn.microsoft.com/en-us/azure/azure-resource-manager/managed-applications/
```

**Advantages:**
- Always gets latest Microsoft documentation
- No maintenance needed
- Works for all team members
- Already integrated (fetch_webpage tool)

**Use for:**
- Active development
- When internet available
- Getting latest API changes
- Before making architectural decisions

### 🔄 BACKUP: PDF Reference (Optional)

**Location:** `docs/reference/azure-managed-apps.pdf`

**How to get:**
1. Visit https://learn.microsoft.com/en-us/azure/azure-resource-manager/managed-applications/
2. Save page as PDF (browser Print → Save as PDF)
3. Place in `docs/reference/`

**Use for:**
- Offline development
- Network restrictions
- Quick local reference
- Stable reference point

### 📚 CODIFIED: Instruction Files

**Location:** `.aitk/instructions/createuidefinition.instructions.md`

**Contains:**
- Proven patterns from Microsoft samples
- Common mistakes to avoid
- Lessons learned from debugging
- Quick reference rules

**Automatically loaded by:**
- AI Toolkit extension
- GitHub Copilot (when configured)
- Other VS Code AI assistants

## Best Practice Workflow

### For Development Team

1. **Start of project:** Download PDF reference to `docs/reference/`
2. **During development:** Use `@fetch` for latest docs
3. **Document learnings:** Add patterns to `.aitk/instructions/`
4. **Before commits:** Reference `.aitk/instructions/` for validation

### For AI Assistants

**Automatic context (always available):**
```markdown
See .aitk/instructions/createuidefinition.instructions.md for patterns
```

**Live docs (when needed):**
```markdown
@fetch https://learn.microsoft.com/en-us/azure/azure-resource-manager/managed-applications/create-uidefinition-overview
```

**Offline fallback:**
```markdown
Reference docs/reference/azure-managed-apps.pdf if available
```

## Key URLs

### Azure Managed Applications
- Main: https://learn.microsoft.com/en-us/azure/azure-resource-manager/managed-applications/
- CreateUI: https://learn.microsoft.com/en-us/azure/azure-resource-manager/managed-applications/create-uidefinition-overview
- Testing: https://learn.microsoft.com/en-us/azure/azure-resource-manager/managed-applications/test-createuidefinition
- Sandbox: https://portal.azure.com/#view/Microsoft_Azure_CreateUIDef/SandboxBlade

### ARM Templates
- Overview: https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/
- Functions: https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/template-functions
- Test Cases: https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/createuidefinition-test-cases

## Why This Approach?

### Advantages of Hybrid Strategy

1. **Always Current:** `@fetch` gets latest docs
2. **Offline Capable:** PDFs available when needed
3. **Team Knowledge:** `.aitk/instructions/` captures learnings
4. **No Duplication:** PDFs gitignored, docs fetched on demand
5. **Flexible:** Works for all AI assistants

### Disadvantages of Alternatives

**Only PDF:**
- ❌ Gets outdated quickly
- ❌ Large files in git
- ❌ Requires manual updates

**Only @fetch:**
- ❌ Requires internet
- ❌ Subject to rate limits
- ❌ No offline access

**Only .aitk/instructions:**
- ❌ Requires manual curation
- ❌ Can become outdated
- ❌ Limited detail

## Implementation Status

- ✅ Created `docs/reference/` directory
- ✅ Created `.aitk/instructions/createuidefinition.instructions.md` with patterns
- ✅ Created `docs/reference/README.md` with usage guide
- ✅ Updated `.gitignore` to exclude PDFs
- ✅ Documented all critical patterns from today's debugging
- ✅ Added URLs for quick reference

## Next Steps

1. **Optional:** Download PDF reference manually if offline access needed
2. **Continue:** Use `@fetch` for development (already working)
3. **Evolve:** Add more patterns to `.aitk/instructions/` as we learn

## Example Usage

**Before modifying createUiDefinition.json:**
```typescript
// AI Assistant will automatically see:
// 1. .aitk/instructions/createuidefinition.instructions.md (always loaded)
// 2. Can fetch latest docs with @fetch command
// 3. Falls back to PDF if available

// Developer can also:
// 1. Check .aitk/instructions/ for quick patterns
// 2. Use @fetch for specific questions
// 3. Reference PDF for detailed reading
```
