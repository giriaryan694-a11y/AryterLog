Written By Aryan Giri

**Room:** Overheard at Breakfast  
**Category:** OSINT  
**Difficulty:** Easy  
**Room URL:** https://tryhackme.com/room/hh-overheardatbreakfast-6f01793c

## Scenario

Sometimes the smallest details reveal the biggest secrets.

In this room, you're provided with a screenshot of a conversation overheard at the Byte Lotus Hotel breakfast area. The objective is to extract identifying information from the chat and use open-source intelligence (OSINT) techniques to locate a hidden online profile.

This challenge demonstrates how seemingly harmless conversations can expose enough information to identify someone online.

---

## Task Files

Download and extract the provided archive.

After extraction, you'll receive a screenshot containing the breakfast conversation.

<img width="1175" height="781" alt="conversation" src="https://github.com/user-attachments/assets/ccdf3dfd-8871-444e-bd01-d1ea699b450a" />

---

## Analyzing the Conversation

Rather than reading the conversation casually, inspect every detail carefully.

The following indicators immediately stand out.

### People Mentioned

- Ponzi
- Lambo

### Organization / Location

- Byte Lotus Hotel
- Resort

### Social Media References

The conversation mentions:

- Social media profiles
- Tagged accounts
- Previous profile linking service
- Deleted online presence

### Email Address

The biggest clue is the exposed email:

```text
lambobytelotushotel@gmail.com
```

### Additional Hint

Another person remembers that the profile service:

- Started with the letter **G**
- Was free
- Allowed linking multiple social media accounts together

This is the key hint required to solve the challenge.

---

## Identifying the Platform

Searching for profile aggregation services that:

- start with **G**
- are free
- link multiple social media accounts

quickly points to **Gravatar**.

Gravatar associates an email address with a globally recognized avatar and public profile used across many websites.

---

## Using the Official Gravatar Email Checker

Gravatar now provides an official email lookup page.

https://gravatar.com/site/check

<img width="905" height="346" alt="Screenshot 2026-08-02 131434" src="https://github.com/user-attachments/assets/da403048-3cf9-449e-9c26-1785b96ad710" />



Enter the email discovered in the conversation:

<img width="1178" height="715" alt="Screenshot 2026-08-02 130347" src="https://github.com/user-attachments/assets/edd744d6-74e7-4139-b512-82fe6c774ba0" />

```text
lambobytelotushotel@gmail.com
```

The lookup returns information including:

- Avatar
- Email hash
- Profile URL

<img width="1062" height="669" alt="Screenshot 2026-08-02 130405" src="https://github.com/user-attachments/assets/3ecfd867-37ee-455d-bee9-2f5d51bc888e" />


---

## Visiting the Profile

Open the discovered profile URL in a browser.

The profile itself appears mostly empty, but the description contains an interesting Base64-encoded string.

<img width="1607" height="904" alt="Screenshot 2026-08-02 130326" src="https://github.com/user-attachments/assets/67cde548-1c89-4d96-ae9e-916304e5e393" />


---

## Decoding the Base64 String

Copy the Base64 string.

You can decode it using either CyberChef or the terminal.

### Option 1 — CyberChef

Open:

https://gchq.github.io/CyberChef

Apply the recipe:

```
From Base64
```

Paste the encoded string.

### Option 2 — Linux Terminal

```bash
echo "BASE64_STRING" | base64 -d
```

Both methods reveal the hidden flag.

As required by TryHackMe's write-up policy, the flag has been redacted.

<img width="1259" height="647" alt="Screenshot 2026-08-02 130444" src="https://github.com/user-attachments/assets/50bb48d0-389f-459d-ab35-14b6081909b1" />


---

## Osint Flow

```
Conversation Screenshot
        │
        ▼
Extract Email Address
        │
        ▼
Identify Gravatar
        │
        ▼
Email Lookup
        │
        ▼
Open Public Profile
        │
        ▼
Find Base64 String
        │
        ▼
Decode Base64
        │
        ▼
Retrieve Flag
```

---

## Skills Learned

- OSINT from casual conversations
- Identifying valuable reconnaissance indicators
- Investigating public identity services
- Using Gravatar as an OSINT source
- Base64 identification and decoding
- Pivoting from an email address to online profiles

---

## Key Takeaway

This room is an excellent demonstration of how a single leaked email address combined with seemingly insignificant conversational details can expose a user's public digital footprint.

No exploitation or brute force was required—only careful observation, OSINT, and a simple Base64 decoding step.

It highlights why oversharing information, even in casual conversations, can unintentionally reveal far more than intended.
