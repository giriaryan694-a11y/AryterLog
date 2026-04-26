**Written by Aryan Giri**

---

## 🔥 Overview

When people think about getting code execution on a server, they usually think about **file upload vulnerabilities** (uploading a webshell, etc.).

But there’s a quieter and often more dangerous path:

👉 **Command Injection via existing functionality**

No file upload. No shell file. Just abusing what’s already there.

---

## ⚠️ The Core Vulnerability

This attack happens when user input is passed directly into system-level functions like:

```php
system()
exec()
shell_exec()
passthru()
```

### Vulnerable Code Example

```php
<?php
$name = $_GET['name'];
system("ping " . $name);
?>
```

Here, the developer expects something like:

```
?name=google.com
```

But instead, we inject:

```
';system("ipconfig");//
```

---

## 💣 The Payload

```
';system("ipconfig");//
```

### Example Exploit URL

```
http://AttackTest.com?file=';system("ipconfig");//
```

👉 If the backend uses the `file` parameter inside a shell call, this will execute `ipconfig` and return the output directly in the web response.

### Breakdown

| Component            | Purpose                      |
| -------------------- | ---------------------------- |
| `'`                  | Breaks out of string context |
| `;`                  | Ends the current command     |
| `system("ipconfig")` | Executes OS command          |
| `//`                 | Comments out remaining code  |



---

## 🧠 How the Exploit Works

Let’s say the backend builds this command:

```php
system("ping " . $_GET['name']);
```

Injected version becomes:

```php
system("ping ' ; system("ipconfig"); //");
```

Now the shell interprets it as:

1. Run `ping`
2. Then run `ipconfig`

Boom — command execution achieved.

---

## 🎯 Why This Is Powerful

* No file upload needed
* Works on minimal input fields (search, ping tools, diagnostics panels)
* Often overlooked in legacy PHP apps
* Can lead to full system compromise

---

## 🧪 Real Demo (Intentionally Vulnerable Site)

You can safely test this technique on the following intentionally vulnerable lab:

```
http://php.testinvicti.com/hello.php?name=%27;system(%22dir%22);//
```

### Also works without URL encoding

```
http://php.testinvicti.com/hello.php?name=';system("dir");//
```

👉 Same payload, just not URL-encoded. Depending on the server and filters, this may work directly in the browser.

### What’s happening here?

* `%27` → `'` (breaks out of string)
* `;` → command separator
* `system("dir")` → executes a Windows command
* `//` → comments rest of the line

### About the `dir` command

* `dir` lists files and directories in the current folder (Windows equivalent of `ls` in Linux)
* When executed, its output is reflected directly in the web response

👉 So instead of just seeing “Hello user”, you’ll see **server directory contents** in the page.

---

### ⚠️ Responsible Testing Note

* This site is **intentionally vulnerable for learning**
* It resets automatically (typically after midnight)
* Do NOT attempt:

  * Destructive commands
  * Service disruption (DoS)
  * Anything beyond demonstration of the vulnerability

---

### 🚫 About DoS (Reality Check)

You’ll see a lot of forums hyping DoS as “high bounty”.

Reality:

* Most DoS attempts are just **traffic flooding**, not real vulnerabilities
* Big companies already test their infra against DoS internally
* Random flooding ≠ valid security bug in most programs

👉 Instead of wasting time on DoS, focus on:

* Information Disclosure
* Command Injection / RCE
* Authentication Bypass
* Access Control Issues

These are the bugs that actually **pay and matter**.

---

## 🌍 Real-World Scenarios

You’ll commonly find this in:

* Network diagnostic tools (ping, traceroute)
* Admin panels
* Debug endpoints left in production
* IoT device interfaces

---

## 🛡️ Mitigation

### ❌ Don’t do this

```php
system("ping " . $_GET['name']);
```

### ✅ Do this instead

* Use `escapeshellarg()`:

```php
system("ping " . escapeshellarg($_GET['name']));
```

* Validate input strictly (allow only domains/IPs)
* Avoid shell calls entirely if possible
* Run services with least privilege

---

## 🔍 Detection Tips

Look for:

* User input inside system commands
* Special characters (`;`, `&&`, `|`, backticks)
* Unexpected command output in responses

---

## ⚡ Advanced Notes

If output is not visible:

* Use blind techniques (time delays)
* Use out-of-band channels (DNS, HTTP callbacks)

---

## 🧨 When & Why This Vulnerability Happens

### When it appears

* User input is directly passed into system-level functions
* Developers build shell commands dynamically using concatenation
* Features like ping, traceroute, file handling, or diagnostics are exposed to users
* Legacy PHP apps or quick prototypes go into production without proper sanitization

### Why it happens

* **Trust boundary violation** → User input is treated as safe
* **String concatenation** → Input becomes part of a shell command
* **Shell metacharacters** (`;`, `&&`, `|`, backticks) get interpreted as control operators
* Lack of input validation or output encoding

👉 The backend cannot distinguish between intended command and injected command

---

## 🛡️ Mitigation (Deep Dive)

### 1. Avoid Shell Calls Completely

Instead of:

```php
system("ping " . $_GET['name']);
```

Use native functions or APIs wherever possible.

---

### 2. Escape User Input Properly

```php
system("ping " . escapeshellarg($_GET['name']));
```

This ensures input is treated as a single argument, not executable code.

---

### 3. Strict Input Validation (Allowlist)

Allow only:

* Valid IP addresses
* Valid domain names

Reject everything else.

---

### 4. Drop Privileges

* Run web server as low-privileged user
* Restrict system command capabilities

Even if exploited → limited impact

---

### 5. Disable Dangerous Functions (if possible)

In `php.ini`:

```
disable_functions = system, exec, shell_exec, passthru
```

---

### 6. Use Sandboxing / Containers

* Isolate execution environment
* Prevent lateral movement

---

### 7. Logging & Monitoring

* Detect unusual command patterns
* Alert on metacharacters in inputs

---

## 🧩 Key Takeaway

If user input reaches a shell → **assume command injection is possible**.

This technique proves you don’t need file upload to get RCE — sometimes the system hands it to you.

---
