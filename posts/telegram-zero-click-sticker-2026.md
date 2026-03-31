# Telegram, Stickers, and a Zero-Click Claim: What We Know So Far

**Written by Aryan Giri**

A message app is supposed to be simple. You open it, read a chat, maybe react with a sticker, and move on. That is why the latest Telegram vulnerability claim caught so much attention: the alleged attack path is not a suspicious link, not a fake file you were tricked into opening, but an animated sticker.

That sounds almost too strange to believe. And that is exactly why the story needs a careful read.

## The claim that set off alarms

According to reports tied to Trend Micro’s Zero Day Initiative (ZDI), the issue is tracked as **ZDI-CAN-30207** and affects Telegram on **Android and Linux**. The core allegation is that a specially crafted animated sticker could trigger **remote code execution** without any user interaction. In plain language: receiving the content could be enough to cause harm.

That is the kind of claim that immediately raises eyebrows in the security world. If true, it would be serious because it would sit in the rare and dangerous category of **zero-click** vulnerabilities — attacks that do not rely on a victim tapping, opening, or approving anything.

Some media reports describe the issue as **critical** and assign it a **CVSS 9.8** rating. But here is the important nuance: ZDI’s public upcoming-advisory listing shows **ZDI-CAN-30207** for Telegram with a **CVSS 7.0** entry. That mismatch matters. It means the public reporting is not perfectly aligned yet, and the final technical details have not been fully released.

## Who is behind the disclosure?

The researcher named in reporting is **Michael DePlante (@izobashi)** of **Trend Micro Zero Day Initiative**. ZDI is Trend Micro’s long-running vulnerability disclosure program, created in **2005** to encourage researchers to report zero-days privately to affected vendors instead of publishing them first or letting them circulate in the wild.

That background matters because ZDI is not a random blog or rumor machine. It is a well-known disclosure program that works with researchers and vendors on coordinated release schedules. In this case, ZDI’s upcoming-advisory page shows the Telegram issue is scheduled for public disclosure on **July 24, 2026**.

## Telegram’s response: a firm denial

Telegram has publicly pushed back hard.

The company says the flaw **does not exist** and argues that the alleged sticker-based attack is not technically feasible under its current security model. Telegram’s position is that stickers uploaded to the platform are **validated on its servers** before they can be played by Telegram apps, which it says blocks malformed or malicious sticker files from being delivered to users.

That creates the central conflict in the story:

* ZDI and related reporting describe a serious zero-click issue.
* Telegram says the vulnerability is not real and that server-side validation prevents the attack path.

At this point, the public does not have the full technical write-up, so an outside observer cannot independently settle the dispute yet.

## Why this story spread so fast

The reason this story traveled quickly is simple: it hits a fear people already understand.

We tend to think of danger as something we choose — a link we click, a file we open, a prompt we accept. A zero-click claim breaks that mental model. It suggests the software itself may become the delivery mechanism, turning an ordinary message into a possible entry point.

That is also why security researchers pay close attention to features that automatically parse media. Sticker packs, previews, animation handling, and file conversion pipelines all increase complexity, and complexity is where bugs often live.

## What is still unknown

A careful reading of the current reporting leaves several open questions:

* Is the issue truly exploitable as described?
* Does it affect only specific Telegram builds or configurations?
* Is the actual severity closer to the public CVSS 7.0 listing or the higher 9.8 claims appearing in media coverage?
* Will the full disclosure support Telegram’s denial, or confirm the researchers’ concerns?

Until the technical advisory is public, those answers remain unresolved.

## The bigger lesson

Even before the final disclosure lands, this story is a reminder that modern app security is no longer only about passwords and logins. Attackers and researchers alike focus on parsing engines, media processing, and background automation because those systems are powerful — and therefore attractive targets.

The right response is not panic. It is discipline: keep software updated, prefer official clients, and watch for final technical details before treating the claim as proven fact.

The interesting part of this story is not just whether Telegram is right or wrong. It is how quickly one tiny-looking feature — an animated sticker — turned into a debate about trust, validation, and the hidden risk inside everyday software.

*This article is based on public reporting available as of March 31, 2026.*
