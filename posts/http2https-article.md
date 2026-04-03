# Turning HTTP into HTTPS Locally with http2https

**Written by Aryan Giri**

`http2https` is a Python-based CLI tool that helps you access an HTTP-only local service through HTTPS.

It is useful when a browser, client, or tool expects a secure `https://` address, but your service still runs on plain HTTP.

**GitHub:** [https://github.com/giriaryan694-a11y/http2https](https://github.com/giriaryan694-a11y/http2https)

---

## The Problem

A lot of local tools still run on HTTP.

That is fine for development, but modern browsers and some apps increasingly expect HTTPS. This can create problems such as:

* browser warnings
* blocked features in secure contexts
* awkward local testing setups
* extra work when sharing a local service on your network

`http2https` solves this by sitting in front of the HTTP service and exposing it over HTTPS.

---

## How It Works

The idea is simple:

```text
HTTP server:   localhost:8000
HTTPS proxy:   localhost:8080
```

Instead of opening:

```text
http://IP:8000
```

you open:

```text
https://IP:8080
```

The proxy accepts the secure connection, decrypts it locally, forwards the request to the HTTP backend, and sends the response back to the client.

---

## Why This Is Useful

This tool is helpful for:

* local development servers
* AI tools that only expose HTTP
* cybersec dashboards and lab panels
* browser testing on HTTPS-only environments
* local services that need secure access without changing the backend

---

## Features

* automatic TLS certificate generation
* Subject Alternative Names support
* browser-friendly certificate flags
* custom certificate title
* reuse or regenerate existing certificates
* reverse proxy from HTTPS to HTTP
* simple CLI workflow
* designed for local use

---

## Installation

### Clone the repository

```bash
git clone https://github.com/giriaryan694-a11y/http2https
cd http2https
```

### Standard Python installation

```bash
pip install cryptography pyfiglet termcolor colorama requests
```

### Termux installation

If you are using Termux, install `cryptography` with the package manager instead of `pip` to avoid build errors.

```bash
pkg update && pkg upgrade
pkg install python python-cryptography
pip install pyfiglet termcolor colorama requests
```

---

## Usage

1. Start your local HTTP server.

Example:

```bash
python -m http.server 8000
```

2. Run the tool.

```bash
python main.py
```

3. Enter the requested details.

Typical values:

* **Certificate Title**: `MyDevCA`
* **Domains / IPs**: `localhost, 127.0.0.1, 10.192.37.173`
* **Internal Port**: `8000`
* **HTTPS Port**: `8080`

4. Open the HTTPS proxy in your browser.

Example:

```text
https://127.0.0.1:8080
```

---

## Trusting the Certificate

To avoid browser warnings, install the generated certificate as a trusted root certificate on your system.

### Windows

1. Open the generated certificate file.
2. Click **Install Certificate**.
3. Choose **Current User**.
4. Select **Place all certificates in the following store**.
5. Choose **Trusted Root Certification Authorities**.
6. Finish the wizard.
7. Restart your browser.

### Linux

Install the certificate into your system trust store using your distro’s certificate management method.

### Android

Import the certificate through your device security settings if your device supports user certificate installation.

---

## Notes

* This tool is intended for local or authorized development use.
* Keep the certificate and proxy endpoint private.
* If you change domains or IPs, regenerate the certificate.
* The proxy only bridges HTTPS to an HTTP backend; it does not turn the backend itself into an HTTPS server.

---

## Example Flow

```text
Browser / Client
        ↓ HTTPS
http2https proxy on 8080
        ↓ HTTP
Local service on 8000
```

---

## License

This project is licensed under the **Apache License 2.0**.
