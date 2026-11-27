Written By Aryan Giri

# RootMe

**TryHackMe Room:** RootMe  
**Difficulty:** Damn Easy  
**Estimated Time:** 45 minutes  
**Room URL:** https://tryhackme.com/room/rrootme

RootMe is a beginner-friendly CTF room focused on web enumeration, file upload exploitation, gaining initial access, and Linux privilege escalation.

## Reconnaissance

First, we will start with a basic Nmap scan to identify the open ports and running services.

```bash
nmap -sC -sV 10.49.168.50
```

<img width="785" height="566" alt="Screenshot 2026-11-27 153921" src="https://github.com/user-attachments/assets/f2cd72df-cae7-4472-a4ed-589dc9f83d33" />


We can see that SSH and HTTP ports are open. Let's explore the web server first.

Visiting the main webpage, we can see a simple page asking, *"Can you root me?"*

Unfortunately, I don't have a screenshot of the main page.

## Directory Enumeration

Next, let's use Gobuster to enumerate directories and files on the web server.

```bash
gobuster dir -u http://10.49.168.50/ -w /usr/share/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt
```

<img width="1342" height="630" alt="Screenshot 2026-11-27 154827" src="https://github.com/user-attachments/assets/c2314881-e967-40ed-bc92-794648cfbaed" />



The scan reveals several interesting directories, including:

- `/uploads`
- `/panel`
- `/js`
- `/css`

Let's investigate the `/panel` directory.

## Initial Access

<img width="691" height="429" alt="Screenshot 2026-11-27 155041" src="https://github.com/user-attachments/assets/82b947a3-ac45-480f-a7ca-b1fccf8f20c6" />


The panel allows us to upload files, which can potentially be accessed through the `/uploads` directory.

For this lab, we can use a PHP webshell to obtain command execution through the web server. After preparing the file for our lab and configuring the connection details, we start a listener on our chosen port.

For my setup, I used port `4444`.

<img width="469" height="289" alt="image" src="https://github.com/user-attachments/assets/29bd1ff1-7824-4ea8-a828-300522442c83" />
<img width="522" height="87" alt="image" src="https://github.com/user-attachments/assets/3a1eed5b-c354-4db8-a530-44af45506a78" />


Let's try uploading the file.

<img width="615" height="454" alt="Screenshot 2026-11-27 160203" src="https://github.com/user-attachments/assets/2d905578-d490-478b-a370-42af3dff2397" />

The upload gets rejected. Let's try changing the file extension to `.phtml`.

<img width="1033" height="547" alt="Screenshot 2026-11-27 160240" src="https://github.com/user-attachments/assets/61fdfc51-b51b-40df-bcd6-3708a5410c07" />


This time, the upload succeeds.

Now navigate to the `/uploads` directory and open the uploaded file.

http://10.49.168.50/uploads/

<img width="1411" height="293" alt="Screenshot 2026-11-27 160443" src="https://github.com/user-attachments/assets/5e2ed151-e889-4b58-a0f9-0a1a3f7f54ac" />

We now have a shell on the target machine.

## Privilege Escalation

Instead of searching for the user flag first, let's investigate possible privilege escalation paths.

We can look for files with the SUID permission set:

```bash
find / -perm -4000 -type f 2>/dev/null
```

<img width="334" height="308" alt="image" src="https://github.com/user-attachments/assets/23183559-96ba-4202-89ef-38924013f5c1" />


Among the results, we find `python2.7`.

Since Python can interact with operating-system functionality through its `os` module, this finding provides a potential privilege escalation path in this lab.

Using the available SUID Python binary, we obtain a root shell.

<img width="630" height="26" alt="image" src="https://github.com/user-attachments/assets/37a37393-5d14-48a0-9ac5-b9f466cf0c3d" />


Let's verify our current user:

```bash
whoami
```

The output confirms that we are now **root**.

<img width="123" height="46" alt="image" src="https://github.com/user-attachments/assets/3bd810e2-413f-4996-b7fc-918a710e1454" />


## Flags

Now that we have root access, let's locate the flags.

First, search for the user flag:

```bash
find / -name user.txt 2>/dev/null
```

We find the user flag at:

```text
/var/www/user.txt
```

Next, the root flag is located at:

```text
/root/root.txt
```

We can read both flags now that we have sufficient privileges.

<img width="272" height="96" alt="image" src="https://github.com/user-attachments/assets/602cccef-dd69-463b-bc14-32f7e82a69c4" />


## Conclusion

RootMe was a straightforward beginner CTF covering basic Nmap reconnaissance, directory enumeration with Gobuster, file upload restrictions, initial access through an uploaded file, SUID enumeration, and Linux privilege escalation.

The room is a good introduction to understanding how small misconfigurations in a web application and its underlying Linux system can lead to complete compromise.
