# Security Policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| 0.1.x   | Yes (experimental / pre-production) |

## Reporting a vulnerability

Please report security issues privately. Do **not** open a public GitHub issue for exploitable bugs.

- Email: [security via GitHub private vulnerability reporting](https://github.com/positive-intentions/dim/security/advisories/new)
- Or open a [GitHub Security Advisory](https://github.com/positive-intentions/dim/security/advisories/new) draft

Include: affected version/commit, reproduction steps, impact, and (if known) a suggested fix. We aim to acknowledge reports within 7 days and ship a fix or mitigation for confirmed High/Critical issues as soon as practical.

## Scope

In scope:

- XSS via the template / commit path (`html`, `render`, `unsafeHTML`, attribute and URL bindings)
- Cryptography used by `CryptoManager` / encrypted store
- WASM panic / abort behaviour that can DoS an application
- Supply-chain issues in published packages and GitHub Actions

Out of scope:

- Applications that intentionally pass untrusted data to `unsafeHTML` / `unsafeCSS`
- Browser bugs outside dim’s control
- Social engineering / phishing against end users

## Hardening expectations (0.1.2+)

- String children via `renderChildren` are text, never HTML
- Attribute bindings reject `on*` and `srcdoc`; URL attributes are sanitized
- Property bindings reject `.innerHTML` / `.outerHTML`
- `html` requires a real template-strings array (with `.raw`)
- Formal laws for the pure core live under `verification/lean/` and are checked by `npm run verify`

Full findings and status: [security/analysis.md](./security/analysis.md).
