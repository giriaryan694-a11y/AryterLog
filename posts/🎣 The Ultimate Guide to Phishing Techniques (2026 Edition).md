# 🎣 The Ultimate Guide to Phishing Techniques (2026 Edition)

**Written by Aryan Giri**

---

## 🧠 Introduction

Phishing is a trick used to make someone trust the wrong person, website, file, or message. The goal is usually to get information, make the person click something unsafe, or get them to approve a login or action they did not mean to approve.

In simple words: phishing is **fake trust used for real harm**.

---

# ⚔️ 1) Link-Based Phishing

## 🔗 Basic Phishing

This is the most common kind of phishing. The victim gets a message with a link that looks normal, but it leads to a fake website.

**Example:**
An email says your account needs verification, and the link opens a page that looks like a real login page.

## 🎯 Spear Phishing

This is phishing aimed at one specific person or one specific company. The message is made to feel personal, so it looks more believable.

**Example:**
An attacker mentions a real project name or coworker to make the message seem genuine.

## 👔 Whaling

This is spear phishing aimed at important people like CEOs, managers, or finance staff.

**Example:**
A fake legal or payment request is sent to a company executive.

## 📱 Smishing

Smishing means phishing through SMS or text messages. The word comes from **SMS + phishing**.

**Example:**
A text says, “Your parcel is delayed. Click here to update delivery.”

## 📞 Vishing

Vishing means phishing through voice calls. The attacker calls and pretends to be a trusted person or company.

**Example:**
A caller pretends to be from a bank and asks for an OTP or password.

---

# ⚔️ 2) Attachment-Based Phishing

## 📄 HTML Attachments

An HTML attachment is a file that opens in a browser and can show a fake website page without needing a real online site.

**Example:**
A file named `invoice.html` opens a fake sign-in page when clicked.

## 🖼️ SVG Phishing

SVG is a type of image file, but it is not just a simple picture. It can contain code or links, so it can behave like an active web document.

**Example:**
A file named `report.svg` looks like an image, but opening it sends the user to a fake page.

## 📕 PDF Phishing

A PDF can include links, buttons, or fake instructions that lead to a phishing site.

**Example:**
A PDF says “Click here to view the secure document,” but the link goes to a fake login page.

## 🧠 OneNote Phishing

OneNote is a note-taking file format. Attackers can hide a malicious link or file behind what looks like a harmless note or button.

**Example:**
A note shows a big button that says “Open file,” but the click leads somewhere unsafe.

## 📦 ISO / IMG Phishing

ISO and IMG are disk image files. They can contain multiple files inside them, which makes them useful for hiding dangerous content inside a package that looks ordinary.

**Example:**
A file named `documents.iso` contains something that looks like a document but is actually unsafe.

## 🧾 Office Document Phishing

These are phishing attempts using Word, Excel, or similar files. They may ask the user to enable content, enable editing, or open a link.

**Example:**
A Word file says “Enable editing to see the full report.”

---

# ⚔️ 3) Browser-Based Phishing

## 💣 HTML Smuggling

HTML smuggling uses a web page and JavaScript to build a file in the victim’s browser. The file is created on the user side instead of being sent directly.

**Example:**
A page slowly builds a ZIP file in the browser and downloads it.

## 🔄 Open Redirect Abuse

An open redirect is when a trusted site sends the user to another site. Attackers abuse this to make a phishing link look safer.

**Example:**
A link starts on a real company domain and then forwards to a fake login page.

## 🧩 Tabnabbing

Tabnabbing means a browser tab is changed while the user is away, so when they return it looks like a new login prompt.

**Example:**
A tab that once looked harmless suddenly shows a fake sign-in page.

## 🧠 Browser-in-the-Browser (BitB)

This is a fake login window drawn inside a webpage so it looks like a real browser pop-up.

**Example:**
A page displays a fake Google login box that looks convincing at first glance.

## 🍪 Session Hijacking

Instead of stealing the password alone, the attacker tries to steal the session after login. A session is what keeps a user signed in.

**Example:**
The attacker uses a stolen session cookie to enter the account.

---

# ⚔️ 4) Infrastructure and Delivery Tricks

## 🌐 Domain Spoofing

Attackers register names that look almost like the real website name.

**Example:**
A fake domain uses a swapped letter or a very similar-looking character.

## 🔐 HTTPS Abuse

A site can still be dangerous even if it shows the secure lock icon. HTTPS only means the connection is encrypted, not that the site is trustworthy.

**Example:**
A phishing page uses HTTPS so it looks more legitimate.

## ☁️ Trusted Platform Abuse

Attackers host phishing content on services people already trust.

**Example:**
A fake login page is placed on a known cloud hosting platform.

## 📡 CDN Abuse

A content delivery network can make content load faster and appear more normal. Attackers may use this to hide where something really came from.

**Example:**
A malicious page is delivered through a common hosted content path.

---

