# Phase 3 Helper Structure & Architecture Design

**Date:** October 22, 2024  
**Context:** Addressing namespace conflicts and scalability for Phase 3  
**Based on:** Expert feedback on helper organization and dependency management

## 🎯 Problem Statement

With Phase 3 adding ~60 new helpers to existing 104 helpers (164 total), we need:
1. **Namespace Management** - Prevent helper name collisions
2. **Selective Loading** - Load only needed features
3. **Dependency Resolution** - Handle extension installation order
4. **Scalability** - Support future phases without refactoring

## 🏗️ Proposed Helper Architecture

### 1. Domain-Specific Registries

Replace global Handlebars registration with domain-specific modules:

```typescript
// src/extensions/index.ts
export function register(registry: HelperRegistry) {
  registry.registerHelper('ext:monitor.install', installMonitorHelper);
  registry.registerHelper('ext:antimalware.configure', configureAntimalwareHelper);
  // ... more extension helpers
}

// src/security/index.ts  
export function register(registry: HelperRegistry) {
  registry.registerHelper('sec:encryption.enable', enableEncryptionHelper);
  registry.registerHelper('sec:trusted_launch.configure', configureTrustedLaunchHelper);
  // ... more security helpers
}

// src/networking/index.ts (existing, needs refactoring)
export function register(registry: HelperRegistry) {
  registry.registerHelper('net:vnet.template', getVNetTemplateHelper);
  registry.registerHelper('net:nsg.rule', getNsgRuleHelper);
  // ... existing networking helpers with net: prefix
}
```

### 2. Explicit Namespace Convention

#### Namespace Prefix Structure
```
<domain>:<category>.<action>
```

#### Examples by Domain
```typescript
// Extensions Domain (ext:)
'ext:monitor.install'           // Install monitoring extension
'ext:monitor.configure'         // Configure monitoring settings
'ext:antimalware.enable'        // Enable antimalware
'ext:custom_script.run'         // Run custom script
'ext:backup.schedule'           // Schedule backup
'ext:dependency.resolve'        // Resolve dependencies

// Security Domain (sec:)
'sec:encryption.enable'         // Enable disk encryption
'sec:trusted_launch.configure'  // Configure Trusted Launch
'sec:cmk.setup'                 // Setup Customer Managed Keys
'sec:compliance.validate'       // Validate compliance
'sec:identity.assign'           // Assign managed identity

// Networking Domain (net:) - Existing helpers with new prefixes
'net:vnet.template'             // Get VNet template
'net:subnet.pattern'            // Get subnet pattern
'net:nsg.rule'                  // Get NSG rule
'net:lb.template'               // Get load balancer template
'net:appgw.template'            // Get Application Gateway template

// Common Domain (common:) - Shared utilities
'common:naming.vm'              // Generate VM name
'common:naming.resource'        // Generate resource name
'common:validate.cidr'          // Validate CIDR notation
'common:calculate.cost'         // Calculate resource cost
```

### 3. Folder Structure

```
src/
├── common/
│   ├── helpers/
│   │   ├── naming.ts           # common:naming.* helpers
│   │   ├── validation.ts       # common:validate.* helpers
│   │   └── calculation.ts      # common:calculate.* helpers
│   ├── types.ts                # Shared TypeScript types
│   └── index.ts                # Common domain registry
├── extensions/
│   ├── helpers/
│   │   ├── monitoring.ts       # ext:monitor.* helpers
│   │   ├── antimalware.ts      # ext:antimalware.* helpers
│   │   ├── custom-script.ts    # ext:custom_script.* helpers
│   │   ├── backup.ts           # ext:backup.* helpers
│   │   └── dependency.ts       # ext:dependency.* helpers
│   ├── templates/              # Extension ARM templates
│   ├── metadata/               # Extension metadata definitions
│   └── index.ts                # Extensions domain registry
├── security/
│   ├── helpers/
│   │   ├── encryption.ts       # sec:encryption.* helpers
│   │   ├── trusted-launch.ts   # sec:trusted_launch.* helpers
│   │   ├── compliance.ts       # sec:compliance.* helpers
│   │   └── identity.ts         # sec:identity.* helpers
│   ├── templates/              # Security ARM templates
│   ├── compliance/             # Compliance framework configs
│   └── index.ts                # Security domain registry
├── networking/                 # Existing (needs refactoring)
│   ├── helpers/                # Split existing helpers
│   │   ├── vnet.ts            # net:vnet.* helpers
│   │   ├── subnet.ts          # net:subnet.* helpers
│   │   ├── nsg.ts             # net:nsg.* helpers
│   │   ├── loadbalancer.ts    # net:lb.* helpers
│   │   ├── appgateway.ts      # net:appgw.* helpers
│   │   ├── bastion.ts         # net:bastion.* helpers
│   │   └── peering.ts         # net:peering.* helpers
│   └── index.ts               # Networking domain registry (updated)
├── vm/                         # Existing (needs refactoring)
│   ├── helpers/
│   │   ├── sizes.ts           # vm:size.* helpers
│   │   ├── images.ts          # vm:image.* helpers
│   │   └── storage.ts         # vm:storage.* helpers
│   └── index.ts               # VM domain registry (updated)
└── index.ts                    # Main plugin entry point
```

