Written By Aryan Giri

# TryHackMe Support – Web Exploitation Writeup

## Initial Recon and Access

Target application exposed a support operations login portal. Traffic was routed through Burp Suite to observe backend behavior and intercept requests.

Upon visiting the URL, a login interface was discovered.

<img width="1598" height="679" alt="Screenshot 2026-07-05 091419" src="https://github.com/user-attachments/assets/0dc59bf3-a959-45d7-9439-18d53c9edf03" />

During basic enumeration, the page leaked a valid support email:

* `help@support.thm`

This immediately reduced the authentication surface to a single known identifier.

SQL injection authentication bypass attempts were tested but did not succeed, indicating proper input handling at the login layer.

## Authentication Brute Force

Since injection was not viable, password brute forcing was the next approach.

A valid request was captured in Burp Suite to understand parameter structure:

<img width="624" height="324" alt="Screenshot 2026-07-05 093524" src="https://github.com/user-attachments/assets/01b931da-c850-4905-a6ff-4ea0c499bc9f" />


This revealed a standard POST authentication flow:

* email parameter
* password parameter

Hydra was then used for password brute force:

```bash
hydra -l help@support.thm -P rockyou.txt 10.49.148.63 -s 80 http-post-form "/:email=^USER^&password=^PASS^:Invalid credentials"
```

After a short run, valid credentials were recovered and login access was obtained.

## Post Login Enumeration

After authentication, a dashboard was exposed with the following endpoint:

```
/dashboard.php?skin=default
```
<img width="419" height="55" alt="Screenshot 2026-07-05 093637" src="https://github.com/user-attachments/assets/b8f2657a-7e2a-4531-bffe-91045491ac34" />

This parameter became an immediate candidate for Local File Inclusion testing.

Before deeper testing, further inspection of client-side storage was performed.

## Cookie Analysis and Privilege Manipulation

A browser cookie named:

* `IsITUser`
<img width="1290" height="124" alt="Screenshot 2026-07-05 094011" src="https://github.com/user-attachments/assets/ef87c338-38fd-4f2f-b2a6-7d0c6044671c" />


was identified containing an MD5 hash.

This value was decoded using offline and online cracking methods (e.g., CrackStation).

<img width="1282" height="111" alt="Screenshot 2026-07-05 094706" src="https://github.com/user-attachments/assets/9dd591b0-948a-4303-ae9d-c34b316c68de" />


Result:

* Hash value resolved to `false`

This indicated a boolean-based privilege flag.

The cookie was manually modified:

* `false → true`

This can be achieved using:

* CyberChef
* Python MD5 encoding
* manual replacement depending on implementation

After refreshing the page, new functionality was unlocked.

## Internal API Discovery and IDOR

A hidden API documentation panel became accessible:

<img width="218" height="131" alt="Screenshot 2026-07-05 094923" src="https://github.com/user-attachments/assets/b2b22b12-806f-43f6-a054-7c0a97d4ddaa" />
<img width="523" height="554" alt="Screenshot 2026-07-05 094934" src="https://github.com/user-attachments/assets/eda4950f-2ecd-464a-bbf3-cdd3d85e26cd" />

The API exposed user data endpoints:

```
GET /user/{id}
```

This allowed direct object reference testing.

### IDOR Testing

* `/user/1` → revealed admin-level user data
* `/user/3` → revealed normal user data

From enumeration:

* Admin email discovered:

  * `specialadmin@support.thm`

Additionally, API responses hinted at privilege flags such as:

* `admin=true`

Attempts were made to escalate privileges via:

* PATCH requests modifying user role

However, server-side enforcement prevented privilege escalation through API manipulation.

## LFI via Skin Parameter

Attention returned to:

```
/dashboard.php?skin=default
```

Directory traversal payloads were tested:

```
../../etc/passwd
../config
```

The parameter was vulnerable to Local File Inclusion behavior.

A sensitive configuration file was successfully accessed via:

```
../config
```

This revealed credential material.

<img width="1308" height="266" alt="Screenshot 2026-07-05 101425" src="https://github.com/user-attachments/assets/711b77b1-6ec9-4125-bca4-e2a7ae82b99b" />


Recovered credential:

* `support110`

This was accepted for authentication (despite variations observed during testing).

## First Flag Retrieval

Using the recovered credentials, access to restricted content was achieved and the first flag was obtained.

<img width="1348" height="617" alt="Screenshot 2026-07-05 101852" src="https://github.com/user-attachments/assets/626c40a1-3461-4f26-a818-8249d847fea6" />

## Command Injection via Date Parameter

Inside the admin panel, a feature was discovered allowing date/time interaction.
<img width="188" height="113" alt="Screenshot 2026-07-05 101913" src="https://github.com/user-attachments/assets/491d464f-f574-4526-bc73-63185a36bb7e" />

Requests showed backend execution pattern:

<img width="468" height="121" alt="Screenshot 2026-07-05 101944" src="https://github.com/user-attachments/assets/e165639f-17ee-4a2b-b347-327308b1855d" />

```
sys=date
```

This parameter was forwarded directly to system-level execution.

Intercepting the request in Burp Suite confirmed command execution behavior.

Example payload:

```bash
date; ls
```
<img width="1103" height="331" alt="Screenshot 2026-07-05 102454" src="https://github.com/user-attachments/assets/5ed631f6-e692-4117-9f9f-846892b6764e" />
This confirmed command injection vulnerability.

## Remote Command Execution and Flag Extraction

With command injection confirmed, file retrieval was straightforward.

Target file:

```
/home/ubuntu/user.txt
```

Payload:

```bash
date; cat /home/ubuntu/user.txt
```

Response returned the final flag.

<img width="1030" height="295" alt="Screenshot 2026-07-05 112352" src="https://github.com/user-attachments/assets/e6f13875-80ec-4550-843d-18f2e7805727" />


## Conclusion

The compromise chain followed a classic layered exploitation path:

* Information leakage (email disclosure)
* Authentication brute force
* Weak client-side privilege flag (cookie manipulation)
* IDOR via internal API
* Local File Inclusion via unsanitized parameter
* Command injection leading to full system access

Each stage progressively escalated access until full command execution was achieved.