# ⚔️ 5) Visual and UX-Based Attacks

## 🎭 Fake UI Overlays

A fake button or screen is placed on top of a real-looking page to guide the user into clicking the wrong thing.

**Example:**
A download button appears normal but actually sends the user to a phishing page.

## 🧾 Fake Document Viewers

The page pretends to be a file preview screen and asks for a login before showing the document.

**Example:**
A site says “Preview unavailable, please sign in.”

## 🧠 CAPTCHA Phishing

A fake CAPTCHA is used to make the page feel more real or to slow the user down before the next step.

**Example:**
A “Verify you are human” step leads to a fake sign-in page.

## 🔲 QR Phishing

A QR code contains a link to a phishing page.

**Example:**
A scanned QR code opens a fake login screen on a phone.

---

# ⚔️ 6) Multi-Stage Phishing

## 🔗 Chained Attacks

A chain attack uses more than one phishing method in a row.

**Example:**
An SVG file opens a redirect page, which then leads to a fake login site.

## ⏳ Delayed Payloads

The harmful part does not happen instantly. It waits for time or for a user action.

**Example:**
A page looks normal for a few seconds before redirecting.

## 🔍 Sandbox Evasion

Some phishing pages try to detect whether they are being watched by security tools instead of a real person.

**Example:**
The page only shows the fake login after a real click.

---

# ⚔️ 7) Credential Harvesting

## 🔑 Fake Login Pages

This is the most familiar form of phishing. The user is shown a fake sign-in page and asked to enter credentials.

**Example:**
A fake Outlook login page asks for email and password.

## 🎟️ OAuth Phishing

OAuth is a login permission system used by many apps. Attackers abuse it by asking the user to grant access to a fake app.

**Example:**
A fake app asks for account permission instead of asking for a password.

## 🍪 Session Theft

A session token is like a temporary pass that keeps a user logged in. If stolen, it can be reused.

**Example:**
An attacker uses a stolen session to access the account without logging in again.

## 🔐 MFA Fatigue

MFA means multi-factor authentication. MFA fatigue means the attacker keeps sending approval prompts until the victim accepts one by mistake.

**Example:**
The victim gets repeated login notifications and taps “Approve” just to stop them.

---

# ⚔️ 8) Mobile Phishing

## 📱 App-Based Phishing

A fake app looks like a real banking, shopping, or service app.

**Example:**
A fake banking app asks for card details and a PIN.

## 🔗 Deep Link Abuse

A deep link opens a specific place inside an app or mobile browser. Attackers can use this to send the victim into a fake flow.

**Example:**
A message opens a payment screen that looks real but is fake.

## 📷 QR to Mobile

This is when a desktop message pushes the victim to scan a QR code, moving the attack to the phone.

**Example:**
An email shows a QR code that leads to a phishing page on mobile.

---

# ⚔️ 9) AI Phishing (2026)

## 🤖 AI Emails

AI can write messages that sound more natural, personal, and convincing.

**Example:**
A phishing email mentions a recent event and uses polite, realistic wording.

## 🎙️ Voice Cloning

Voice cloning uses synthetic audio to imitate a real person’s voice.

**Example:**
A fake boss call asks for urgent action and sounds familiar.

## 🎥 Deepfake Video

A deepfake video makes a fake person appear on a call or recording.

**Example:**
A fraudster uses a fake executive video to build trust.

---

# ⚔️ 10) Stealth Techniques

## 🧠 Living-off-the-Land

This means using tools already present on the system instead of obvious malware.

**Example:**
A built-in command tool is used after the victim clicks the phishing file.

## 🌫️ Fileless Attacks

Fileless means the malicious code does not stay as a normal file on disk.

**Example:**
The harmful logic runs only in memory.

## 🔍 Hidden Elements

The attacker hides small parts of the page or script so the user does not notice them.

**Example:**
A hidden frame is placed inside a page to capture interaction.

---

# 🧠 Core Pattern Behind Phishing

Most phishing methods use the same core ideas:

* 🤝 Trust in a brand, file, or sender
* ⚡ Urgency and pressure
* 🧍 Human habit and fast clicking
* 🛠️ Weak points in detection tools
* 📱 Differences between desktop and mobile safety

---

# 🛡️ Defensive Perspective

## 🔍 Detection

* Email filters
* Sandbox analysis
* Link checks
* Behavior monitoring

## 🧱 Prevention

* Block risky file types where possible
* Use strong authentication
* Apply security policies consistently

## 🧠 Awareness

* Check the sender
* Check the link
* Check the file type
* Pause before clicking

---

# ⚖️ Ethical Perspective

Phishing knowledge can help defenders recognize attacks and build better security. The same ideas can also be abused by criminals. The difference is always **permission, intent, and context**.

---

# 🧾 Conclusion

Phishing is not one technique. It is a whole family of tricks built around deception, trust, and human behavior. The more familiar and normal something looks, the more important it is to verify it carefully.
