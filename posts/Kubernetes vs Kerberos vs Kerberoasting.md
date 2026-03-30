# 🧠 Kubernetes vs Kerberos vs Kerberoasting — Infrastructure vs Identity Attacks (2026)

**Written by Aryan Giri**

---

## 🎯 Introduction

Modern cybersecurity is no longer about a single system — it’s about **interconnected environments**.

Three terms that often confuse beginners are:

* Kubernetes
* Kerberos
* Kerberoasting

They sound similar, but they belong to **completely different layers of security**.

> Kubernetes is where applications run.
> Kerberos is how identities are verified.
> Kerberoasting is how attackers abuse that system to steal credentials.

This article breaks all three down with **clear explanations, real examples, and basic commands**.

---

## 🔐 Kerberos (Authentication Protocol)

### 🧠 What is Kerberos?

Kerberos is a **network authentication protocol** used in **Active Directory (AD)** environments.

It allows users and services to authenticate securely using **tickets instead of passwords**.

---

### ⚙️ How Kerberos Works (Simplified)

1. User logs in → requests Ticket Granting Ticket (TGT)
2. Domain Controller verifies identity → issues TGT
3. User requests access to a service (TGS request)
4. Domain Controller issues Service Ticket (TGS)
5. User presents ticket to service → access granted

---

### 🔑 Key Concepts

* **TGT (Ticket Granting Ticket):** Proof of authentication
* **TGS (Service Ticket):** Access to a specific service
* **SPN (Service Principal Name):** Identifies services in AD

---

### 🧠 Why Kerberos Matters

* No passwords sent over network
* Strong authentication model
* Backbone of Windows enterprise environments

---

## 🎯 Kerberoasting (Identity Attack)

### 🧠 What is Kerberoasting?

Kerberoasting is a **post-exploitation attack** targeting **Active Directory (AD)** environments.

It abuses the **Kerberos authentication protocol** to extract password hashes of service accounts.

---

### ⚙️ How Kerberoasting Works

Step-by-step flow:

1. Attacker gains access to a domain user account
2. Requests a Kerberos service ticket (TGS) for a service
3. Domain controller returns an encrypted ticket
4. Attacker extracts the encrypted hash
5. Hash is cracked offline using tools like Hashcat
6. Plaintext password is recovered

---

### 🔍 Why It Works

* Service accounts often use **weak passwords**
* Passwords are rarely rotated
* Kerberos tickets can be requested by any domain user

---

### 🧪 Example Attack (Impacket)

```bash
GetUserSPNs.py domain.local/user:password -dc-ip 192.168.1.10 -request
```

This command:

* Finds Service Principal Names (SPNs)
* Requests service tickets
* Dumps hashes

---

### 🔓 Cracking the Hash

```bash
hashcat -m 13100 hashes.txt wordlist.txt
```

If the password is weak → it gets cracked.

---

### 🧠 Real-World Scenario

A web server runs under a service account:

* Username: svc-web
* Weak password: Welcome123

Attacker cracks it → logs in → escalates privileges.

---

## 🧱 Kubernetes (Infrastructure Platform)

### 🧠 What is Kubernetes?

Kubernetes is a **container orchestration platform** used to deploy and manage applications.

It automates:

* Deployment
* Scaling
* Networking
* Load balancing

---

### ⚙️ Core Components

#### 🧩 Pod

* Smallest unit in Kubernetes
* Contains one or more containers

Example:

* A web app running inside a pod

#### 🖥️ Node

* A machine (VM or physical)
* Runs pods

#### 🎛️ Cluster

* Group of nodes
* Managed together

#### 🔐 API Server

* Main control interface
* Handles all requests

#### 💾 etcd

* Stores cluster data (including secrets)

---

### 🧪 Example Deployment

```bash
kubectl run nginx --image=nginx
```

Creates a pod running Nginx.

---

### 📋 Useful Kubernetes Commands

#### Get all pods

```bash
kubectl get pods
```

#### Describe a pod

```bash
kubectl describe pod <pod-name>
```

#### Get cluster info

```bash
kubectl cluster-info
```

#### Get nodes

```bash
kubectl get nodes
```

#### Execute command inside pod

```bash
kubectl exec -it <pod-name> -- /bin/bash
```

---

### 🔓 Common Security Issues

* Exposed Kubernetes dashboard
* Weak RBAC permissions
* Secrets stored in plaintext
* Vulnerable container images

---

### 🧠 Real-World Scenario

A developer accidentally exposes the Kubernetes dashboard publicly.

Attacker:

* Accesses dashboard
* Deploys malicious pod
* Gains cluster control

---

## ⚔️ Key Differences

| Feature | Kubernetes            | Kerberos              | Kerberoasting     |
| ------- | --------------------- | --------------------- | ----------------- |
| Type    | Platform              | Protocol              | Attack            |
| Focus   | Infrastructure        | Authentication        | Credentials       |
| Stage   | Initial → Lateral     | Login/Auth            | Post-exploitation |
| Target  | Containers & clusters | Identity verification | Active Directory  |

---

## 🔗 Combined Attack Chain (2026 Reality)

1. Exploit vulnerable Kubernetes app
2. Extract secrets from environment variables
3. Discover AD credentials
4. Move into internal network
5. Abuse Kerberos (Kerberoasting)
6. Crack passwords → privilege escalation

---

## ⚖️ Ethics & Insight

Kubernetes attacks exploit **misconfigurations**.
Kerberoasting exploits **human weaknesses**.
Kerberos itself is **secure by design — but abusable**.

> Security is not just about systems — it’s about people.

---

## 🚀 Conclusion

* Kubernetes = where apps run
* Kerberos = how authentication works
* Kerberoasting = how attackers abuse it

Understanding all three helps you think like a real attacker — and defend like one.


