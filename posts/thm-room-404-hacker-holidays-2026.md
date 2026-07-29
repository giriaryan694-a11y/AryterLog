Written By Aryan Giri

# Room 404 — TryHackMe Hacker Holidays 2026 Writeup

**Room:** Room 404  
**Event:** Hacker Holidays 2026 – The Byte Lotus Hotel  
**Category:** Web  
**Difficulty:** Very Easy  
**Platform:** TryHackMe  
**Room Link:** https://tryhackme.com/room/hh-room404-804573bf

---

## Room Description

> He booked the quiet room. It's not on the floor plan, not in the brochure, not on any door. But port **8080** is wide open, and the rooms it never lists are the ones worth finding.

The objective of this room is straightforward:

- Dump the exposed source code
- Recover the flag

This challenge introduces one of the most common real-world web security mistakes—**an exposed `.git` repository**.

---

# Initial Recon

After opening the target in our browser:

```
http://10.49.176.139:8080/
```

we are presented with the application's homepage.

<img width="1233" height="762" alt="Screenshot 2026-07-29 205832" src="https://github.com/user-attachments/assets/eb674fca-a37b-45d5-98f0-1d090fc125df" />

---

## Reading the Challenge Carefully

The room itself gives an important clue.

Under **🏖️ TODAY'S ITINERARY** it says:

> Dump the exposed source code.

This immediately hints that the website's source code is accidentally exposed rather than needing exploitation through SQL injection, authentication bypass, or other web attacks.

One of the first things worth checking in these situations is whether the website exposes its **Git repository**.

---

# Checking for an Exposed `.git` Directory

Appending `.git` to the website URL reveals that the directory exists.

```
http://10.49.176.139:8080/.git/
```

<img width="1287" height="806" alt="Screenshot 2026-07-29 204622" src="https://github.com/user-attachments/assets/f9417827-3d99-4cde-bf4a-095cfed40f06" />


Finding an accessible `.git` directory is a serious security issue because it may allow attackers to recover the application's entire source code and version history.

---

# What is the `.git` Directory?

The **`.git`** directory is Git's internal repository metadata and object database.

It stores:

- Commit history
- Source code objects (blobs)
- Trees
- References
- Branches
- Configuration
- Repository metadata

Even if directory listing is disabled, individual Git objects can often still be downloaded and reconstructed into the original repository.

This is why accidentally exposing `.git` can completely compromise the application's source code.

---

# Recovering the Repository

A well-known tool for recovering exposed Git repositories is **git-dumper**.

## Installation

Using **pipx (recommended)**

```bash
pipx install git-dumper
```

or using pip

```bash
pip install git-dumper
```

---

## Dumping the Repository

Run:

```bash
git-dumper http://10.49.176.139:8080/.git/ recovered_repo
```

The tool downloads Git objects and reconstructs the repository.


<img width="631" height="336" alt="Screenshot 2026-07-29 205444" src="https://github.com/user-attachments/assets/f181b7e4-01b0-4c3a-b8e7-bb304b3ffb35" />



---

# Exploring the Recovered Repository

After the dump completes, a new directory appears:

```text
recovered_repo
```

Navigate into it:

```bash
cd recovered_repo
```

Listing the contents shows the recovered project files.

```bash
ls
```

Inside we can see files such as the README and the application's source code.

---

# Finding the Flag

Opening the README reveals the room flag.

```bash
cat README.md
```

As per TryHackMe's rules, the flag has been redacted in this writeup.


<img width="650" height="423" alt="Screenshot 2026-07-29 205512" src="https://github.com/user-attachments/assets/2b761295-fe73-4bf1-81bd-c31d992e4293" />



Congratulations!

Room completed.

---

# Why This Matters in the Real World

An exposed `.git` repository is much more than just leaked source code.

Attackers can often recover:

- Hardcoded credentials
- API keys
- Database passwords
- Internal endpoints
- Hidden admin panels
- Old commits containing sensitive information
- Application architecture
- Secrets removed from newer versions but still present in Git history

Even if developers delete sensitive information later, Git history frequently retains previous commits unless the repository is properly cleaned.

Because of this, checking for an exposed `.git` directory is a standard reconnaissance technique during:

- Penetration Tests
- Bug Bounty engagements
- CTF challenges
- Red Team assessments

---

# Key Takeaways

- Always inspect web servers for accidentally exposed repositories.
- `.git` exposure can lead to complete source code disclosure.
- Tools like **git-dumper** make repository reconstruction straightforward.
- Git history often exposes secrets that no longer exist in the current application.
- Proper deployment should never expose version control directories to the public internet.
