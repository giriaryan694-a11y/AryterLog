# PS_WebShell: A CloudShell-Style PowerShell Web Interface

**Author:** Aryan Giri

**Repository:** [https://github.com/giriaryan694-a11y/PS_WebShell](https://github.com/giriaryan694-a11y/PS_WebShell)

---

## Overview

PS_WebShell is a browser-based PowerShell interface with a CloudShell-inspired design. It is intended for controlled environments such as CTFs, learning labs, and authorized security testing.

The project focuses on usability, session management, and access control while presenting a clean terminal-style experience in the browser.

---

## Key Features

* CloudShell-style terminal interface
* Command history support with arrow-key navigation
* Session-based authentication
* Directory persistence across commands
* IP whitelisting support
* Real-time logging in the PowerShell console
* Responsive layout for mobile and desktop use
* Centralized configuration at the top of the script

---

## Security Considerations

PS_WebShell is a powerful tool and should be used only in controlled, authorized environments.

Recommended safeguards include:

* Access through a private VPN such as Tailscale
* Placement behind an HTTPS reverse proxy
* Firewall-based restrictions
* Strong credentials
* IP allowlisting

For HTTPS reverse proxy deployment, the project references: [https://github.com/giriaryan694-a11y/http2https](https://github.com/giriaryan694-a11y/http2https)

---

## Usage

1. Save the script as `PS_WebShell.ps1`
2. Run it in PowerShell
3. Open the local web interface in your browser
4. Authenticate with the configured credentials

---

## Shutdown

To stop the server, press `Ctrl + C` in the PowerShell window. If that does not respond, closing the terminal window will terminate the process.

---

## Configuration

The script includes a configuration section where you can set:

* Username
* Password
* Allowed IP addresses
* Port number

Update these values before deployment.

---

## Ethical Use

This project is intended for educational and authorized security work only. Use only on systems you own or where you have explicit permission.

---

## Author

**Aryan Giri**
