# 🔍 Witr: “Why is this running?” — Explained Like a Real Scenario

**Written by Aryan**

---

## 🧠 The Real Problem 

You’re in your lab… or maybe debugging your own project…

You run:

```bash
ps aux | grep node
```

You see:

```bash
node server.js
```

Cool.

But then…

👉 Your CPU is high
👉 Port 5000 is open
👉 Something feels *off*

Now the real question hits:

> **“Bro… WHY is this even running?”**

Not *what*.
Not *where*.
👉 **WHY.**

---

## ⚡ Enter Witr (Game-Changer Moment)

Instead of guessing like a caveman 🪨

Run:

```bash
witr node
```

And suddenly…

```bash
systemd → pm2 → node → server.js
```

💡 Instant clarity:

* systemd started pm2
* pm2 started node
* node is running your app

No more guessing. No more switching tools.

---

## 🔥 Make It Real: A Scenario You’ll Actually Face

### 🧪 Situation:

You’re building:

* a phishing lab
* or a backend server
* or testing some payload

Suddenly:

👉 Port `5000` is open
👉 You don’t remember starting anything

---

### Without Witr:

```bash
netstat -tulnp
ps aux
lsof -i :5000
```

🧠 Brain:

> “Maybe docker? maybe pm2? maybe I forgot?”

---

### With Witr:

```bash
witr --port 5000
```

Output:

```bash
systemd → pm2 → node → app.js
```

💥 Done in 2 seconds.

---

## 🧬 Why This Hits Different (Core Concept)

Most tools show:

* state
* numbers
* raw data

Witr shows:

> **CAUSALITY (cause → effect)**

---

### 🧠 Think like this:

Every process is a **chain reaction**:

```bash
cron → bash → python → payload.py
```

OR

```bash
ssh → bash → script.sh → reverse_shell
```

👉 Witr reconstructs this chain.

That’s **incident response level visibility**.

---

## ⚔️ Cybersecurity Angle (Your Level)

### 🔍 Detect Persistence (Attacker Mindset)

If you see:

```bash
cron → bash → python → backdoor.py
```

🚨 That’s not normal.

You just found:

* persistence mechanism
* execution path
* payload location

---

### 🔥 Post Exploitation Awareness

After getting access to a system:

Instead of blindly exploring:

```bash
ps aux
```

Use:

```bash
witr
```

👉 Launch TUI mode

Now you get:

* live process dashboard
* ports → processes mapping
* full ancestry tree

---

## 🖥️ Interactive Mode (This is 🔥)

![Image](https://images.openai.com/static-rsc-4/0L3dZv28igMGSn1iaDjdJ9lkTu21y6LVM4sQxpti4k5bXrkTf5b9eJlKONYSMSTcAMMkVZwKupcl6MxxPIvHpywjQuw10rQTU8SHq1S-C30jIpjfUL7FDD_BvTMLO-04vqGf09h1XqNOjnb24OMXrNAPSFJP6iW0TVePgp9ehjQ0FdJAsueP6BwLkurksb2U?purpose=fullsize)

Run:

```bash
witr -i
```

You get:

* real-time process explorer
* clickable (mouse supported)
* inspect → kill → analyze

👉 It’s like `htop` but with **brain**

---

## ⚙️ Install (Keep It Simple)

### Linux / macOS:

```bash
curl -fsSL https://raw.githubusercontent.com/pranshuparmar/witr/main/install.sh | bash
```

### Windows:

```powershell
irm https://raw.githubusercontent.com/pranshuparmar/witr/main/install.ps1 | iex
```

---

## 🧪 Quick Commands (Daily Use)

```bash
witr nginx          # check service
witr --port 5000    # who owns port
witr --pid 1337     # inspect specific process
witr -i             # interactive mode
```

---



## ⚖️ Ethics (Real Talk)

Same tool.

Different mindset.

* 🟢 Defender:

  * find malware
  * debug infra
  * audit systems

* 🔴 Attacker:

  * map environment
  * understand persistence
  * identify weak points

👉 Skill is neutral. Intent defines direction.

---

