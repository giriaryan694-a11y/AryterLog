# Interactsh: A Free OAST Alternative to Burp Collaborator

**Written by Aryan Giri**

Interactsh is an out-of-band application security testing (OAST) tool from ProjectDiscovery that helps you detect vulnerabilities that do not show up directly in the normal HTTP response. It is especially useful for finding blind SSRF, blind XXE, blind command injection, and other callback-based issues.

For many bug bounty hunters, pentesters, CTF players, and learners, the **Interactsh client** is enough to get started. It gives you a public callback domain without needing your own VPS, port forwarding, or public static IP.

## Why people use it

Burp Collaborator is a well-known OAST feature in Burp Suite Professional. Interactsh offers a practical free alternative for many common workflows. It lets you generate unique callback domains and observe DNS/HTTP interactions when a target server makes an outbound request.

That makes it useful in situations where the application does not reflect the issue in the response. Instead of waiting for visible proof, you confirm the target reached out to your OAST payload.

## How it works

The flow is simple:

1. You run the Interactsh client.
2. It gives you a unique payload domain.
3. You place that domain into a target input, such as a URL parameter, header, XML field, or file processing path.
4. If the server makes an outbound request, Interactsh logs the interaction.
5. You verify the callback and confirm the issue.

A typical result may include:

* DNS interaction
* HTTP interaction
* Source IP of the target or its resolver
* Time of the callback

This is the same idea behind Burp Collaborator, but available in a way that is easy to start with and free for many use cases.

## When the client is enough

For normal bug bounty, pentesting, CTFs, and learning, the **Interactsh client** is usually enough.

It already gives you:

* Public reachability
* DNS and HTTP callback monitoring
* No VPS requirement
* No port forwarding
* No public static IP needed

So if your goal is to learn OAST testing or verify blind issues during authorized testing, the client alone is a strong starting point.

## Example use cases

### Blind SSRF

You inject your Interactsh domain into a URL-fetch feature:

```text
http://d7is7u5a9dbh4lfkprb0n16wwbmnobqnn.oast.fun
```

If the target server resolves and requests it, you will see DNS and possibly HTTP interactions in the client.

### Blind XXE

An XML parser may resolve an external entity and call back to your Interactsh domain. If you see a DNS interaction, you know the parser reached out.

### Command execution detection

Some command injection payloads can be tested by forcing the target to make an outbound request to your unique domain. If the callback appears, that is strong evidence of execution.

## What the output means

A sample client session may show:

```text
[INF] Current interactsh version 1.3.1 (latest)
[INF] Listing 1 payload for OOB Testing
[INF] d7is7u5a9dbh4lfkprb0n16wwbmnobqnn.oast.fun
[d7is7u5a9dbh4lfkprb0n16wwbmnobqnn] Received DNS interaction (A)
[d7is7u5a9dbh4lfkprb0n16wwbmnobqnn] Received DNS interaction (AAAA)
[d7is7u5a9dbh4lfkprb0n16wwbmnobqnn] Received HTTP interaction
```

This tells you:

* The domain was resolved successfully.
* The target made an outbound request.
* The callback reached the public Interactsh infrastructure.

## Client vs server

### Interactsh client

The client is what most people use day to day. It connects to ProjectDiscovery’s public infrastructure and gives you a callback domain immediately.

Use the client when you want:

* Fast setup
* Free OAST testing
* Learning and practice
* Bug bounty hunting
* CTF work

### Interactsh server

The server is the self-hosted backend. It is useful if you need full control over your own infrastructure, custom domains, or privacy-sensitive workflows.

Use the server when you need:

* Private infrastructure
* Organization-controlled logging
* Long-term persistence
* A custom domain
* A setup that does not depend on public OAST infrastructure

## Privacy and private engagements

If you are working in a private company, regulated environment, or a situation where you do not want a third-party service involved, self-hosting Interactsh can make sense.

