*Written by Aryan Giri*

## Introduction

Modern phishing attacks have evolved far beyond fake emails and obvious scam links. In today’s SaaS-heavy world, attackers increasingly exploit **authentication flows, user trust, and browser interactions** instead of traditional malware.

Two rising attack patterns are:

* **Consentfix (OAuth consent phishing)**
* **Clickfix (interaction-based deception attacks)**

Both rely on one core weakness: **users approving something they don’t fully understand.**

---

## 1. What is Consentfix?

### Overview

Consentfix refers to phishing attacks that abuse **OAuth consent screens** used by services like Google, Microsoft, GitHub, and other cloud platforms.

Instead of stealing passwords, attackers trick users into **granting application access** to their accounts.

### How OAuth normally works

When you log in to an app using “Sign in with Google,” you are shown a permission screen like:

* Access email
* Read profile info
* Manage files (Drive)

This is called **OAuth consent**.

---

### How Consentfix attacks work

1. User receives a malicious link (email, chat, or fake document)
2. They are redirected to a legitimate login page (Google/Microsoft)
3. After login, they see a **fake or manipulated consent request**
4. User clicks “Allow”
5. Attacker gains API-level access to account data

---

### Why it is dangerous

* No password theft required
* Bypasses MFA in many cases
* Access persists via tokens
* Can access email, files, contacts, calendar

---

## 2. What is Clickfix?

### Overview

Clickfix attacks rely on **fake interaction prompts** designed to trick users into clicking something that triggers a malicious action.

These are often seen in:

* Fake CAPTCHA pages
* Fake “browser update required” alerts
* Fake download or “fix this issue” buttons

---

### How Clickfix attacks work

1. Victim lands on a convincing fake page
2. Page prompts action like:

   * “Click to verify you are human”
   * “Fix your browser to continue”
   * “Enable security check”
3. User clicks the button
4. Action triggers one of the following:

   * Malicious redirect chain
   * Clipboard injection
   * Fake extension installation
   * Malware download (often infostealers)

---

### Why it is dangerous

* Exploits user reflex behavior (clicking without verifying)
* Often bypasses antivirus detection
* Used as first stage for credential theft or session hijacking

---

## 3. Key Differences

| Feature     | Consentfix (OAuth phishing)                | Clickfix (interaction phishing) |
| ----------- | ------------------------------------------ | ------------------------------- |
| Target      | Cloud accounts (Google, Microsoft, GitHub) | Browser users in general        |
| Method      | OAuth permission abuse                     | Fake UI interaction             |
| Goal        | Steal account access tokens                | Trigger malicious execution     |
| Persistence | High (long-lived tokens)                   | Medium (depends on payload)     |

---

## 4. Why These Attacks Work

These attacks succeed because they exploit:

* Trust in legitimate platforms (Google/Microsoft login pages)
* Poor understanding of OAuth permissions
* Habitual clicking behavior
* UI spoofing that looks identical to real pages

Modern phishing kits can now:

* Auto-generate consent screens per target
* Clone real login UIs perfectly
* Adapt based on victim environment

---

## 5. How to Defend Against Them

### For users

* Always check **requested permissions** carefully
* Avoid approving apps with excessive access (e.g., full Gmail + Drive access for simple tools)
* Verify URLs before logging in
* Avoid clicking “fix/update/verify” prompts from unknown sources

---

### For organizations

* Restrict third-party OAuth app consent
* Monitor unusual OAuth grants
* Implement conditional access policies
* Regularly audit connected applications

---

## 6. Security Insight

These attacks represent a shift in cybersecurity threats:

> The weakest exploit is no longer software — it is user trust in authentication flows.

Instead of breaking systems, attackers now **abuse legitimate identity systems and browser behavior.**

---

## Conclusion

Consentfix and Clickfix attacks show how phishing has evolved into **identity and interaction exploitation** rather than simple credential theft. As SaaS ecosystems expand, understanding these techniques is critical for both defenders and ethical security researchers.

---

## Key Takeaway

If a login or permission prompt feels normal, that is exactly what attackers are counting on.

---

