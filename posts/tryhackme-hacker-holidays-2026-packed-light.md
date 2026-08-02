Written By Aryan Giri

**Room:** Packed Light  
**Category:** Forensics  
**Difficulty:** Easy  
**Room URL:** https://tryhackme.com/room/hh-packedlight-02e5330c

## Scenario

The hotel network appears normal at first glance, but something unusual is happening.

A host repeatedly communicates with a service running on **TCP port 8080** every second. The traffic is small, consistent, and looks harmless until inspected more closely. Our objective is to identify the covert communication channel, recover the hidden data, decode it, and obtain the flag.

---

# Download the Challenge Files

Download the ZIP archive provided by the room and extract it.

```bash
unzip PackedLight.zip
```

Inside the archive you'll find the packet capture (`traffic.pcapng`).

Open it in Wireshark.

<img width="1919" height="1026" alt="Screenshot 2026-07-31 100158" src="https://github.com/user-attachments/assets/beedb614-6244-4aa3-8860-a2ee2ff1ed8e" />

---

# Inspecting the Traffic

Before diving into individual packets, it is worth observing the overall traffic pattern.

The capture shows repeated HTTP requests to a service running on **TCP port 8080**. More importantly, these requests occur at nearly one-second intervals, which is characteristic of **automated beaconing** rather than normal user browsing. This regular communication makes the host an excellent candidate for further investigation.

Although filtering with:

```text
tcp.port == 8080
```

works, using the HTTP dissector makes the analysis much cleaner:

```text
http
```

Almost immediately an interesting request appears:

```
GET /temp/updates.py
```

<img width="1919" height="1025" alt="Screenshot 2026-07-31 074411" src="https://github.com/user-attachments/assets/7cb1704f-e3e7-46ba-aa26-d2b60da92560" />

---

# Recovering the Python Script

Right-click the request and select:

```
Follow
    → HTTP Stream
```

<img width="1919" height="1008" alt="Screenshot 2026-07-31 074524" src="https://github.com/user-attachments/assets/9daa07fa-9609-40b8-853b-26e383555290" />

Following the HTTP stream reconstructs the complete client/server conversation, allowing us to inspect files transferred over the connection without manually reassembling packets.

This reveals the Python script being downloaded by the client.

<img width="811" height="575" alt="Screenshot 2026-07-31 074905" src="https://github.com/user-attachments/assets/16b71aa2-cb41-43b4-95d7-5ea57168e0d4" />

Reading the script reveals the covert communication mechanism.

The downloaded Python script prepares the data before placing it into the HTTP cookie by:

1. XORing the plaintext
2. Encoding the XOR output using Base64
3. Storing the result inside the `hotel_sess_state` cookie

The important takeaway is that the cookie values are **not random**—they are encoded pieces of the exfiltrated message.

---

# Finding the Hidden Data

Now filter the HTTP requests containing the suspicious cookie.

```text
http.cookie contains "hotel_sess_state"
```

Each HTTP request now contains a value similar to:

```
hotel_sess_state=HA==
```

<img width="403" height="304" alt="Screenshot 2026-07-31 075017" src="https://github.com/user-attachments/assets/f7a9e7dc-a2be-417c-b226-6f1a6376ff13" />
<img width="980" height="890" alt="Screenshot 2026-07-31 080741" src="https://github.com/user-attachments/assets/7726bd2d-3aa3-42ad-a9d2-e6da233c18ab" />

Instead of carrying a normal session identifier, the cookie changes with every request and contains short Base64-looking values such as `HA==`. This unusual behaviour suggests the cookie is being used as a covert storage channel rather than legitimate session management.

Each cookie contains a tiny fragment of the hidden message.

---

# Decoding the Cookie

To understand the encoding, open CyberChef:

https://gchq.github.io/CyberChef

Create the following recipe:

```
From Base64

XOR
```

The Python script first XORs each byte before Base64 encoding it, so the decoding process simply reverses those operations:

1. Decode from Base64
2. XOR with the recovered key (`H`)

During analysis of the recovered Python script, the XOR key was identified as a string beginning with **H**. Only the first character (`H`, ASCII `0x48`) is applied to the one-byte payload stored in each cookie, so using **H** as the CyberChef XOR key successfully reproduces the original plaintext.

For the first cookie:

```
HA==
```

CyberChef outputs:

```
T
```

<img width="1914" height="886" alt="Screenshot 2026-07-31 091941" src="https://github.com/user-attachments/assets/d535ff9c-9af6-49bc-97be-1cb1230eb03d" />

This confirms that every cookie stores a single encoded character.

---

# Recovering the Entire Message

Copying every cookie manually would be slow and error-prone.

Instead, use **tshark**, Wireshark's command-line version.

```bash
tshark -r traffic.pcapng -Y 'http.cookie contains "hotel_sess_state="' -T fields -e http.cookie | sed -n 's/.*hotel_sess_state=\([^;[:space:]]*\).*/\1/p' | tr -d '[:space:]'
```

This command:

- Filters packets containing the `hotel_sess_state` cookie.
- Extracts only the Cookie header.
- Removes everything except the cookie value.
- Concatenates every Base64-encoded one-byte chunk into a single continuous sequence.

Example output:

```
HA==AA==BQ==Mw==Hg==...
```

<img width="1849" height="278" alt="Screenshot 2026-07-31 092007" src="https://github.com/user-attachments/assets/af1e9e36-4a7a-4962-a5f5-c987b9c76662" />

---

# Decode the Complete Payload

Copy the output from the tshark command into CyberChef.

Use the same recipe:

```
From Base64

XOR (UTF-8 Key: H)
```

CyberChef decodes each Base64-encoded byte, XORs it with the recovered key (`H` / `0x48`), and reconstructs the original plaintext, revealing the room flag.

<img width="1543" height="733" alt="Screenshot 2026-07-31 092029" src="https://github.com/user-attachments/assets/74f9eb71-a72d-40c9-ad97-9df0338036c2" />

---

# What This Room Teaches

Packed Light demonstrates a simple but effective covert data exfiltration technique.

Rather than sending the secret directly, the downloaded Python script:

- XOR-encodes the data
- Base64-encodes the result
- Stores each encoded byte inside an HTTP cookie
- Exfiltrates the data one small chunk at a time through regular HTTP requests

Although each request appears completely legitimate in isolation, examining the application-layer data reveals the hidden communication channel.

This room is an excellent introduction to:

- PCAP analysis with Wireshark
- Identifying automated beaconing
- HTTP stream inspection
- Recognizing covert communication channels
- Extracting hidden data from HTTP cookies
- Reversing simple encoding schemes with CyberChef
- Automating forensic analysis using tshark

While the exfiltration mechanism is technically simple, it demonstrates a common covert channel technique: hiding data inside otherwise legitimate application-layer traffic. Because each request appears normal on its own, identifying the beaconing pattern and inspecting HTTP headers become essential skills during network forensic investigations.
