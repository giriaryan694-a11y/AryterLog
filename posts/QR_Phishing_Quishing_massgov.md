# QR-Based Phishing Campaign Impersonating mass.gov (Quishing)
**Written By Aryan Giri**
## Executive Summary

A multi-stage phishing campaign leveraging QR codes and physical mail was identified. The attackers impersonate Massachusetts government services to harvest sensitive financial and personal data. This campaign combines offline social engineering with layered web infrastructure, increasing effectiveness and evasion.

---

## Attack Chain Overview

Victim → Fraud Letter → QR Code → Fake CAPTCHA → Phishing Site → Data Theft

---

## Stage 1: Initial Access (Physical Social Engineering)

* Victims receive a fraudulent parking fine letter
* Uses government branding and urgency
* QR code used as entry point

---

## Stage 2: Redirect Layer (Fake CAPTCHA)

URL:
[https://ek.anoreksi.com/public/OiOQNb](https://ek.anoreksi.com/public/OiOQNb)

* Acts as fake verification page
* Redirects victims to phishing site

---

## Stage 3: Phishing Page (Credential Harvesting)

URL:
[https://mass.gov-srh.org/dmv/#/index](https://mass.gov-srh.org/dmv/#/index)

* Mimics government payment portal
* Uses subdomain impersonation (mass.gov-srh.org)

---

## Data Targeted

* Personal identity information
* Address
* Credit card details
* PIN

---

## Infrastructure Analysis

### Base Domain

* gov-srh.org
* Nameservers:

  * ns1.dyna-ns.net
  * ns2.dyna-ns.net

### Subdomain

* mass.gov-srh.org

### Redirect Infrastructure

* ek.anoreksi.com

---

## Tools & Methodology

### QR Code Analysis

[https://giriaryan694-a11y.github.io/SimpleQrReader/](https://giriaryan694-a11y.github.io/SimpleQrReader/)

### OSINT Tool

[https://giriaryan694-a11y.github.io/ary.osint/](https://giriaryan694-a11y.github.io/ary.osint/)

### WHOIS Analysis

* Identified base domain and registrar
* Extracted nameserver information

---

## Response Actions

* Reported to domain registrar
* Reported redirect infrastructure provider
* Submitted to Google Safe Browsing
* Notified impersonated organization
* Planned submission to PhishTank

---

## MITRE ATT&CK Mapping

### Initial Access

* T1566.001 – Phishing (QR-based delivery)

### User Execution

* T1204 – User interacts with malicious content

### Resource Development

* T1583.001 – Acquire domain
* T1583.006 – Acquire web hosting

### Defense Evasion

* T1621 – Multi-stage redirection
* T1036 – Masquerading (domain impersonation)

### Credential Access

* T1056 – Input capture via phishing form

---

## Indicators of Compromise (IOCs)

[https://mass.gov-srh.org/dmv/#/index](https://mass.gov-srh.org/dmv/#/index)
[https://ek.anoreksi.com/public/OiOQNb](https://ek.anoreksi.com/public/OiOQNb)
gov-srh.org
anoreksi.com

---

## Key Insights

* QR phishing (quishing) is increasing
* Multi-stage redirects evade detection
* Subdomain impersonation is effective
* Physical + digital attack combination increases success rate

---

## Ethical Reflection

* Responsible disclosure followed
* No active interference conducted
* Focus on victim protection

---

## Conclusion

This campaign demonstrates a modern phishing approach combining physical deception, technical evasion, and social engineering. Effective defense requires full attack chain analysis and coordinated reporting.

---
