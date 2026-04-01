# 🧠 Complete Information-Gathering Techniques List

**Written by Aryan Giri**

Information-gathering is the first step in many security assessments. In defensive security, the goal is to understand how data can be exposed through people, systems, and the physical environment so organizations can reduce risk.

## 🗑️ Physical Recon

**Dumpster Diving** — Searching discarded materials for useful information.
*Example:* Finding printed meeting notes or old network diagrams in office trash.

**Tailgating / Piggybacking** — Entering a restricted area by following an authorized person.
*Example:* Walking in behind an employee when a door is unlocked.

**Shoulder Surfing** — Watching someone enter sensitive information.
*Example:* Seeing a password or PIN typed on a public screen.

**Physical Surveillance** — Observing a location or routine from outside.
*Example:* Noticing when employees arrive, leave, or use access controls.

**Badge Cloning / RFID Skimming** — Capturing badge data to understand access risks.
*Example:* Learning that a low-security badge can be copied if poorly protected.

**Lock Picking (recon phase)** — Examining weak physical locks during security testing.
*Example:* Identifying that a storage room uses an easy-to-defeat lock.

**Hidden Camera Observation** — Watching for exposed processes or weak physical controls.
*Example:* A camera angle revealing who enters a secure room.

**Document Harvesting (desks/printers)** — Finding sensitive papers left unattended.
*Example:* A printer tray containing internal reports.

**Hardware Implant Placement (USB drops, keyloggers)** — A physical compromise path used in red-team scenarios.
*Example:* A forgotten USB device testing employee awareness.

## 🎭 Social Engineering (Human Exploitation)

**Phishing** — Fake messages that try to make someone click, reply, or share data.
*Example:* A message pretending to be from a login portal.

**Spear Phishing** — A targeted phishing attempt aimed at one person or team.
*Example:* A fake invoice sent to the finance department.

**Whaling** — Phishing aimed at executives or high-value targets.
*Example:* A message pretending to be for the CEO’s urgent approval.

**Clone Phishing** — A real message copied and altered to appear safe.
*Example:* A legitimate email resent with a swapped attachment or link.

**Business Email Compromise (BEC)** — Email-based fraud that impersonates trusted business communication.
*Example:* A fake payment request from a “vendor” account.

**Pretexting** — Creating a believable story to obtain information.
*Example:* Calling as IT support to ask whether a system is in use.

**Impersonation** — Pretending to be someone trusted.
*Example:* Claiming to be a new employee from another department.

**Baiting** — Offering something tempting to trigger a risky action.
*Example:* A misleading download labeled as a useful document.

**Quid Pro Quo** — Offering help in exchange for information or access.
*Example:* “I can fix that issue if you tell me your account details.”

**Elicitation** — Extracting facts through casual conversation.
*Example:* Asking friendly questions that reveal internal tools or schedules.

**Reverse Social Engineering** — Creating a situation where the target asks the attacker for help.
*Example:* Causing confusion so someone reaches out for support.

**Honey Trap / Romance Scam** — Emotional manipulation used to gain trust or data.
*Example:* A fake online identity building a relationship to collect details.

**Scareware** — Fake warnings that pressure users into action.
*Example:* A pop-up claiming a device is infected and needs urgent attention.

**Watering Hole Attack** — Compromising a site that a target group often visits.
*Example:* A trusted community site being altered to lure specific visitors.

## 📞 Communication-Based Attacks

**Vishing (voice phishing)** — Phishing by phone call.
*Example:* A caller pretending to be bank support.

**Smishing (SMS phishing)** — Phishing by text message.
*Example:* A text asking you to verify a login.

**Email Spoofing** — Making an email look like it came from a trusted sender.
*Example:* A message that appears to come from an internal address.

**Caller ID Spoofing** — Faking the number shown on a phone call.
*Example:* A call that appears to come from a familiar office number.

**Deepfake Voice Attacks** — AI-generated voice used to imitate someone.
*Example:* A synthetic voice sounding like a manager during a fraud attempt.

**Fake Support Calls** — Pretending to be technical support to gain trust.
*Example:* Calling an employee about a fake account problem.

**MFA Fatigue Attacks** — Repeated approval prompts meant to wear a user down.
*Example:* A user receiving many login prompts until they accept one by mistake.

## 🌐 OSINT (Open Source Intelligence)

**Search Engine Recon (Google Dorking)** — Using search operators to find exposed data.
*Example:* Discovering public documents or misconfigured pages.

**WHOIS Lookup** — Checking domain registration details.
*Example:* Learning ownership or administrative contact patterns.

**DNS Enumeration** — Studying domain records and subdomains.
*Example:* Finding test systems or forgotten service names.

**Social Media Profiling** — Collecting public details from profiles and posts.
*Example:* Learning team structure from LinkedIn updates.

**Metadata Extraction (EXIF, docs)** — Reading hidden data inside files.
*Example:* A photo revealing device details or document author names.

