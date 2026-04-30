**Written by Aryan Giri**

## 🧠 Overview

MFA fatigue (also known as push bombing) is a social engineering + authentication abuse technique where attackers spam multi-factor authentication (MFA) push notifications to a victim until they accidentally or knowingly approve one.

Unlike traditional exploits, this attack does **not break cryptography** — it exploits **human behavior and weak MFA design assumptions**.

---

## 🔥 The Core Vulnerability

### What’s Broken?

* Systems assume: **"User approval = legitimate login"**
* No strong verification of *intent*
* Over-reliance on **push-based MFA (Approve/Deny)**

### Weak Design Patterns

* Unlimited MFA push attempts
* No rate limiting
* No contextual verification (location, device, reason)
* No number matching or challenge-response

---

## ⚙️ Attack Workflow (Step-by-Step)

### 1. Initial Access

Attacker obtains valid credentials via:

* Phishing kits
* Credential dumps
* Infostealer malware logs

### 2. Authentication Abuse

* Attacker attempts login repeatedly
* Each attempt triggers an MFA push notification

### 3. Fatigue Phase

Victim receives dozens of prompts:

> "Approve sign-in request?"

Human reactions:

* Annoyance
* Confusion
* Misclick

### 4. Social Engineering Layer (Optional)

Attacker may call victim pretending to be IT support:

> "We detected suspicious activity, please approve to secure your account"

### 5. Account Compromise

* Victim approves one request
* Attacker gains valid session/token

---

## 💻 Practical Simulation (Lab Use Only)

### Goal

Simulate repeated login attempts to trigger MFA prompts in a controlled lab environment.

### Example Python Script

```python
import requests
import time

url = "https://target-app.com/login"
data = {
    "username": "victim",
    "password": "known_password"
}

while True:
    r = requests.post(url, data=data)
    print("Triggered MFA push")
    time.sleep(2)
```

### Tools You Can Use

* Burp Suite Intruder (for request looping)
* OWASP ZAP
* Custom scripts (Python requests / Go HTTP)
* Headless browsers (Playwright, Selenium)

⚠️ Only test on authorized labs (TryHackMe, HTB, local apps)

---

## 🧬 Why This Works (Technical Breakdown)

### Trust Model Flaw

* System trusts **user decision blindly**
* No cryptographic binding between request and approval

### Human Factor Exploit

* Humans are not reliable security controls
* Repetition leads to reduced attention

### Lack of Context

* User cannot distinguish:

  * Legit login
  * Attacker-triggered login

---

## 🌍 Real-World Case Studies

### 1. Uber Breach (2022)

* Attacker used stolen contractor credentials
* Spammed MFA requests repeatedly
* Eventually gained approval
* Escalated access to internal systems

Impact:

* Internal dashboards exposed
* Sensitive infrastructure accessed

---

### 2. Cisco MFA Fatigue Attack

* Employees targeted with push bombing
* Combined with social engineering
* Attempted access to VPN and internal systems

---

### 3. Microsoft & Okta Targeting Campaigns

* Large-scale phishing + MFA fatigue combo
* Focus on cloud admin accounts

---

## 🛡️ Detection & Defense

### Strong Mitigations

#### 1. Number Matching (Critical)

* User must enter a code shown on login screen
* Prevents blind approval

#### 2. Rate Limiting

* Limit MFA attempts per user/IP

#### 3. Device Binding

* Only allow known devices

#### 4. Risk-Based Authentication

* Analyze:

  * Location
  * Device fingerprint
  * Time of access

#### 5. Passkeys / FIDO2

* Eliminates push-based approval entirely

---

## 🔄 Attacker Evolution (2025–2026 Trends)

* AI voice cloning for fake IT calls
* Real-time phishing proxies (Evilginx-style)
* Targeting cloud IAM (AWS, Azure, GCP)
* Combining MFA fatigue with session hijacking

---

## 🔗 References & Further Reading

* [https://attack.mitre.org/techniques/T1621/](https://attack.mitre.org/techniques/T1621/)
* [https://www.cisa.gov/news-events/cybersecurity-advisories/aa22-320a](https://www.cisa.gov/news-events/cybersecurity-advisories/aa22-320a)
* [https://www.microsoft.com/en-us/security/blog/](https://www.microsoft.com/en-us/security/blog/)
* [https://duo.com/blog/mfa-fatigue-attacks](https://duo.com/blog/mfa-fatigue-attacks)
* [https://www.okta.com/resources/](https://www.okta.com/resources/)

---

## 🎯 Key Takeaway

MFA is not a silver bullet.

If implementation is weak:

> "MFA present" ≠ "MFA secure"

Security must validate **intent**, not just **interaction**.
