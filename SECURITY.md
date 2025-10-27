# Security Policy

## Supported Versions

We actively support the following versions of `@hoiltd/azmp-plugin-vm` with security updates:

| Version | Supported          | Status                              |
| ------- | ------------------ | ----------------------------------- |
| 1.7.x   | :white_check_mark: | Current - Full support              |
| 1.6.x   | :white_check_mark: | Maintenance - Security fixes only   |
| 1.5.x   | :white_check_mark: | Maintenance - Security fixes only   |
| < 1.5   | :x:                | No longer supported                 |

### Release Lifecycle

- **Current Release (1.7.x):** Full support including new features, bug fixes, and security patches
- **Maintenance Releases (1.6.x, 1.5.x):** Critical security fixes only
- **End of Life (< 1.5):** No updates provided

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

**Please DO NOT open a public GitHub issue for security vulnerabilities.**

Instead, report security issues via one of these methods:

1. **GitHub Security Advisory (Preferred)**
   - Go to [Security Advisories](https://github.com/HOME-OFFICE-IMPROVEMENTS-LTD/azmp-plugin-vm/security/advisories)
   - Click "Report a vulnerability"
   - Provide detailed information about the vulnerability

2. **Email**
   - Send details to: **msalsouri@hotmail.com**
   - Subject: `[SECURITY] azmp-plugin-vm vulnerability`
   - Include:
     - Description of the vulnerability
     - Steps to reproduce
     - Affected versions
     - Potential impact
     - Suggested fix (if available)

3. **Private Disclosure via GitHub**
   - Contact [@msalsouri](https://github.com/msalsouri) directly via GitHub

### What to Include in Your Report

Please provide as much information as possible:

- **Vulnerability Description:** Clear description of the security issue
- **Affected Component:** Which module/helper/CLI command is affected
- **Reproduction Steps:** Step-by-step guide to reproduce the issue
- **Proof of Concept:** Code snippet or example demonstrating the vulnerability
- **Impact Assessment:** Potential consequences (data exposure, code execution, etc.)
- **Affected Versions:** Which versions are vulnerable
- **Proposed Solution:** If you have ideas for fixing the issue
- **CVE ID:** If already assigned

### Response Timeline

| Timeframe      | Action                                                      |
| -------------- | ----------------------------------------------------------- |
| **24 hours**   | Initial acknowledgment of your report                       |
| **72 hours**   | Preliminary assessment and severity classification          |
| **7 days**     | Detailed analysis and proposed fix                          |
| **14-30 days** | Release security patch (depending on severity)              |

### Severity Classification

We follow the CVSS v3.1 scoring system:

| Severity | CVSS Score | Response Time | Description                                    |
| -------- | ---------- | ------------- | ---------------------------------------------- |
| Critical | 9.0-10.0   | 24-48 hours   | Immediate threat, exploitable remotely         |
| High     | 7.0-8.9    | 3-7 days      | Significant impact, requires attention         |
| Medium   | 4.0-6.9    | 7-14 days     | Moderate impact, should be addressed           |
| Low      | 0.1-3.9    | 14-30 days    | Minimal impact, low priority                   |

## Security Best Practices

When using `@hoiltd/azmp-plugin-vm`, follow these security guidelines:

### 1. Keep Dependencies Updated

```bash
# Check for outdated packages
npm outdated

# Update to latest patch versions
npm update

# Update to latest major versions (review breaking changes)
npm install @hoiltd/azmp-plugin-vm@latest
```

### 2. Validate Generated Templates

Always validate generated ARM templates before deployment:

```javascript
const Handlebars = require('handlebars');
const { registerHelpers } = require('@hoiltd/azmp-plugin-vm');

// Register helpers
registerHelpers(Handlebars);

// Validate template structure
// Use validation helpers from src/templates/validation/
```

### 3. Secure Configuration

**DO NOT commit sensitive data to templates:**

```handlebars
{{!-- ❌ BAD: Hardcoded credentials --}}
{
  "adminPassword": "MyP@ssw0rd123"
}

{{!-- ✅ GOOD: Use parameters --}}
{
  "adminPassword": "[parameters('adminPassword')]"
}
```

### 4. Use Managed Identities

Prefer managed identities over credentials:

```handlebars
{{!-- Use identity helpers from src/identity/ --}}
{{identity:managedIdentity
  type="SystemAssigned"
  scope="Resource"
}}
```

### 5. Enable Azure Security Features

**Disk Encryption:**
```handlebars
{{security:diskEncryption
  keyVault="[parameters('keyVaultId')]"
  enabled=true
}}
```

**Trusted Launch:**
```handlebars
{{security:trustedLaunch
  secureBootEnabled=true
  vTpmEnabled=true
}}
```

### 6. Monitor Generated Resources

Enable monitoring and alerting:

```handlebars
{{!-- Use monitoring helpers from v1.7.0 --}}
{{monitor:diagnosticSettings
  resourceId="[resourceId('Microsoft.Compute/virtualMachines', parameters('vmName'))]"
  workspaceId="[parameters('logAnalyticsWorkspaceId')]"
}}
```

### 7. Network Security

Always configure NSG rules properly:

```handlebars
{{!-- Restrict management ports --}}
{{networking:nsgRule
  name="AllowSSH"
  priority=100
  direction="Inbound"
  access="Allow"
  protocol="Tcp"
  sourceAddressPrefix="10.0.0.0/16"  {{!-- Not 0.0.0.0/0 --}}
  destinationPortRange="22"
}}
```

### 8. Regular Security Audits

```bash
# Run npm audit
npm audit

# Fix vulnerabilities automatically
npm audit fix

# For breaking changes, review manually
npm audit fix --force
```

## Known Security Considerations

### 1. Template Injection

**Risk:** User-controlled input in Handlebars templates could lead to code injection.

**Mitigation:**
- Always sanitize user input before passing to helpers
- Use parameterized templates
- Validate template structure before compilation

### 2. Credential Exposure

**Risk:** Accidental inclusion of secrets in generated templates.

**Mitigation:**
- Use Azure Key Vault references
- Leverage managed identities
- Never hardcode credentials
- Use `.gitignore` for sensitive files

### 3. Resource Misconfiguration

**Risk:** Improperly configured resources (NSG rules, encryption, etc.).

**Mitigation:**
- Use built-in security helpers
- Enable ARM template validation
- Review security recommendations in docs
- Follow Azure Well-Architected Framework

### 4. Supply Chain Attacks

**Risk:** Compromised dependencies could inject malicious code.

**Mitigation:**
- Lock dependency versions with `package-lock.json`
- Regularly audit dependencies with `npm audit`
- Enable Dependabot alerts
- Review dependency changes in PRs

## Security Features

### v1.7.0 Security Enhancements

- **Monitoring & Alerting:** Detect anomalies and security events
- **Activity Log Alerts:** Monitor administrative actions
- **Security Workbooks:** Azure Defender integration
- **Diagnostic Settings:** Centralized logging for audit trails

### Built-in Security Helpers

| Helper                          | Purpose                                      | Module     |
| ------------------------------- | -------------------------------------------- | ---------- |
| `security:diskEncryption`       | Enable Azure Disk Encryption                 | Security   |
| `security:trustedLaunch`        | Enable Trusted Launch features               | Security   |
| `identity:managedIdentity`      | Configure managed identities                 | Identity   |
| `identity:rbac`                 | Assign RBAC roles                            | Identity   |
| `networking:nsg`                | Create Network Security Groups               | Networking |
| `monitor:diagnosticSettings`    | Enable audit logging                         | Monitoring |
| `alert:activityLogAlert`        | Alert on administrative actions              | Alerting   |

## Compliance & Standards

This plugin helps implement security controls for:

- **CIS Azure Foundations Benchmark:** VM security configuration
- **Azure Security Benchmark:** Best practices for Azure resources
- **NIST Cybersecurity Framework:** Identify, Protect, Detect, Respond
- **ISO 27001:** Information security management
- **SOC 2:** Security, availability, and confidentiality

## Vulnerability Disclosure

When a security vulnerability is fixed:

1. **Security Advisory:** Published on GitHub Security Advisories
2. **CVE Assignment:** Request CVE ID for tracking
3. **Patch Release:** Immediate patch version release (e.g., 1.7.0 → 1.7.1)
4. **CHANGELOG Update:** Document the security fix
5. **Notification:** Email to security mailing list (if established)
6. **Public Disclosure:** After patch is available (30-90 days)

### Recent Security Fixes

| Version | CVE ID | Severity | Description                     | Fixed Date |
| ------- | ------ | -------- | ------------------------------- | ---------- |
| -       | -      | -        | No vulnerabilities reported yet | -          |

## Security Contacts

- **Primary Contact:** M S AL-SOURI ([@msalsouri](https://github.com/msalsouri))
- **Email:** msalsouri@hotmail.com
- **GitHub Security:** [Security Advisories](https://github.com/HOME-OFFICE-IMPROVEMENTS-LTD/azmp-plugin-vm/security/advisories)

## Additional Resources

- [Azure Security Documentation](https://docs.microsoft.com/en-us/azure/security/)
- [Azure Security Baseline for VMs](https://docs.microsoft.com/en-us/security/benchmark/azure/baselines/virtual-machines-linux-security-baseline)
- [OWASP Secure Coding Practices](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)
- [npm Security Best Practices](https://docs.npmjs.com/security-best-practices)

## Bug Bounty

We currently do not have a formal bug bounty program. However, we greatly appreciate responsible disclosure and will publicly acknowledge security researchers who report valid vulnerabilities.

---

**Last Updated:** October 25, 2025  
**Version:** 1.7.0