### 4. Helper Manifest System

#### Build-Time Manifest Generation
```typescript
// helpers.manifest.json (generated at build time)
{
  "version": "1.3.0",
  "helpers": [
    {
      "namespace": "ext",
      "name": "monitor.install",
      "fullName": "ext:monitor.install",
      "arity": 1,
      "module": "extensions/helpers/monitoring",
      "platforms": ["windows", "linux"],
      "dependencies": [],
      "description": "Install Azure Monitor Agent extension"
    },
    {
      "namespace": "ext", 
      "name": "dependency.install",
      "fullName": "ext:dependency.install",
      "arity": 1,
      "module": "extensions/helpers/dependency",
      "platforms": ["windows", "linux"],
      "dependencies": ["ext:monitor.install"],
      "description": "Install Dependency Agent (requires Monitor Agent)"
    },
    {
      "namespace": "sec",
      "name": "encryption.enable", 
      "fullName": "sec:encryption.enable",
      "arity": 2,
      "module": "security/helpers/encryption",
      "platforms": ["windows", "linux"],
      "dependencies": ["sec:identity.assign"],
      "description": "Enable Azure Disk Encryption"
    }
  ]
}
```

#### Manifest Validation
```typescript
// src/common/manifest-validator.ts
export class ManifestValidator {
  validateNoDuplicates(manifest: HelperManifest): ValidationResult {
    // Check for duplicate helper names
    // Fail on conflicts
  }
  
  validateDependencies(manifest: HelperManifest): ValidationResult {
    // Validate all dependencies exist
    // Detect circular dependencies
  }
  
  validateNamingConventions(manifest: HelperManifest): ValidationResult {
    // Ensure all helpers follow namespace conventions
    // Validate prefix usage
  }
}
```

## 🔄 Extension Dependency Management

### Extension Metadata Model

```typescript
// src/extensions/metadata/extension.ts
export interface ExtensionMetadata {
  id: string;                    // 'azure-monitor-agent'
  name: string;                  // 'Azure Monitor Agent'
  publisher: string;             // 'Microsoft.EnterpriseCloud.Monitoring'
  version: string;               // '1.0.0'
  requires: string[];            // [] (no dependencies)
  conflicts: string[];           // ['old-monitoring-agent']
  platforms: Platform[];        // ['windows', 'linux']
  retryPolicy: RetryPolicy;      // { maxAttempts: 3, backoff: 'exponential' }
  installOrder: number;          // 10 (lower = earlier)
  optional: boolean;             // false
  settings: ExtensionSettings;   // Configuration schema
}

export interface ExtensionGraph {
  nodes: Map<string, ExtensionMetadata>;
  edges: Map<string, string[]>;  // dependencies
}
```

### Dependency Resolution Algorithm

```typescript
// src/extensions/dependency-resolver.ts
export class ExtensionDependencyResolver {
  
  /**
   * Perform topological sort on extension DAG
   * Returns installation order or throws on cycles
   */
  resolveDependencies(extensions: ExtensionMetadata[]): string[] {
    const graph = this.buildGraph(extensions);
    const sorted = this.topologicalSort(graph);
    
    if (sorted.length !== extensions.length) {
      throw new CircularDependencyError(this.detectCycle(graph));
    }
    
    return sorted;
  }
  
  private topologicalSort(graph: ExtensionGraph): string[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const result: string[] = [];
    
    const visit = (nodeId: string) => {
      if (visiting.has(nodeId)) {
        throw new CircularDependencyError(`Cycle detected involving ${nodeId}`);
      }
      
      if (!visited.has(nodeId)) {
        visiting.add(nodeId);
        
        const dependencies = graph.edges.get(nodeId) || [];
        dependencies.forEach(dep => visit(dep));
        
        visiting.delete(nodeId);
        visited.add(nodeId);
        result.push(nodeId);
      }
    };
    
    graph.nodes.forEach((_, nodeId) => visit(nodeId));
    return result.reverse(); // Dependencies first
  }
  
  /**
   * Validate extension compatibility
   */
  validateConfiguration(extensions: ExtensionMetadata[], platform: Platform): ValidationResult {
    // Check platform compatibility
    // Validate no conflicts
    // Ensure all dependencies available
    // Check for missing prerequisites
  }
}
```

### Template Generation Strategy

