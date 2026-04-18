# TryHackMe: ContAInment — Full Walkthrough

## Introduction

In this TryHackMe room, we investigate a ransomware-style incident affecting the workstation of **Oliver Deer** at West Tech. The goal is to trace the attacker’s entry point, inspect their activity, recover the hidden data, and complete the containment process.

The room combines endpoint investigation, email forensics, archive recovery, and a little automation with the local AI assistant.

---

## Initial Setup

After connecting to the target machine through SSH, we first explored the usual user directories to understand the workstation layout.

```bash
ssh o.deer@10.66.157.154
```

We checked places like:

* `Desktop`
* `Documents`
* `Mail`

A ransom note was present on the desktop, which confirmed that the system had been compromised.

![Desktop ransom note](https://giriaryan694-a11y.github.io/AryterLog/posts/assets/img/ContAInment/1.png)

---

## Using the AI Assistant

This room provides an AI assistant running locally on the same system. It helps with analysis tasks such as:

* phishing detection
* PCAP reconstruction
* file inspection
* text extraction

We accessed it here:

```text
http://10.66.157.154:7860/?__theme=light
```

![AI assistant interface](https://giriaryan694-a11y.github.io/AryterLog/posts/assets/img/ContAInment/2.png)

---

## Finding the Phishing Email

Inside the `Mail` directory, we found multiple `.eml` files. These were email communication logs, and they were clearly important for identifying the attacker’s initial access.

![Mail directory with EML files](https://giriaryan694-a11y.github.io/AryterLog/posts/assets/img/ContAInment/3.png)

To quickly identify the suspicious email, we asked the AI assistant to search the folder for phishing content:

```text
Can you search the files in this directory /home/o.deer/Mail for phish
```

The AI identified the most likely malicious email as:

> **INVOICE - URGENT REVIEW REQUIRED**

![AI identifies phishing email](https://giriaryan694-a11y.github.io/AryterLog/posts/assets/img/ContAInment/4.png)

We then matched that subject to the actual file in the Mail directory:

```text
2025-06-17_invoice_required_review.eml
```

Opening the file showed that the phish delivered a malicious script called `invoice_payload.scr`.

![Phishing email content](https://giriaryan694-a11y.github.io/AryterLog/posts/assets/img/ContAInment/5.png)

![Malicious attachment reference](https://giriaryan694-a11y.github.io/AryterLog/posts/assets/img/ContAInment/6.png)

---

## Locating the Malicious Payload

Since downloaded files are usually stored in a download-related directory, we searched for the payload name across the filesystem:

```bash
find . -name invoice_payload.scr
```

![Finding the payload](https://giriaryan694-a11y.github.io/AryterLog/posts/assets/img/ContAInment/7.png)

This confirmed the malicious file’s location and helped us understand the attack chain.

---

## PCAP Analysis and the Encryption Key Hint

A hint later revealed that the attacker had accidentally exfiltrated working notes, and the fragments were hidden in a PCAP file. Those fragments contained the key needed to recover encrypted files.

We moved to the `Documents` directory and found a `pcap_dump` folder with dated subdirectories.

Since the phishing email was dated **2025-06-17**, we examined that same date folder.

![PCAP directory structure](https://giriaryan694-a11y.github.io/AryterLog/posts/assets/img/ContAInment/8.png)

Inside the directory, we saw multiple PCAP files. Most were small, but one stood out due to its larger size:

* `session_4444_dump.pcap`

![PCAP files list](https://giriaryan694-a11y.github.io/AryterLog/posts/assets/img/ContAInment/9.png)

Instead of manually reconstructing the traffic, we used the AI tool’s PCAP helper:

```text
can you reassemble session_4444_dump.pcap at directory /home/o.deer/Documents/pcap_dumps/2025-06-17
```

The AI successfully reassembled the file and stored the result here:

```text
/home/o.deer/qwen-output/reassembled_data_dump.txt
```

![PCAP reassembly result](https://giriaryan694-a11y.github.io/AryterLog/posts/assets/img/ContAInment/10.png)

Reading the reconstructed output revealed a useful term:

```text
westtechvictim1
```

![Extracted PCAP notes](https://giriaryan694-a11y.github.io/AryterLog/posts/assets/img/ContAInment/11.png)

This looked like a likely password or decryption clue, so we tested it against the encrypted archive.

---

## Unlocking the Archive

Back in the home directory, we attempted to unlock the encrypted ZIP using the recovered string:

```bash
unzip -P "westtechvictim1" westtech_*.zip
```

![Unlocking ZIP archive](https://giriaryan694-a11y.github.io/AryterLog/posts/assets/img/ContAInment/13.png)

This worked and gave access to the project directory.

We then moved into the extracted workspace:

```bash
cd ~/home/o.deer/westtech_projects/
```

![Project directory](https://giriaryan694-a11y.github.io/AryterLog/posts/assets/img/ContAInment/14.png)

The directory contained several useful files:

* `email_export_april2025.eml`
* `fusion_cell_mk3_blueprints.pdf`
* `internal_security_incident_233.json`
* `project_chimera_specs.txt`
* `prototype_plasma_launcher_test_logs.log`
* `thm_flags.txt`
* `thm_flags_guide.txt`
* `vault_tek_collab_agenda.doc`

---

## Understanding the Flag Challenge

The file `thm_flags.txt` contained a large set of base64-encoded strings.

![Encoded flag list](https://giriaryan694-a11y.github.io/AryterLog/posts/assets/img/ContAInment/15.png)

To understand the goal, we opened `thm_flags_guide.txt`.

![Flag guide 1](https://giriaryan694-a11y.github.io/AryterLog/posts/assets/img/ContAInment/16.png)

![Flag guide 2](https://giriaryan694-a11y.github.io/AryterLog/posts/assets/img/ContAInment/17.png)

The guide explained that:

* there are **500 potential flags**
* each one must be base64-decoded
* the decoded output has the format:

```text
thm{n1,n2,n3,n4,n5}
```

* the correct flag is the **only one containing exactly 3 prime numbers**
* instead of checking every entry manually, we should use the **liberty_prime** tool

---

## Final Prompt for the AI Tool

We asked the assistant to process the file automatically:

```text
Process the file thm_flags.txt located at directory /home/o.deer/westtech_projects/ containing 500 base64-encoded entries by decoding each string individually, converting it into the format thm{n1,n2,n3,n4,n5}, extracting the five numbers (each between 10–99), and then using the available liberty_prime tool (which works on a single flag at a time) to evaluate each decoded entry; iterate through all entries, ignore malformed ones, and identify the only flag that contains exactly 3 prime numbers, returning just that final valid flag.
```

The correct flag was hidden by the room’s instructions in the output screenshot.

![Final flag output](https://giriaryan694-a11y.github.io/AryterLog/posts/assets/img/ContAInment/18.png)

---

## Conclusion

This room was a good example of how an incident response investigation can combine multiple skills:

* email forensics
* suspicious attachment analysis
* PCAP reconstruction
* archive recovery
* structured flag validation
* AI-assisted triage

A manual approach was possible, but the AI helper saved a lot of time while still keeping the investigation grounded in evidence.

This draft can be published as-is or polished further into a cleaner ArytorLog post with a more blog-like intro and outro.
