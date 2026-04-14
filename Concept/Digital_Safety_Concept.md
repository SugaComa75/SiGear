# SIGEAR – CyGear

### Social Internet Governance Educator And Relay

**"Your Child’s Safe Network and Social Hub"**

---

## Identity-Led Safety Model (SiGear NTI System)

SiGear introduces a new approach to digital safety by shifting from network-only controls to **identity-led guidance**.

Each child is assigned a **Neutral Trusted Identity (NTI)**, a secure,Non-Transferable, privacy-preserving digital identity that enables safe interaction across devices, applications, and online environments **without exposing personal data**.

This identity is paired with a personalised **adaptive avatar**, which acts as the child’s visible presence and interaction layer within the digital environment.

---

## Key Principles

* **No personal data exposure**
  Systems verify eligibility (e.g. age, permissions) without sharing identity data.

* **Guidance over restriction**
  Children are guided toward appropriate content rather than simply blocked.

* **Consistency across platforms**
  The same identity and safety rules apply across apps, websites, and devices.

* **Parent-controlled governance**
  Parents manage identity, permissions, and recovery through the SiGear app.

---

## The Role of the Avatar

The avatar is not just cosmetic. It is the **primary interaction layer** between the child and the digital world.

It functions as:

* 🔑 **Authentication layer**
  Acts as a passkey-style login, removing the need for usernames and passwords.

* 🧭 **Guidance interface**
  Translates system rules into child-friendly responses.

* 🛡️ **Safety enforcement layer**
  Prevents unsafe interactions and redirects to appropriate alternatives.

* 🧠 **Behaviour translator**
  Converts technical restrictions into narrative interactions that children understand.

---

## Identity + Infrastructure: How SiGear Works

SiGear combines **identity-based control (NTI + Avatar)** with **network-level protection (Hub + VPN)** to create a complete safety environment.

### Interaction Flow

1. Child selects their avatar
2. Device authenticates using NTI (passkey model)
3. SiGear determines allowed environment (based on profile, time, and context)
4. Avatar presents a safe, guided experience
5. If a boundary is reached:

   * Avatar redirects to appropriate content instead of blocking

---

### System Architecture

```
            Internet
                │
             Router
                │
           SIGEAR Hub (SBC)
 ┌─────────────────────────────┐
 │ • DNS-Gated Firewall        │
 │ • Family Profiles           │
 │ • Time & Usage Rules        │
 │ • Moderated Social Media    │
 │ • Mobile VPN Server         │
 │ • W3W Safety Relay          │
 └───────────┬─────────────────┘
             │
   ┌─────────┴─────────┐
   │                   │
Home Devices       Mobile Devices
 (PCs, consoles,   (Smartphones, tablets)
  smart TVs)
             │
         SIGEAR App
     • Identity & Profile Control
     • VPN & Policy Enforcement
     • Safe Social Media Access
     • W3W Emergency Location
```

---

## What SIGEAR Solves

Children spend increasing time online, but current protections (COPPA, parental controls) are:

* incomplete
* complex
* easy to bypass

Parents want:

* safety
* guidance
* privacy

—not constant monitoring.

Children need:

* safe exploration
* structured freedom
* a trusted digital environment

---

## Key Features

### 1. Identity-Based Safety (NTI + Avatar)

* Child-safe login with no passwords
* Age and permission verification without exposing personal data
* Consistent identity across platforms

---

### 2. Child-Safe Internet

* Blocks inappropriate websites, malware, and risky content
* DNS filtering tailored to identity and profile
* Rules adapt based on context (time, mode, device)

---

### 3. Moderated Social Environment

* Safe, child-friendly interaction space
* Automated + supported moderation
* Educational and gamified engagement

---

### 4. Mobile VPN Enforcement

* Safety rules follow children outside the home
* Prevents bypass via mobile data or public Wi-Fi

---

### 5. Privacy-Respecting Safety

* Emergency location shared only when required
* Uses What3Words instead of precise GPS by default
* Optional safe-zone alerts and check-ins

---

### 6. Family Governance (SiGear App)

* Simple mode-based controls (Play, Learn, Explore, Quiet Time)
* Device and profile management
* Clear safety signals instead of intrusive monitoring

---

## Example Interaction

Instead of:

> “Access denied”

The system responds through the avatar:

> “This isn’t for you yet. Let’s find something fun and safe instead.”

This reduces friction, prevents frustration, and encourages safe exploration.

---

## Cross-Platform Identity

The NTI allows children to carry their safety profile across platforms, ensuring consistent protection regardless of the application or service being used.

This transforms SiGear from a **parental control tool** into a **foundational identity layer for safe digital childhoods**.

---

## Why SIGEAR Works

* **Safe, not restrictive**
  Children are guided, not blocked.

* **Invisible complexity**
  Parents interact with simple controls, not technical systems.

* **Privacy-first by design**
  No unnecessary data sharing or tracking.

* **Scalable and inclusive**
  Designed for families, communities, and institutional partnerships.

---

## Licensing & Deployment

* AGPL v3 for all components (hub, app, social platform)
* Prevents privatization while remaining freely deployable
* Supports partnerships with governments and child-safety organisations

Deployment model:

* Plug-and-play SBC hub
* Mobile app for parents and children
* Optional dashboard for extended control

---

## Tagline

**"SIGEAR – Safe, Smart, and Connected"**