```typescript
// src/extensions/template-generator.ts
export class ExtensionTemplateGenerator {
  
  generateInstallationTemplate(
    extensions: ExtensionMetadata[], 
    platform: Platform
  ): InstallationTemplate {
    
    const resolver = new ExtensionDependencyResolver();
    const installOrder = resolver.resolveDependencies(extensions);
    
    switch (platform) {
      case 'windows':
        return this.generatePowerShellTemplate(installOrder, extensions);
      case 'linux':
        return this.generateBashTemplate(installOrder, extensions);
      default:
        throw new UnsupportedPlatformError(platform);
    }
  }
  
  private generatePowerShellTemplate(
    order: string[], 
    extensions: ExtensionMetadata[]
  ): PowerShellTemplate {
    // Generate sequential PowerShell script
    // Add error handling and retry logic
    // Include status checking
  }
  
  private generateBashTemplate(
    order: string[], 
    extensions: ExtensionMetadata[]
  ): BashTemplate {
    // Generate sequential Bash script  
    // Add error handling and retry logic
    // Include status checking
  }
}
```

## 🧪 Testing Strategy

### 1. Unit Tests
```typescript
// src/__tests__/helpers/extensions.test.ts
describe('Extension Helpers', () => {
  test('ext:monitor.install generates correct configuration', () => {
    const result = helpers['ext:monitor.install']('workspace-id');
    expect(result).toMatchSnapshot();
  });
  
  test('ext:dependency.install requires monitor agent', () => {
    expect(() => {
      helpers['ext:dependency.install'](); // No monitor agent
    }).toThrow('Monitor Agent required');
  });
});
```

### 2. Dependency Resolution Tests
```typescript
// src/__tests__/dependency-resolver.test.ts
describe('Extension Dependency Resolver', () => {
  test('resolves simple dependency chain', () => {
    const extensions = [
      { id: 'dependency-agent', requires: ['monitor-agent'] },
      { id: 'monitor-agent', requires: [] }
    ];
    
    const resolver = new ExtensionDependencyResolver();
    const order = resolver.resolveDependencies(extensions);
    
    expect(order).toEqual(['monitor-agent', 'dependency-agent']);
  });
  
  test('detects circular dependencies', () => {
    const extensions = [
      { id: 'ext-a', requires: ['ext-b'] },
      { id: 'ext-b', requires: ['ext-a'] }
    ];
    
    const resolver = new ExtensionDependencyResolver();
    
    expect(() => resolver.resolveDependencies(extensions))
      .toThrow(CircularDependencyError);
  });
});
```

### 3. Manifest Validation Tests
```typescript
// src/__tests__/manifest-validator.test.ts
describe('Helper Manifest Validator', () => {
  test('catches duplicate helper names', () => {
    const manifest = {
      helpers: [
        { fullName: 'ext:monitor.install', ... },
        { fullName: 'ext:monitor.install', ... }  // Duplicate!
      ]
    };
    
    const validator = new ManifestValidator();
    const result = validator.validateNoDuplicates(manifest);
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Duplicate helper: ext:monitor.install');
  });
});
```

## 🚀 Migration Strategy

### Phase 1: Infrastructure Setup (Days 1-2)
1. Create new folder structure
2. Implement helper registry system
3. Create manifest generation
4. Add validation pipeline

### Phase 2: Namespace Migration (Days 3-4)  
1. Refactor existing helpers with prefixes
2. Update all tests
3. Maintain backward compatibility aliases
4. Update documentation

### Phase 3: New Features (Days 5-8)
1. Implement extension helpers with new structure
2. Implement security helpers with new structure
3. Add dependency resolution
4. Full testing and validation

## 🔒 Governance & Quality

### 1. Lint Rules
```typescript
// .eslintrc.js additions
rules: {
  'custom/helper-namespace-prefix': 'error',     // Enforce namespace prefixes
  'custom/no-global-helper-registration': 'error', // Prevent global registration
  'custom/helper-naming-convention': 'error'     // Enforce naming conventions
}
```

### 2. Pre-commit Hooks
```bash
# Validate helper manifest
npm run validate-helpers

# Check for naming conflicts  
npm run check-helper-conflicts

# Validate dependency resolution
npm run validate-dependencies
```

### 3. CI/CD Checks
```yaml
# .github/workflows/helper-validation.yml
- name: Validate Helper Structure
  run: |
    npm run build:manifest
    npm run validate:helpers
    npm run test:dependencies
```

## 📚 Documentation Updates

### 1. Helper Usage Guide
```handlebars
<!-- OLD (Phase 2) -->
{{vnet-template "hub"}}
{{nsg-rule "allow-rdp"}}

<!-- NEW (Phase 3+) -->
{{net:vnet.template "hub"}}
{{net:nsg.rule "allow-rdp"}}
{{ext:monitor.install "workspace-id"}}
{{sec:encryption.enable "vault-uri" "key-name"}}
```

### 2. Migration Guide
- Backward compatibility timeline
- Helper alias deprecation schedule
- Automated migration tools
- Breaking change notifications

---

**Implementation Priority:**
1. **High**: Helper registry system, namespace prefixes
2. **Medium**: Dependency resolution, manifest validation  
3. **Low**: Advanced governance, automated migration tools

This architecture provides scalable foundation for Phase 3 and beyond while maintaining backward compatibility and preventing the namespace conflicts that would become critical as the plugin grows.