# ARY_Webshell 🐚

**Author:** Made By Aryan Giri

A high-performance, secure, and mobile-responsive browser-based remote terminal system.

ARY_Webshell is a production-ready C program that allows you to access your Linux terminal via any web browser. It features a dual-server architecture (HTTP + WebSockets), session-based authentication, and a specialized UI designed for both Desktop and Mobile (Termux-style) usage.

---

## ✨ Features

* **Dual-Server Engine**
  Integrated HTTP server (Port 5000) and WebSocket server (Port 7681) running in a single process.

* **Mobile-First UI**
  Includes a custom "Extra Keys" toolbar (CTRL, ESC, TAB, Arrow keys) optimized for mobile/Termux-style usage.

  * Sticky CTRL key support for mobile keyboards
  * Responsive Xterm.js terminal for all screen sizes

* **Security Focused**

  * IP Allowlist: Restrict access to specific IP addresses.
  * Session-Only Auth: Tokens stored in ephemeral session storage and wiped on disconnect.
  * Anti-Fragmentation: Stable TCP reading for slow/unstable networks.
  * Fragment-safe HTTP POST login handling

* **True PTY Integration**
  Uses `forkpty` to provide a real `/bin/bash` experience with ANSI color support and compatibility with interactive tools like `top`, `vim`, and `nano`.

* **Activity Logging**
  Every executed command is timestamped and logged to `commands.log`.

---

## 🛠 Dependencies

Before compiling, install required development libraries:

### Ubuntu / Debian / Kali / Parrot

```bash
sudo apt update
sudo apt install build-essential libwebsockets-dev libssl-dev
```

### Alternative (Some Distros like Kali / Minimal setups)

```bash
sudo apt install build-essential libwebsocket libssl
```

### Fedora

```bash
sudo dnf install libwebsockets-devel openssl-devel
```

### Termux (Android)

```bash
apt update
apt install build-essential libwebsocket libssl
```

> If `gcc` is missing, install it manually:

```bash
apt install gcc
```

---

## 🚀 Compilation & Usage

### 1. Configuration

Edit `webshell_linux.c` and modify the security configuration block:

```c
const char *CONFIG_USERNAME = "admin";
const char *CONFIG_PASSWORD = "yourpassword";

const int CONFIG_HTTP_PORT = 5000;
const int CONFIG_WS_PORT = 7681;

const char *ALLOWED_IPS[] = { "*", NULL }; // Use specific IPs for better security
```

---

### 2. Compile

```bash
gcc webshell_linux.c -o ary_webshell -lwebsockets -lutil -lpthread
```

---

### 3. Run

```bash
./ary_webshell
```

---

### 4. Access

Open your browser:

```
http://your-ip-address:5000
```

Login using your configured credentials to access the terminal interface.

---

## 🖥️ Usage Tips

### 📱 Android Keyboard Recommendation

For a better mobile terminal experience, it is highly recommended to use **Hacker's Keyboard**:

[https://f-droid.org/packages/org.pocketworkstation.pckeyboard/](https://f-droid.org/packages/org.pocketworkstation.pckeyboard/)

* Provides full PC-style keyboard (CTRL, ALT, ESC, arrows, function keys)

* Works seamlessly with the web terminal UI

* Greatly improves command-line efficiency on mobile devices

* **Mobile:** Use the top toolbar for special keys. Tap CTRL then a letter (like `C`) to send signals.

* **Desktop:** Use your keyboard normally.

* **Disconnect:** Close the tab or type `exit` — session is destroyed instantly.

---

## 🌐 Secure Remote Access (Recommended)

For safe remote access without exposing ports publicly, use **Tailscale (Zero-Trust VPN)**:

* Install Tailscale on your server and client devices
* Access your webshell securely using your private Tailscale IP
* Avoid direct port forwarding or exposing HTTP to the internet

This drastically reduces attack surface and aligns with modern zero-trust security models.

---

## 📂 File Structure

```
webshell_linux.c   # Core C source code
commands.log       # Auto-generated command logs (timestamps + PID)
README.md          # Documentation
```

---

## ⚠️ Security Warning

* This tool uses **HTTP (plaintext)** by default.
* For internet-facing deployments, use a reverse proxy like **Nginx** with SSL to enable **HTTPS/WSS**.
* The shell runs with the permissions of the user executing `./ary_webshell` — avoid running as root.
* Always restrict access using IP allowlists and strong credentials.

---

## ⚖️ Ethical & Legal Use

This tool is intended strictly for:

* Ethical penetration testing (with proper authorization)
* Cybersecurity learning and lab environments
* Personal infrastructure management

**Not Allowed:**

* Unauthorized system access
* Illegal activities or exploitation
* Military or harmful operations

Using this tool outside legal and ethical boundaries is strictly discouraged.

---

## 👤 Credits

* **Project Name:** ARY_Webshell
* **Developer:** Aryan Giri

---

## 🔗 Source Code

GitHub Repository:

[https://github.com/giriaryan694-a11y/Ary_WebShell/blob/main/webshell_linux.c](https://github.com/giriaryan694-a11y/Ary_WebShell/blob/main/webshell_linux.c)

---
