
**Written by Aryan Giri**

## Introduction

A lot of beginners think ethical hacking starts with exploits, payloads, or fancy tools.

In reality, hacking starts much earlier.

Before an attacker exploits anything, they first:

* understand the target,
* collect information,
* study the network,
* identify weak points,
* and document everything.

This is why foundational skills matter more than flashy tools.

A person who understands networking, note-taking, protocols, and hacker methodology will usually outperform someone who only memorizes commands.

This article explains the core foundations behind practical ethical hacking in simple English with practical examples.

---

# What Is Ethical Hacking?

Ethical hacking means legally testing systems to discover security weaknesses before malicious attackers do.

Instead of attacking random targets illegally, ethical hackers work with permission.

Their job is to:

* discover vulnerabilities,
* show proof of impact,
* explain risks,
* and help improve security.

Ethical hackers are also called:

* penetration testers,
* red teamers,
* offensive security professionals.

---

# Why Ethical Hacking Is Different From Normal IT

Normal IT work usually focuses on:

* maintaining systems,
* fixing issues,
* configuring networks,
* managing users.

Ethical hacking focuses on:

* thinking like an attacker,
* bypassing protections,
* chaining weaknesses together,
* and understanding how compromise happens.

## Example

A system administrator may see:

* open SMB sharing.

An ethical hacker immediately thinks:

* can SMB be abused?
* is SMB signing disabled?
* is NTLM relay possible?
* are there old EternalBlue-style vulnerabilities?
* are anonymous shares enabled?

That attacker mindset is the difference.

---

# The Hacker Methodology

Most ethical hacking follows a general workflow.

## 1. Reconnaissance

This stage is about collecting information.

Examples:

* finding domains,
* searching employee names,
* collecting emails,
* identifying technologies,
* checking exposed services.

### Practical Example

A target company may expose:

* employee LinkedIn profiles,
* technology stack information,
* public GitHub repositories,
* development subdomains.

Even small details can help attackers later.

---

## 2. Scanning and Enumeration

After collecting information, attackers begin interacting with the target.

This usually includes:

* port scanning,
* service detection,
* version identification,
* SMB enumeration,
* DNS enumeration,
* web enumeration.

Enumeration is one of the most important hacking skills.

### Important mindset

Good hackers do not randomly exploit.

They first understand:

* what exists,
* what versions are running,
* what services are exposed,
* and what attack surface is available.

---

## 3. Exploitation

Once weaknesses are identified, exploitation begins.

Examples:

* weak passwords,
* vulnerable software,
* insecure file uploads,
* command injection,
* exposed services.

### Example attack chain

An attacker may:

1. discover SMB open,
2. identify SMB signing disabled,
3. perform NTLM relay,
4. gain credentials,
5. move laterally through the network.

This is called attack chaining.

Small weaknesses become dangerous when combined.

---

## 4. Post Exploitation

After gaining access, attackers attempt to:

* escalate privileges,
* maintain persistence,
* dump credentials,
* move laterally,
* access sensitive data.

### Real-world idea

Initial access is often not the final objective.

The real objective may be:

* domain admin access,
* database theft,
* ransomware deployment,
* or cloud compromise.

---

## 5. Reporting

Reporting is one of the most underrated security skills.

A great hacker with terrible reporting is still a weak consultant.

Reports should explain:

* what was discovered,
* why it matters,
* how exploitation worked,
* business impact,
* and remediation.

---

# Why Note-Taking Is Extremely Important

Many beginners ignore note-taking.

That is a mistake.

Professional penetration testers document everything.

## Good notes should include

* IP addresses
* usernames
* discovered ports
* commands used
* screenshots
* credentials
* payloads
* findings
* timestamps

---

# Example of Bad vs Good Notes

## Bad notes

`Port 80 open`

That tells almost nothing.

---

## Good notes

* `10.10.10.5`
* Port `80/tcp` open
* Apache `2.4.49`
* Directory listing enabled
* `/backup/` exposed publicly
* Potential sensitive file exposure

Now the finding is useful.

---

# Useful Note-Taking Tools

Common tools include:

* CherryTree
* KeepNote
* OneNote
* Joplin

The tool itself matters less than organization.

---

# Screenshot Tools Matter Too

Screenshots are critical in penetration testing.

Good screenshots:

* provide evidence,
* support reports,
* and help explain technical findings.

Tools like Greenshot are useful because they allow:

* highlighting,
* obfuscation,
* annotations,
* and clean exports.

---

# Networking Foundations Every Hacker Needs

Networking is one of the most important skills in offensive security.

A hacker who does not understand networking will struggle during:

* scanning,
* exploitation,
* pivoting,
* and troubleshooting.

---

# Understanding IP Addresses

An IP address identifies a device on a network.

## IPv4

Most common format:

`192.168.1.10`

IPv4 uses:

* 32 bits,
* divided into four octets.

Each octet ranges from:

* `0` to `255`

---

## IPv6

IPv6 is much larger and uses hexadecimal notation.

Example:

`2001:0db8:85a3::8a2e:0370:7334`

IPv6 exists because IPv4 address space became limited.

---

# Private vs Public IP Addresses

## Private IP ranges

Common private ranges:

* `192.168.x.x`
* `10.x.x.x`
* `172.16.x.x - 172.31.x.x`

These are used internally.

---

## Public IP addresses

Public IPs communicate on the internet.

Your router usually shares one public IP across many private devices using NAT.

---

# NAT Explained Simply

NAT means:

**Network Address Translation**

It allows multiple private devices to communicate externally through one public IP.

## Practical Example

Your:

* phone,
* laptop,
* smart TV,
* and tablet

may all use private addresses internally.

