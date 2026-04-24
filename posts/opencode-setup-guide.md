# OpenCode Setup for Cybersecurity Labs

**Written by Aryan Giri**

---

## 🚀 Intro

OpenCode is a customizable AI CLI that can act as your cybersecurity co-pilot for CTFs, bug bounty hunting, and hands-on labs. Instead of being locked into one AI provider, it lets you plug in multiple providers (OpenAI, OpenRouter, Nvidia, or even local models like Ollama).

With the right setup, it becomes a powerful assistant for recon, enumeration, exploitation, and debugging payloads.

---

## ⚙️ Installation Guide

### Step 1 — Update Your System

Always start clean:

```bash
sudo apt update && sudo apt upgrade
```

---

### Step 2 — Install OpenCode

```bash
curl -fsSL https://opencode.ai/install | bash
```

This will automatically download and install OpenCode.

---

### Step 3 — Reload Your Shell

Installer usually updates your shell config (`.zshrc` or `.bashrc`):

```bash
source ~/.zshrc
```

---

### Step 4 — Launch OpenCode

```bash
opencode
```

You’ll see a clean UI.

Type `/` to open commands.

You can either:

* Select **/connect**
* Or type `/connect` and press Enter

![Connect Menu](https://giriaryan694-a11y.github.io/AryterLog/posts/assets/img/opencode/1.png)

---

## 🔌 Connecting an AI Provider

You’ll see multiple providers:

* OpenRouter
* OpenAI
* Localhost (LM Studio / Ollama)
* Others

For beginners (especially without a GPU), Nvidia is a solid choice because:

* Higher rate limits
* Access to multiple LLMs
* Good for experimentation

Scroll and select Nvidia:

![Select Nvidia](https://giriaryan694-a11y.github.io/AryterLog/posts/assets/img/opencode/2.png)

---

### Step 5 — Get Nvidia API Key

Go to:

* [https://build.nvidia.com/](https://build.nvidia.com/)

Create an account (phone verification required).

Then visit:

* [https://build.nvidia.com/settings/api-keys](https://build.nvidia.com/settings/api-keys)

Copy your API key and paste it into OpenCode.

---

### Step 6 — Select a Model

After entering API key:

* Either type `/models`
* Or it will prompt automatically

Recommended model shown here:

![Model Selection](https://giriaryan694-a11y.github.io/AryterLog/posts/assets/img/opencode/4.png)

---

### Step 7 — Confirm UI

You should now see something like:

![UI Ready](https://giriaryan694-a11y.github.io/AryterLog/posts/assets/img/opencode/5.png)

---

## 🧠 Creating a Cybersecurity Agent

By default, OpenCode is tuned for software engineering — not offensive security.

So we fix that.

---

### Step 8 — Exit OpenCode

Press:

```
Ctrl + C
```

(Once or twice depending on your shell)

---

### Step 9 — Create an Agent

```bash
opencode agent create
```

Paste this description:

```
A focused AI co-pilot designed for CTFs, bug bounty hunting, and hands-on cybersecurity labs. It guides users through real-world attack paths—from reconnaissance and enumeration to exploitation and post-exploitation—while explaining the underlying vulnerabilities, tools, and techniques. Built for practical learning, it helps debug failed exploits, craft payloads, and think like an attacker in modern security environments.
```

Example:

![Agent Prompt](https://giriaryan694-a11y.github.io/AryterLog/posts/assets/img/opencode/6.png)

---

### Step 10 — Capabilities

Just press Enter to accept defaults.

---

### Step 11 — Select Your Agent

Launch OpenCode again:

```bash
opencode
```

Then type:

```
/agents
```

Select your newly created agent (based on description):

![Select Agent](https://giriaryan694-a11y.github.io/AryterLog/posts/assets/img/opencode/7.png)

![Agent List](https://giriaryan694-a11y.github.io/AryterLog/posts/assets/img/opencode/8.png)

---

### Step 12 — Ready State

Now your prompt should show:

* Agent Name
* Model Name
* Provider

![Agent Active](https://giriaryan694-a11y.github.io/AryterLog/posts/assets/img/opencode/9.png)

![Final UI](https://giriaryan694-a11y.github.io/AryterLog/posts/assets/img/opencode/10.png)

---

## ⚠️ Important Notes

* AI can give **false positives** — always verify manually
* Do NOT rely blindly during real engagements

### For Professionals:

If you're a:

* Pentester
* Red Teamer
* Blue Teamer

Avoid external providers (Nvidia, OpenAI, etc.) unless:

* You have permission
* It complies with company policies

Otherwise:

* Use **LM Studio**
* Use **Ollama**
* Use **llama.cpp** (fast + recommended)

---

## 🧪 Reality Check

* OpenCode is highly customizable
* Works with local + cloud models
* Great for learning workflows

But:

* OpenAI Codex and Gemini CLI often perform better out-of-the-box
* API versions may have lower rate limits compared to OAuth tools

---

## 🧠 Final Thoughts

OpenCode becomes powerful only when:

* You pick the right model
* You tune the agent correctly
* You validate outputs like a real attacker

Treat it as an assistant — not a replacement.

---

🔥 Now you’ve got the setup.

Next move?

Spin up a lab, throw a vulnerable machine at your agent, and see how it handles recon → exploit.

Where does it fail? That’s where you level up.
