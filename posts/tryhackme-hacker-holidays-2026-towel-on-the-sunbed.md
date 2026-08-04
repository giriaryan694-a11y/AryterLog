Written By Aryan Giri

**Room:** Towel on the Sunbed
**Category:** Web
**Difficulty:** Medium
**Room URL:** https://tryhackme.com/room/hh-towelonthesunbed-61271709

## Scenario

Ponzi discovered a crypto rewards application running as part of the hotel's wellness portal. Guests can claim **50 reward points once every 24 hours**, and reaching **150 points** unlocks the exclusive **Whale Vault**.

Waiting three days would certainly work—but this room is about finding a flaw in the application's business logic.

## Learning Objectives

* Analyze application workflows using Burp Suite
* Identify business logic vulnerabilities
* Exploit a race condition
* Abuse concurrent requests
* Understand why server-side synchronization matters

---

## Initial Enumeration

Before interacting with the application, ensure Burp Suite is configured as your browser proxy so every request can be inspected.

Visiting the application redirects to the login page.

<img width="1279" height="820" alt="Screenshot 2026-08-04 160854" src="https://github.com/user-attachments/assets/af246299-df96-4331-905d-090047919539" />


A registration option is available, so create a test account.

Example credentials:

```
Username: tester
Password: tester
```

<img width="1297" height="864" alt="Screenshot 2026-08-04 160924" src="https://github.com/user-attachments/assets/24887a1d-c672-4ae0-b0bb-79ae028065e3" />


After logging in, the dashboard becomes available.

<img width="1258" height="809" alt="Screenshot 2026-08-04 160943" src="https://github.com/user-attachments/assets/905db9af-6dc1-4655-aab0-8237c5d964a9" />


---

## Understanding the Reward System

The dashboard contains a **Claim Reward** button.

Each successful claim awards:

* 50 Points
* Only once every 24 hours

The application also contains a **Vault** section.

The vault requires:

```
150 Points
```

to unlock.

<img width="1282" height="816" alt="Screenshot 2026-08-04 160958" src="https://github.com/user-attachments/assets/a03bebd5-9473-4745-9236-7995a6c51444" />


After claiming once, the balance becomes **50 points**.

<img width="1273" height="769" alt="Screenshot 2026-08-04 161013" src="https://github.com/user-attachments/assets/78723476-e2a2-4371-a139-6f41538c4f00" />


At this point there are two obvious possibilities:

* Wait three days
* Find a way to bypass the 24-hour limitation

Since this is a Hacker Holidays room, the second option is clearly the intended path.

---

## Exploring the Application

Out of curiosity, inspect the site's endpoints using Burp Suite.

The sitemap reveals several API endpoints.

<img width="1596" height="894" alt="Screenshot 2026-08-04 161046" src="https://github.com/user-attachments/assets/77907f24-ca93-48b5-9525-f77389c911d2" />


Although `/api` initially looks interesting, nothing here is directly vulnerable by itself.

The vulnerability lies in **how the application processes reward claims**, not in hidden endpoints.

---

# Exploiting the Race Condition

The challenge revolves around abusing multiple reward requests arriving at the server simultaneously.

To avoid cooldowns from the first account, log out and create a fresh account.

Example:

```
Username: tester2
Password: tester2
```

<img width="514" height="504" alt="Screenshot 2026-08-04 163355" src="https://github.com/user-attachments/assets/05fdcb01-1c3d-48cd-bb8f-3e2b49b82127" />


---

## Capture the Request

Enable Burp Intercept.

```
Proxy
    ↓
Intercept
    ↓
Intercept is ON
```

<img width="432" height="210" alt="Screenshot 2026-08-04 163411" src="https://github.com/user-attachments/assets/2677f9b7-10f6-4a9c-8593-1879395440be" />

Return to the application and press **Claim Reward**.

<img width="791" height="370" alt="Screenshot 2026-08-04 163429" src="https://github.com/user-attachments/assets/a373e65b-3944-41bb-98c6-0b60ccfb78fa" />

Burp intercepts the request.

<img width="775" height="425" alt="Screenshot 2026-08-04 163448" src="https://github.com/user-attachments/assets/cc87aa95-7262-4b80-b12a-b766f3791280" />


Right-click the intercepted request and choose:

