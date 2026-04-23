# SIGEAR Device & Application Structure

SiGear combines **identity, device, and network layers** into a unified child-safe digital environment.

At its core:

* **NTI (Neutral Trusted Identity)** defines *who the child is allowed to be*
* **Avatar Interface** defines *how the child experiences the system*
* **Hub + App + Dashboard** define *where and how rules are applied*

---

## 1. SIGEAR Hub (SBC Device) Concept

The SIGEAR Hub provides **network-level protection**, ensuring all connected devices operate within a safe environment.

### Role in Identity System

* Enforces rules based on **child identity (NTI)**, not just device
* Applies filtering and routing aligned with avatar-guided permissions
* Ensures consistent safety regardless of device type

---

### Design Notes

* Compact, sleek cube or router-style form
* Minimalist branding: SIGEAR logo + “CyGear” tagline
* Designed to be **always-on, invisible infrastructure**

---

### LED Indicators

* 🌐  Internet Status
* 🔒  VPN Active
* 🆘  SOS Triggered
* 👥  Social Activity

---

### Ports

* 2× Ethernet (WAN / LAN)
* Optional USB (storage / recovery / setup)
* Power

---

### Front View Mockup

```
┌─────────────────────┐
│  ░ SIGEAR ░ CyGear  │
│                  	  │
│  🌐  Internet OK	  │
│  🔒  VPN Active	  │
│  🆘  SOS Ready	  │
│  👥  Social Active  |
└─────────────────────┘
```

---

## 2. SIGEAR Mobile App Concept

The SiGear App is the **control and identity interface** for both parents and children.

It connects:

* NTI identity
* Avatar interaction
* Network enforcement

---

### Role in Identity System

* Manages **NTI lifecycle** (setup, recovery, governance)
* Hosts the **avatar interface** for login and interaction
* Applies **mode-based behaviour** (Play, Learn, Explore, Quiet Time)
* Provides simple **safety signals**, not complex monitoring

---

### Main Screens

#### a) Dashboard

* Profile selection (child / device)
* Avatar-based login / presence
* VPN status
* Safe social notifications
* Quick SOS access

---

#### b) Safety & Location

* “Share location” → What3Words code
* Safe zone boundaries
* SOS history (minimal, privacy-aware)

---

### App Layout Sketch

```
[ SIGEAR App ]
┌───────────────┐
│ Profiles ▼    │
│ • Alice	👤	│
| • Bob			│
├───────────────┤
│ Avatar: Active│
│ VPN: [ON/OFF] │
├───────────────┤
│ Guided Feed   │
│ • Safe Content│
│ • Learning    │
├───────────────┤
│ 🆘  SOS		│
└───────────────┘
```

---

## 3. Parent Dashboard Concept

The Parent Dashboard provides **lightweight governance**, not surveillance.

It focuses on:

* clarity
* control
* reassurance

---

### Role in Identity System

* Manages **child identities (NTI profiles)**
* Adjusts **permission levels and modes**
* Provides **simple safety signals** instead of detailed tracking
* Enables moderation for social interactions

---

### Core Functions

* Profile overview
* Mode selection (Play / Learn / Explore / Quiet Time)
* Alerts (only when needed)
* Optional moderation tools

---

### Dashboard Layout Sketch

```
[ SIGEAR Parent Dashboard ]
┌───────────────────────────────┐
│ Profiles | Status | Alerts     │
├───────────────────────────────┤
│ Alice   ⬤🟢 Safe              │
│  Mode: Learn                  │
│  Activity: Normal             │
│  Last SOS: ///tree.flower.hut │
├───────────────────────────────┤
│ Bob     ⬤🟡 Needs Attention   │
│  Mode: Explore                │
│  Attempted Restricted Content │
└───────────────────────────────┘
```

---

## 4. Identity Interaction Flow (NTI + Avatar)

This flow connects all components into a single experience:

1. Child selects avatar
2. Device authenticates using NTI (passkey model)
3. SiGear App applies identity-based mode
4. Hub enforces network-level safety rules
5. Avatar guides interaction within allowed environment
6. If boundary is reached:

   * system redirects instead of blocking

---

## Branding & Visual Identity

* **Primary Color:** Soft tech blue (#4A90E2) → trust, calm

* **Accent Colors:**

  * Green (#7ED321) → safe / active
  * Orange (#F5A623) → warning / guidance

* **Typography:** Rounded, clean sans-serif
  → friendly, modern, child-appropriate

---

## System Summary

This structure provides:

* A **physical safety layer** (SIGEAR Hub)
* A **personal identity layer** (NTI + Avatar)
* A **simple control layer** (SiGear App & Dashboard)

Together, they create a **consistent, guided digital environment** where children can safely explore without constant parental intervention.
