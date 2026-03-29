# 🧅 Building a Tor Hidden Service Lab (From Zero to Working Onion)
> **Written by Aryan Giri**
**A Practical, Controlled Lab for Understanding Anonymous Inbound Channels**

---

## 🧠 Before You Start (Common Confusion)

Many people use this setup to **share local projects (web apps, dashboards, APIs)** over Tor.

👉 Key rule:

> The port you expose in Tor MUST match the port your service is running on.

Example config:

```bash
HiddenServiceDir /var/lib/tor/reverse_shell/
HiddenServicePort 5555 127.0.0.1:5555
```

That means:

* Your app/server MUST run on `127.0.0.1:5555`
* You MUST access it as:

```bash
http://youronion.onion:5555
```

If ports don’t match → **connection will fail** ❌

---

## ⚙️ Installation (Minimal Setup)

```bash
sudo apt update
sudo apt install tor torsocks -y
```

Enable Tor instance:

```bash
sudo systemctl enable tor@default
```

---

## 🧠 Why This Lab Matters

This is not just about hosting a website on Tor.

You are learning how to build a:

```
Hidden Service = Stealth Inbound Communication Channel
```

---

# ⚙️ PHASE 0 — Kill Everything (Clean Slate)

```bash
sudo systemctl stop tor tor@default
sudo pkill -f tor
sudo rm -rf /var/lib/tor/reverse_shell
```

---

# ⚙️ PHASE 1 — Minimal Tor Config (No Noise)

```bash
sudo nano /etc/tor/torrc
```

Add ONLY this:

```bash
HiddenServiceDir /var/lib/tor/reverse_shell/
HiddenServicePort 5555 127.0.0.1:5555
```

---

# ⚙️ PHASE 2 — Fix Permissions (Critical)

```bash
sudo mkdir -p /var/lib/tor/reverse_shell
sudo chown -R debian-tor:debian-tor /var/lib/tor/reverse_shell
sudo chmod 700 /var/lib/tor/reverse_shell
```

---

# ⚙️ PHASE 3 — Start Tor

```bash
sudo systemctl start tor@default
```

---

## 🔍 Verify Tor Running

```bash
ps aux | grep tor
```

---

## 🔍 Check Bootstrapping

```bash
sudo journalctl -u tor@default -n 50
```

Look for:

```
Bootstrapped 100% (done)
```

---

# ⚙️ PHASE 4 — Get Onion URL

```bash
sudo cat /var/lib/tor/reverse_shell/hostname
```

---

# ⚙️ PHASE 5 — Run Your Service

Example (web server):

```bash
python3 -m http.server 5555
```

Check:

```bash
ss -tulnp | grep 5555
```

---

# ⚙️ PHASE 6 — Test Tor Network First

```bash
curl --socks5-hostname 127.0.0.1:9050 https://check.torproject.org
```

---

# ⚠️ Disable VPN Conflicts

```bash
warp-cli disconnect
```

---

# ⚙️ PHASE 7 — Access Your Service

```bash
curl --socks5-hostname 127.0.0.1:9050 http://YOUR_ONION:5555
```

Or in Tor Browser:

```
http://YOUR_ONION:5555
```

---

# 🧠 Expected Output

```html
Directory listing for /
```

---

# 🚨 Troubleshooting (Real-World Fixes)

## ❌ Issue: Site not opening

Check:

* Is your service running on correct port?
* Does port match Tor config?

---

## ❌ Issue: SOCKS connection failed

```bash
ss -tulnp | grep 9050
```

---

## ❌ Issue: Hidden service not created

```bash
sudo journalctl -u tor@default | grep HiddenService
```

---

## 🔁 Still Not Working?

Do a full reset:

```bash
sudo systemctl stop tor tor@default
sudo pkill -f tor
sudo rm -rf /var/lib/tor/reverse_shell
```

Then repeat setup cleanly.

---

# 🧠 Core Concept

```
Service (localhost:port)
        ↓
Tor Hidden Service
        ↓
.onion:port access
```

---

# ⚔️ Next Step

Replace HTTP server:

```bash
nc -lvnp 5555
```

Now you have a **Tor-routed TCP channel**.

---

# ⚖️ Ethics

Used for:

* Privacy tools
* Anonymous publishing
* Secure labs

Also abused in real-world attacks.

Learn responsibly.

---