But externally, websites only see your router's public IP.

---

# MAC Addresses

A MAC address is a hardware-level network identifier.

Example:

`00:0C:29:AB:CD:EF`

MAC addresses operate at Layer 2.

---

# Why MAC Addresses Matter in Security

Attackers sometimes analyze MAC prefixes to identify vendors.

## Example

A MAC prefix may reveal:

* VMware,
* Cisco,
* Dell,
* Apple.

This helps identify target infrastructure.

---

# TCP vs UDP

These are transport layer protocols.

Understanding them is extremely important.

---

# TCP

TCP is:

* connection-oriented,
* reliable,
* and verifies communication.

Used by:

* HTTP/HTTPS,
* SSH,
* FTP.

---

# TCP Three-Way Handshake

TCP communication usually follows:

1. SYN
2. SYN-ACK
3. ACK

## Simple analogy

Person A:
"Hello"

Person B:
"Hello, I heard you"

Person A:
"Great, connection established"

---

# UDP

UDP is:

* faster,
* lightweight,
* connectionless.

Used by:

* DNS,
* streaming,
* VoIP,
* gaming traffic.

UDP does not verify every packet like TCP does.

---

# Why Attackers Care About TCP and UDP

Scanning techniques differ.

TCP scans are usually easier.
UDP scans can be slower and less reliable.

Understanding protocol behavior helps identify:

* firewalls,
* filtering,
* exposed services,
* and attack opportunities.

---

# Common Ports Every Beginner Should Memorize

| Port | Protocol | Usage                  |
| ---- | -------- | ---------------------- |
| 21   | FTP      | File transfer          |
| 22   | SSH      | Secure remote access   |
| 23   | Telnet   | Insecure remote access |
| 25   | SMTP     | Mail transfer          |
| 53   | DNS      | Name resolution        |
| 80   | HTTP     | Web traffic            |
| 443  | HTTPS    | Secure web traffic     |
| 139  | SMB      | File sharing           |
| 445  | SMB      | Windows sharing        |

---

# Why SMB Is Important

SMB appears constantly in penetration testing.

Historically, SMB has been involved in:

* worms,
* lateral movement,
* credential attacks,
* ransomware spread.

## Example

The WannaCry outbreak abused SMB vulnerabilities to spread rapidly across networks.

This is why SMB exposure matters so much.

---

# DNS Explained Simply

DNS converts names into IP addresses.

Humans remember:

* `google.com`

Computers use:

* IP addresses.

DNS acts like the internet's phonebook.

---

# The OSI Model

The OSI model explains networking in layers.

## Mnemonic

**Please Do Not Throw Sausage Pizza Away**

| Layer | Name         |
| ----- | ------------ |
| 1     | Physical     |
| 2     | Data Link    |
| 3     | Network      |
| 4     | Transport    |
| 5     | Session      |
| 6     | Presentation |
| 7     | Application  |

---

# Important Security Mapping

| Layer   | Security Relevance          |
| ------- | --------------------------- |
| Layer 2 | MAC attacks, VLAN issues    |
| Layer 3 | Routing, IP filtering       |
| Layer 4 | TCP/UDP scanning            |
| Layer 7 | Web attacks, authentication |

---

# Subnetting Explained Simply

Subnetting divides networks into smaller sections.

This helps organizations:

* organize devices,
* control traffic,
* improve management,
* and separate environments.

---

# CIDR Notation

Examples:

* `/24`
* `/16`
* `/8`

These indicate subnet size.

---

# Easy Way to Remember

* Bigger number after slash = smaller network
* Smaller number after slash = bigger network

## Example

### `/24`

Common in homes/small offices.

Usually around:

* 254 usable hosts.

---

### `/16`

Much larger.

Can support thousands of devices.

Often seen in enterprises.

---

# Why Subnetting Matters for Attackers

Subnet size affects:

* scan scope,
* enumeration speed,
* network segmentation,
* attack planning.

## Example

Scanning a `/24` network is much faster than scanning a `/16` network.

A `/16` may contain thousands of hosts.

---

# Beginner Enumeration Workflow

A strong beginner workflow looks like this:

1. Discover hosts
2. Scan ports
3. Identify services
4. Identify versions
5. Research attack surface
6. Document findings
7. Attempt exploitation carefully

---

# Practical Enumeration Example

Suppose a scan reveals:

* `22/tcp` SSH
* `80/tcp` HTTP
* `445/tcp` SMB

An attacker's thinking may become:

## SSH

* weak credentials?
* old version?
* password reuse?

## HTTP

* hidden directories?
* outdated CMS?
* file upload?
* injection vulnerabilities?

## SMB

* anonymous shares?
* SMB signing?
* relay opportunities?
* old vulnerabilities?

Enumeration creates direction.

---

# Soft Skills Matter Too

Technical skills alone are not enough.

Strong penetration testers also need:

* communication skills,
* patience,
* curiosity,
* persistence,
* and reporting ability.

---

# The Most Important Mindset: Never Stop Learning

Cybersecurity changes constantly.

New:

* vulnerabilities,
* bypasses,
* defenses,
* frameworks,
* and attack chains

appear all the time.

A hacker who stops learning eventually becomes outdated.

---

# Final Thoughts

Ethical hacking is not magic.

It is the combination of:

* networking knowledge,
* methodology,
* patience,
* attacker thinking,
* and consistent practice.

Before learning advanced exploitation, beginners should become comfortable with:

* networking,
* IP addresses,
* TCP/UDP,
* ports,
* the OSI model,
* subnetting,
* enumeration,
* and documentation.

These fundamentals are what everything else builds upon.

A strong foundation creates stronger hackers.

---