That usually means you will need:

* A VPS or public server
* A domain name
* DNS configuration
* The Interactsh server binary

In that mode, the client points to your own server instead of the public service.

## Installation on Linux

Below are simple install examples for common Linux architectures.

### x86_64 / amd64

```bash
wget https://github.com/projectdiscovery/interactsh/releases/download/v1.3.1/interactsh-client_1.3.1_linux_amd64.zip
unzip interactsh-client_1.3.1_linux_amd64.zip
chmod +x interactsh-client
./interactsh-client
```

For the server:

```bash
wget https://github.com/projectdiscovery/interactsh/releases/download/v1.3.1/interactsh-server_1.3.1_linux_amd64.zip
unzip interactsh-server_1.3.1_linux_amd64.zip
chmod +x interactsh-server
./interactsh-server -h
```

### ARM64 / aarch64

```bash
wget https://github.com/projectdiscovery/interactsh/releases/download/v1.3.1/interactsh-client_1.3.1_linux_arm64.zip
unzip interactsh-client_1.3.1_linux_arm64.zip
chmod +x interactsh-client
./interactsh-client
```

For the server:

```bash
wget https://github.com/projectdiscovery/interactsh/releases/download/v1.3.1/interactsh-server_1.3.1_linux_arm64.zip
unzip interactsh-server_1.3.1_linux_arm64.zip
chmod +x interactsh-server
./interactsh-server -h
```

### 32-bit / i386

If you are on an older 32-bit Linux system and a matching release is available, use the i386 build from the release page, then unzip and run it the same way:

```bash
unzip interactsh-client_*.zip
chmod +x interactsh-client
./interactsh-client
```

## How to use the client

Start the client:

```bash
./interactsh-client
```

It will print a unique domain such as:

```text
d7is7u5a9dbh4lfkprb0n16wwbmnobqnn.oast.fun
```

Then place that domain into the target input you are testing. If the target calls out, the client will display the interaction.

## How to use the server

The server is for self-hosting. In practice, it is used when you already have your own DNS and public server setup.

A typical self-hosted workflow looks like this:

1. Set up a domain you control.
2. Point DNS to your server.
3. Run the Interactsh server.
4. Configure the client to use your server.
5. Collect and review callbacks privately.

The exact flags can vary by version, so it is best to check the built-in help first:

```bash
./interactsh-server -h
```

## Good places to test

Interactsh is useful in features that may cause outbound requests, such as:

* Webhooks
* URL fetchers
* PDF generators
* Import-from-URL features
* XML parsers
* Image or file metadata processing
* Email parsing
* Remote template rendering

## Why it matters

A lot of real vulnerabilities are blind. That means the application does not show an obvious error or output, but it still performs the dangerous action in the background. Interactsh helps you prove those hidden interactions.

That is why it is so popular in:

* Bug bounty programs
* Authorized pentesting
* CTF challenges
* Security learning labs

## Bottom line

If you want a free and practical way to detect callback-based vulnerabilities, Interactsh is one of the best tools to learn first. For most normal bug bounty, pentest, CTF, and learning workflows, the **client is enough**. If you need privacy or full control, the **server** gives you your own self-hosted OAST setup.

---

## Reusable prompt

**Click here for more information**: [Explain Interactsh as a free alternative to Burp Collaborator](https://chatgpt.com/?q=Explain+Interactsh+as+a+free+alternative+to+Burp+Collaborator.+Cover+what+it+is%2C+how+it+works%2C+where+it+is+useful+with+examples%2C+when+the+client+is+enough%2C+when+the+server+is+needed%2C+and+include+install+commands+for+amd64+and+arm64+Linux.)

**Click here for more information**: [Explain Interactsh for bug bounty, CTF, and learning](https://chatgpt.com/?q=Explain+Interactsh+for+bug+bounty%2C+CTF%2C+and+learning+with+examples+and+setup+commands.)
