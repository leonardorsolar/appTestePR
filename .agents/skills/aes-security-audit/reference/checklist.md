# Security Audit Checklist

Reference material for `aes-security-audit`. Work through every section for the feature under audit; none of these may be skipped or left partially completed.

## 1. Threat Modeling (STRIDE)

For each component/boundary identified in Workflow step 2:

| Threat | Description | Mitigation | Status |
|--------|-------------|------------|--------|
| **S**poofing | Can someone impersonate a user/service? | ... | ✓/✗ |
| **T**ampering | Can data be modified in transit/at rest? | ... | ✓/✗ |
| **R**epudiation | Can actions be denied without evidence? | ... | ✓/✗ |
| **I**nformation Disclosure | Can sensitive data leak? | ... | ✓/✗ |
| **D**enial of Service | Can the feature be overwhelmed? | ... | ✓/✗ |
| **E**levation of Privilege | Can users gain unauthorized access? | ... | ✓/✗ |

## 2. OWASP Top 10 Checklist

- [ ] **Injection**: SQL, NoSQL, OS command, LDAP injection vectors
- [ ] **Broken Authentication**: Session management, credential handling
- [ ] **Sensitive Data Exposure**: Encryption at rest/transit, PII handling
- [ ] **XML/XXE**: External entity processing (if applicable)
- [ ] **Broken Access Control**: Authorization checks on every endpoint
- [ ] **Security Misconfiguration**: Default configs, error messages, headers
- [ ] **XSS**: Output encoding, CSP headers, DOM manipulation
- [ ] **Insecure Deserialization**: Object deserialization from untrusted sources
- [ ] **Known Vulnerabilities**: Dependency scanning results
- [ ] **Insufficient Logging**: Security events are logged and auditable

## 3. Dependency Audit

```bash
# Run available dependency scanners
npm audit                    # Node.js
pip audit                    # Python (if applicable)
```

Report: vulnerability count by severity, remediation steps.

## 4. Code-Level Security Review

- [ ] Input validation on all external data
- [ ] Output encoding for all rendered content
- [ ] Authentication required on all protected endpoints
- [ ] Authorization checked at the resource level (not just route)
- [ ] Rate limiting on public/sensitive endpoints
- [ ] CORS configured correctly
- [ ] Secrets not hardcoded (env vars or secret manager)
- [ ] SQL queries use parameterized statements
- [ ] File uploads validated (type, size, content)
- [ ] Error messages don't leak internal details

## 5. Data Privacy

- [ ] PII is identified and handled appropriately
- [ ] Data retention policies are respected
- [ ] User consent flows are correct (if applicable)
- [ ] Data can be exported/deleted on request (GDPR/CCPA)

## 6.5 Business Logic Checklist

No dynamic pentest runs against this feature, so these checks are the manual
compensation for the class of bugs that runtime probing would normally catch.
Verify each one by reading the code path, not by assuming intent:

- [ ] **Resource-level authorization**: every access check validates the
      caller against the specific resource being acted on (e.g. "does this
      user own *this* record?"), not just that the caller hit an
      authenticated route. Check every endpoint that takes a resource ID as
      a parameter.
- [ ] **Rate limiting on sensitive endpoints**: login, password reset, token
      refresh, bulk export/import, payment, and any other state-changing or
      enumerable endpoint has rate limiting applied — not just the API
      gateway default, if one exists.
- [ ] **State validation in multi-step flows**: every step of a multi-step
      flow (checkout, onboarding, approval chains) validates server-side
      that the required prior steps actually completed, in order — a client
      cannot skip, replay, or reorder steps by calling a later endpoint
      directly.

## Summary Template

```markdown
## Security Audit Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | N |
| 🟡 High | N |
| 🔵 Medium | N |
| ⚪ Low | N |

## Verdict: ✓ PASSED / ⚠ CONDITIONAL PASS / ✗ FAILED

### Required Remediations
1. ...

### Accepted Risks
1. ...
```

## Quality Gates

- STRIDE analysis covers all new components/boundaries.
- OWASP checklist is fully evaluated (not skipped).
- Dependency audit was actually run (not assumed).
- Business Logic Checklist is evaluated for every multi-step flow and every
  resource-scoped endpoint in the feature.
- Every finding has a specific remediation or accepted-risk justification.
- Every Critical/High finding has a functional PoC attached.