**Public Records Mining** — Using public documents and filings for context.
*Example:* Finding company leadership or address history.

**Breach Data Analysis (leaked creds)** — Studying known leaks for exposure patterns.
*Example:* Seeing whether reused passwords appear in older incidents.

**GitHub / Code Leak Hunting** — Looking for secrets accidentally published in code.
*Example:* A repository containing API keys in plain text.

**Job Listings Intelligence** — Reading hiring posts to infer a tech stack.
*Example:* A vacancy listing tools, cloud platforms, or frameworks.

**Dark Web Monitoring** — Checking criminal marketplaces or forums for mentions of an organization.
*Example:* Noticing a company name in breach chatter.

**Username Enumeration** — Checking which usernames are valid across services.
*Example:* Finding that one account format is used consistently.

## 🖥️ Technical Recon (Pre-Exploitation)

**Footprinting** — Gathering basic details about an environment.
*Example:* Learning what systems, domains, or services exist.

**Scanning** — Checking what hosts or services respond.
*Example:* Identifying open ports on a test lab machine.

**Banner Grabbing** — Reading service identification data.
*Example:* Seeing a web server version in a response header.

**OS Fingerprinting** — Estimating the operating system behind a host.
*Example:* Distinguishing between Linux and Windows behavior.

**Subdomain Enumeration** — Finding subdomains connected to a target domain.
*Example:* Discovering dev, staging, or portal hosts.

**Directory Bruteforcing** — Looking for hidden paths on a website.
*Example:* Finding an admin panel or backup folder.

**Network Sniffing** — Observing network traffic for analysis.
*Example:* Spotting unencrypted service communication in a lab.

**Traffic Analysis** — Studying patterns in network flows.
*Example:* Noticing unusual repeated requests or connections.

**Service Enumeration** — Learning what a service exposes.
*Example:* Checking features, versions, and configurations.

**Vulnerability Scanning** — Identifying known weaknesses.
*Example:* Detecting outdated software in an authorized assessment.

## 🧠 Behavioral / Psychological Exploits

**Authority Exploitation** — Using titles or status to pressure a target.
*Example:* A message pretending to come from a manager.

**Urgency Manipulation** — Forcing quick action before thinking.
*Example:* “Act now or the account will be locked.”

**Fear Exploitation** — Triggering concern to lower defenses.
*Example:* A fake security warning about account compromise.

**Curiosity Trigger** — Enticing someone to open or click.
*Example:* A file named as an interesting report.

**Trust Building** — Slowly gaining confidence over time.
*Example:* Repeated friendly contact before making a request.

**Social Proof Abuse** — Making something seem safe because others appear to use it.
*Example:* A fake review or fake internal reference.

**Reciprocity Principle** — Offering something to encourage compliance.
*Example:* “I helped you, so please send that file.”

**Cognitive Overload** — Flooding someone with too much information.
*Example:* Too many prompts, forms, or warnings at once.

**Habit Exploitation** — Taking advantage of routine actions.
*Example:* Users clicking familiar-looking approvals without checking.

## 🏢 Insider & Organizational Weaknesses

**Insider Threat Exploitation** — Risk created by trusted users misusing access.
*Example:* Someone using legitimate access in an unsafe way.

**Privilege Abuse** — Overuse or misuse of elevated permissions.
*Example:* An admin account being used for normal browsing.

**Weak Password Practices** — Easy-to-guess or reused passwords.
*Example:* A password that appears in multiple systems.

**Shared Credentials** — One login used by many people.
*Example:* A team account that everyone knows.

**Misconfigured Access Control** — Permissions set too loosely.
*Example:* A shared folder visible to more users than intended.

**Overexposed Internal Docs** — Sensitive documents accessible too widely.
*Example:* Internal plans stored in a public or shared space.

**Shadow IT Discovery** — Unofficial tools or services adopted without approval.
*Example:* A team using an unsanctioned cloud file service.

## ⚔️ How Real Attack Chains Look

A real assessment often combines multiple techniques:

1. OSINT to learn public details.
2. Social media analysis to identify staff or tools.
3. Pretexting to build believable contact.
4. Phishing or vishing to test human defenses.
5. Physical recon to identify weak controls.
6. Document or trash analysis to confirm exposure.

The important lesson is that data rarely comes from one place only. It often comes from a mix of humans, systems, and the physical environment.

## 🧠 Mental Model

Think of information exposure in three layers:

* **Humans** — conversations, habits, trust, and mistakes.
* **Systems** — domains, services, code, and network behavior.
* **Environment** — offices, papers, devices, and access controls.

A strong defender learns how each layer leaks information and then closes those gaps.

## ✅ Defensive Takeaway

These techniques matter because they show where organizations are most exposed. The goal is not to copy harmful behavior, but to understand how to prevent it through awareness, access control, secure disposal, training, and monitoring.

**Written by Aryan Giri**
