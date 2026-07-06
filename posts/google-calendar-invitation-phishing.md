Written By Aryan Giri

Google Calendar is designed to make scheduling meetings simple, but the same convenience can also be abused by attackers as part of phishing campaigns.

Unlike traditional phishing emails that rely solely on convincing email content, this technique leverages **calendar invitations** to deliver phishing lures directly into a victim's calendar. Since many users inherently trust notifications coming from applications like Google Calendar, these invitations can appear more legitimate than ordinary spam emails.

This is **not a vulnerability in Google Calendar**. Instead, it is a **social engineering technique** that abuses legitimate calendar invitation functionality.

> **Disclaimer**
>
> All email accounts used during this demonstration were created solely for testing purposes and have since been deleted.

---

# Attack Overview

The attacker creates a calendar event containing a convincing title and description, then sends it as an invitation to the target.

If the victim's Google Calendar settings allow invitations to be added automatically, the event appears inside their calendar without requiring manual approval.

When the event time approaches, Google Calendar sends a notification to the victim, potentially increasing the credibility of the phishing attempt.

---

# Demonstration

## Step 1 — Creating the Malicious Event

From the attacker's Google Calendar account, create a new event.

For this demonstration the event title was:

> **Your Account Has Been Hacked**

Inside the event description, a fake recovery message and phishing URL were included.

The phishing message used in this demonstration was intentionally obvious and easy to identify. In a real attack, attackers can use AI-generated content to create far more convincing messages that closely resemble official communications.



<img width="1346" height="878" alt="Screenshot 2026-07-06 081013" src="https://github.com/user-attachments/assets/942481e7-d661-47ef-bb43-c08605a47811" />


---

## Step 2 — Sending the Invitation

After inviting the victim, Google generates a normal invitation email containing an `.ics` calendar attachment.

The email itself appears completely legitimate because it is a genuine calendar invitation.


<img width="859" height="326" alt="Screenshot 2026-07-06 081033" src="https://github.com/user-attachments/assets/059a1141-2ddf-4fac-8495-956402820089" />
<img width="1569" height="809" alt="Screenshot 2026-07-06 081200" src="https://github.com/user-attachments/assets/5bdfd114-b69f-4962-b490-f5737746817c" />
<img width="1428" height="732" alt="Screenshot 2026-07-06 081212" src="https://github.com/user-attachments/assets/ccfa8cb4-3fe4-499c-9564-9fbd08575fa2" />


---

## Step 3 — Automatic Calendar Entry

On the victim account, the invitation was automatically added to Google Calendar.

No manual calendar creation was required.


<img width="878" height="1600" alt="WhatsApp Image 2026-07-06 at 8 50 14 AM" src="https://github.com/user-attachments/assets/31f9b5c0-77fa-4f8c-a1b3-94e11cf663ac" />


---

## Step 4 — Notification on the Victim Device

When the scheduled time arrived, Google Calendar generated a push notification on the victim's phone.

Because the notification originated from the Calendar application itself, it appeared more trustworthy than a standard phishing email notification.

<img width="1080" height="415" alt="WhatsApp Image 2026-07-06 at 8 24 54 AM" src="https://github.com/user-attachments/assets/d5d6256b-f09f-4d53-9c90-6f590fca8528" />

---

## Step 5 — Opening the Event

Opening the notification displayed the event details, including:

- Event title
- Event description
- Embedded phishing URL

If the victim trusts the notification and follows the provided instructions, they may be redirected to a credential harvesting website.

<img width="791" height="1600" alt="WhatsApp Image 2026-07-06 at 8 24 54 AM (1)" src="https://github.com/user-attachments/assets/539e4a25-ffb9-4264-b9fe-aeebacbf919d" />


---

# Why This Works

Many technically experienced users immediately become suspicious when receiving an unexpected calendar invitation.

Typical questions include:

- Who invited me?
- Why is there a meeting?
- Why would Google Calendar ask me to verify my account?

However, attackers are not targeting only technically experienced users.

Several psychological factors make this attack surprisingly effective.

## Trust in the Application

Users generally trust notifications from installed applications more than random emails.

A notification coming from the Calendar app often feels official.

---

## Context Matters

Attackers rarely use obvious event names.

Instead, they may choose titles such as:

- Interview — 2:00 PM
- Invoice Due Today
- Package Delivery Attempt
- Password Expiration Notice

These subjects create urgency or curiosity that encourages victims to open the event.

---

## Mobile Behavior

Many people quickly tap phone notifications without carefully inspecting:

- who sent the invitation
- the sender's email address
- event details

The smaller screen also reduces visible context.

---

## Workplace Habits

Employees often receive dozens of legitimate calendar invitations every week.

An unexpected invitation is therefore less unusual than receiving an unexpected email.

Attackers abuse this normal workplace behavior.

---

## Phishing Doesn't Need Everyone

Most phishing campaigns expect low success rates.

If:

- 99 people ignore the invitation
- 1 person enters their credentials

the campaign may still be profitable.

---

# MITRE ATT&CK Mapping

| Technique | Description |
|-----------|-------------|
| MITRE ATT&CK T1566 | Phishing |
| Social Engineering | Overall attack strategy |
| Credential Phishing | Goal of stealing login credentials |

The calendar invitation is simply the **delivery mechanism**.

It does **not** exploit a security vulnerability in Google Calendar.

---

# Mitigation

Google allows users to control how invitations are automatically added to their calendars.

## Change Calendar Invitation Settings

1. Open Google Calendar (Web)
2. Click **Settings**
3. Navigate to **General → Event settings**
4. Locate **Add invitations to my calendar**
5. Change the option from **From everyone** to one of the following:

### Only if the sender is known (Recommended)

Invitations are automatically added only when the sender is:

- in your contacts
- part of your organization
- someone you've previously interacted with

---

### When I respond to the invitation in email (Most Secure)

Calendar events are **not** added automatically.

The invitation only appears after you explicitly accept it from the email.

This provides the strongest protection against unsolicited calendar invitations.

---

# Alternative Calendar Applications

Google Calendar is not the only option.

Privacy-focused alternatives such as **Proton Calendar** require users to explicitly import or accept calendar events rather than automatically adding them from incoming invitations, reducing the likelihood of this particular social engineering technique succeeding.

As with any calendar application, users should still verify invitations before accepting them.

---

# Key Takeaways

- This is a **social engineering attack**, not a Google Calendar vulnerability.
- Attackers abuse legitimate calendar invitations as phishing lures.
- Calendar notifications often appear more trustworthy than email notifications.
- Mobile users are particularly susceptible because notifications are frequently opened quickly.
- Changing Google Calendar invitation settings significantly reduces exposure.
- Users should always verify unexpected calendar invitations before interacting with embedded links.
