# 🧹 Resetting and Cleaning a Tor Hidden Service (Complete Guide)

**Written by Aryan Giri**

---

## 🧠 Why Reset Tor?

When working with Tor hidden services in labs or projects, you may need to:

* Remove an old `.onion` address
* Fix broken configurations
* Start fresh with a clean setup
* Rotate identity for testing

👉 Important:

```
.onion address = cryptographic identity
```

Deleting it = generating a completely new identity.

---

# ⚙️ Step 1 — Stop Running Services

## Stop your local server

If you started a server (like Python HTTP):

```bash
Ctrl + C
```

---

## Stop Tor service

```bash
sudo systemctl stop tor@default
```

**Explanation:**

* Stops the active Tor instance
* Prevents further network activity

---

## Kill leftover processes (optional but recommended)

```bash
sudo pkill -f tor
```

**Explanation:**

* Ensures no Tor processes are still running in background
* Useful if something is stuck

---

# ⚙️ Step 2 — Remove Hidden Service Directory

```bash
sudo rm -rf /var/lib/tor/reverse_shell
```

**Explanation:**

This directory contains:

* `hostname` → your `.onion` address
* `private_key` → identity key

Deleting it will:

* ❌ Remove your current onion address
* ❌ Delete identity permanently
* ✅ Force Tor to generate a new one

---

# ⚙️ Step 3 — Start Tor Again (Fresh State)

```bash
sudo systemctl start tor@default
```

---

## Get New Onion Address

```bash
sudo cat /var/lib/tor/reverse_shell/hostname
```

**Explanation:**

* A brand new `.onion` address is created
* Old one is completely invalid

---

# ⚙️ Optional — Disable Tor on Boot

```bash
sudo systemctl disable tor@default
```

**Explanation:**

* Prevents Tor from starting automatically
* Good for lab environments

---

# ⚠️ Common Mistakes

## ❌ Forgetting to stop Tor before deleting

May cause:

* Permission issues
* Directory recreation errors

---

## ❌ Not matching service port

If config is:

```bash
HiddenServicePort 5555 127.0.0.1:5555
```

Then:

* Your service MUST run on port `5555`
* You MUST access: `onion:5555`

---

## ❌ VPN interference

If using Cloudflare Warp or similar:

```bash
warp-cli disconnect
```

Tor routing can break with VPN overlays.

---

# 🧠 What You Learned

You now understand how to:

* Stop Tor safely
* Remove hidden services
* Reset onion identity
* Start fresh clean environments

---

# ⚔️ Real-World Insight

Resetting a hidden service is similar to:

* Rotating infrastructure
* Burning exposed endpoints
* Rebuilding secure channels

This is a core skill in:

* Cybersecurity labs
* Privacy engineering
* Red team simulations

---

# 🚀 Final Thought

If you can create a hidden service…

You must also know how to destroy and rebuild it.

That’s real control.