```
Send to Repeater
```

Do **not** forward the request yet.

---

## Creating a Request Group

Inside Repeater:

Right-click the request tab.

Select:

```
Add tab to group
```

Create a new group using the default settings.

<img width="577" height="640" alt="Screenshot 2026-08-04 163517" src="https://github.com/user-attachments/assets/770b098d-4bf4-49f1-9432-3567578f5f31" />


Now duplicate the request.

```
Duplicate Tab
```

<img width="491" height="380" alt="Screenshot 2026-08-04 163536" src="https://github.com/user-attachments/assets/b1ed5783-4613-474b-ab77-5862b5a77485" />


Instead of creating only three requests, increase the number to **30 duplicated tabs**.

<img width="307" height="181" alt="Screenshot 2026-08-04 163547" src="https://github.com/user-attachments/assets/0c0f6206-bb1d-4edb-9595-1102ff028251" />


---

## Why 30 Requests?

At first glance, simple math suggests:

```
50 × 3 = 150
```

So three simultaneous requests should be enough.

Interestingly, they aren't.

Testing with only three concurrent requests usually results in only **100 points**.

This happens because concurrent processing depends on the server's internal implementation.

Without access to the source code, we cannot know exactly how requests are scheduled or when balance updates occur.

Sending a much larger burst significantly increases the likelihood that multiple requests will pass validation before the balance is updated.

---

## Sending Requests in Parallel

Do **not** press the normal **Send** button.

Instead, click the small arrow beside **Send**.

Choose:

```
Send in parallel
```

<img width="436" height="311" alt="Screenshot 2026-08-04 163607" src="https://github.com/user-attachments/assets/ea245224-00f8-424e-806f-dc0aafc7854a" />


Execute every request simultaneously.

<img width="1181" height="478" alt="Screenshot 2026-08-04 163654" src="https://github.com/user-attachments/assets/4c3f4f49-005c-491b-9648-5cc35348ab2a" />


Burp sends all duplicated requests at nearly the same time.

If the application lacks proper synchronization, several requests successfully award points before the server realizes the reward has already been claimed.

---

## Verify the Result

Return to the browser.

Disable Burp/FoxyProxy so traffic reaches the application normally.

Refresh the dashboard.

You should now have **well over 150 points**.

<img width="819" height="376" alt="Screenshot 2026-08-04 163702" src="https://github.com/user-attachments/assets/3a4e1681-9b05-423c-a303-1df67b364533" />


Open the Whale Vault.

The application reveals the flag.

The flag is intentionally hidden here to comply with TryHackMe rules.

<img width="816" height="265" alt="Screenshot 2026-08-04 163714" src="https://github.com/user-attachments/assets/ba6de70e-b8a3-419b-9a24-45374ef65d3c" />


---

# Root Cause

The reward endpoint likely performs operations in roughly this order:

1. Check whether today's reward has already been claimed.
2. Award 50 points.
3. Update the database.

When multiple requests arrive simultaneously, several of them complete the validation step before any request updates the user's reward status.

As a result, multiple reward claims are accepted during the same time window.

This is a classic **Race Condition** combined with a **Business Logic Vulnerability**.

---

# Real-World Impact

Although this lab awards fictional crypto points, similar vulnerabilities appear in production applications.

Examples include:

* Reward point abuse
* Loyalty programs
* Coupon redemption
* Promotional credits
* Gift card balance manipulation
* Referral bonuses
* Cryptocurrency faucets
* Banking reward systems

Poor request synchronization can lead to significant financial losses if attackers automate concurrent requests.

---

# Key Takeaways

* Business logic vulnerabilities often exist even when authentication and authorization are correctly implemented.
* Race conditions occur when multiple requests interact with shared data simultaneously.
* Burp Suite's **Send in Parallel** feature is extremely useful for testing concurrency issues.
* Never assume "once every 24 hours" is securely enforced until the backend has been tested.
* Server-side locking, atomic database operations, or transactional updates are essential to prevent this class of vulnerability.

---

## Conclusion

This room demonstrates that exploiting web applications isn't always about SQL injection or remote code execution.

Sometimes the most effective attack is simply sending perfectly valid requests at the same time.

Understanding application logic, request timing, and backend behavior is often enough to bypass restrictions that appear secure from the user interface.
