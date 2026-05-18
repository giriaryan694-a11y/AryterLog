**Written by Aryan Giri**

## Overview

Active Directory (AD) is the central system many Windows networks use to manage users, computers, permissions, and policies. Think of it like the control room of a company network. Instead of setting passwords, accounts, and access rules on every single computer one by one, AD lets an admin manage everything from one place.

That convenience is also why AD is so important in security. If an attacker gets a foothold inside an AD environment, they often have many paths to move deeper, find more users, and eventually reach high-value accounts.

## Why Active Directory matters

AD is everywhere in internal networks. It stores things like:

* user accounts
* computer objects
* groups and permissions
* group policy settings
* file shares
* domain trust relationships

For defenders, AD is the backbone of daily administration. For attackers, it is often the main road to privilege escalation and lateral movement.

If AD is weak, the whole domain can become weak.

## The main idea in simple words

A normal Windows network without AD would be painful to manage. Every user password change, policy update, software push, or account reset would need to be done on each machine manually.

With AD, one change can spread across the domain.

That is why AD is powerful.
And that is why AD is a favorite target.

## The key protocols you see around AD

### LDAP

LDAP is used to query and modify directory data.

In practice, it helps with searching for users, computers, groups, and other objects. If an attacker can query LDAP, they may learn a lot about the domain structure.

**Example:**
A pentester finds LDAP access and pulls a list of users, groups, and descriptions. Sometimes descriptions accidentally contain useful hints like temporary passwords or account roles.

### Kerberos

Kerberos is the default authentication system for modern Windows domains.

Instead of sending credentials every time, it uses tickets. Once a user proves who they are, they receive a ticket that can be used to access services.

**Example:**
A service account has a weak or reused password. An attacker requests a ticket-related response and tries to crack the service account offline.

### DNS

DNS translates names into IP addresses.

AD depends on DNS heavily because domain controllers, clients, and services need to find each other.

**Example:**
If a client cannot resolve the domain controller name, it may fail to join the domain or find services.

### LLMNR / NBT-NS

These are fallback name-resolution protocols used when DNS fails.

Attackers love them because they can poison the response and trick systems into sending authentication attempts to the attacker machine.

**Example:**
A user tries to access a share that does not exist. The network asks, “Who knows this name?” The attacker answers first and captures a hash.

## Common AD attack themes

### 1. Enumeration

Enumeration means learning what is in the domain.

This can include:

* usernames
* hostnames
* groups
* shares
* trust relationships
* service accounts
* password hints in descriptions

Enumeration is often the first real step after landing on a network.

**Example:**
A tool that dumps LDAP data reveals users, computers, and group memberships. From that, the attacker learns who exists and how the domain is organized.

### 2. Credential capture

If the attacker can trick a machine into authenticating to them, they may capture a hash.

A hash is not the same as the plaintext password, but it can still be useful.

**Example:**
Responder-style poisoning can make a victim send an NTLM hash to the attacker instead of to the real server.

### 3. Password cracking

Sometimes the captured hash is weak enough to crack offline.

That means the attacker does not need to keep talking to the live network. They can test password guesses locally until they recover the password.

**Example:**
A weak password like a common word plus a small variation may fall quickly, especially if it appears in a wordlist.

### 4. Kerberoasting

Kerberoasting targets service accounts that have SPNs attached to them.

The attacker requests service tickets and then tries to crack them offline.

**Example:**
A service account password is weak, so the ticket material can be cracked and the account can be abused for broader access.

### 5. Pass-the-Hash

Pass-the-Hash means using an NTLM hash directly instead of a plaintext password.

This works when the environment accepts NTLM-based authentication and the attacker already has a valid hash.

**Example:**
An attacker gets a local admin hash from one machine and uses it to access another system where the same credential is accepted.

### 6. Share abuse

File shares often leak useful data.

Sometimes shares contain:

* scripts
* config files
* backup files
* notes
* passwords

**Example:**
A share called `TryHackMe` or `Shared` contains a text file with a temporary password or a secret note left by an admin.

## A simple lab story

A good AD lab usually has:

* one domain controller
* one Windows workstation
* one attacker box
* a few users with different privilege levels

A common learning path looks like this:

1. Discover the domain.
2. Enumerate users and shares.
3. Capture or find a credential.
4. Reuse or crack that credential.
5. Check for Kerberos-related weakness.
6. Find misconfigured shares or local admin access.
7. Escalate until domain control is possible.

That is the basic flow many real-world internal tests follow too.

## Practical examples that help it make sense

### Example 1: Weak share permissions

A user account can read a file share it should not have access to. That share contains a text file with a service password.

**Lesson:** never store passwords in shared folders.

### Example 2: Service account with weak password

A service account has an SPN and a weak password. An attacker requests Kerberos ticket material and cracks it offline.

**Lesson:** service accounts need strong passwords and proper management.

### Example 3: NTLM hash capture

A workstation tries to resolve a fake network name. The attacker answers first and captures the authentication hash.

**Lesson:** disable or reduce risky name-resolution behavior where possible.

### Example 4: Local admin reuse

The same local administrator password is reused across multiple machines.

**Lesson:** one leaked local admin credential can open many doors.

## What to remember as a learner

AD is not just “Windows stuff.” It is the identity layer of many enterprise networks.

If you understand these ideas, you start thinking like this:

* How does the client find the domain controller?
* Which accounts have special privileges?
* Which services expose Kerberos tickets?
* Where are passwords reused?
* Which shares or configs leak secrets?
* Which machines trust the same admin credential?

That mindset is more important than memorizing one tool.

## Why attackers love AD

Attackers like AD because it can turn a small foothold into large access.

One weak password, one bad share, one exposed service account, or one reused hash can become the start of a much bigger chain.

That is why AD attacks are usually about chaining small mistakes.

## Final takeaway

Active Directory is the heart of many Windows environments.

If you learn how it works, you can understand:

* how users authenticate
* how permissions spread
* how attackers enumerate and move
* how small mistakes turn into domain compromise

For beginners, the best way to learn AD is with a safe lab and lots of repetition. Start with discovery, then credentials, then escalation, then misconfigurations.

That is the real path from “I see a Windows domain” to “I understand how the whole network fits together.”
