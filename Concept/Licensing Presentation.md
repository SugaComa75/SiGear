## SIGEAR Ecosystem Overview

                ┌───────────────┐
                │    Internet   │
                └───────┬───────┘
                        │
                ┌───────▼───────┐
                │     Router    │
                └───────┬───────┘
                        │
                ┌───────▼─────────────┐
                │   SIGEAR Hub        │
                │  (SBC Child-Safe Hub)│
                │                      │
                │ Core Functions:      │
                │ • DNS-Gated Firewall │
                │ • Family Profiles    │
                │ • Time & Usage Rules │
                │                      │
                │ Connected Services:  │
                │ • Moderated Social   │
                │ • Mobile VPN Server  │
                │ • W3W Safety Relay   │
                └───────┬─────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
┌───────▼──────────┐             ┌──────▼───────────┐
│ Home Devices     │             │ Mobile Devices    │
│ • PCs / Consoles │             │ • Smartphones     │
│ • Tablets        │             │ • Tablets         │
│ • Smart TVs      │             │                  │
└─────────────────┘             └─────────┬────────┘
                                              │
                                        ┌─────▼─────┐
                                        │ SIGEAR App│
                                        │ • VPN     │
                                        │ • Profiles│
                                        │ • W3W SOS │
                                        │ • Safe SM │
                                        │ • Avatar  │
                                        └───────────┘

        NTI (Non-Transferable Identity) flows across all components
        providing authentication, policy enforcement, and privacy protection


## Core Capabilities

### 1. DNS-Gated Firewall
- Curated blocklists (adult, malware, high-risk content)  
- Profile-based allow/deny controls  
- Policies enforced via NTI identity layer (not device-only)  
- Enforced at network level (cannot be bypassed locally)  


### 2. Family Profiles
- Device-to-profile assignment  
- Time-based access and usage limits  
- NTI links identity to profile across devices  
- Per-profile content and social controls  


### 3. Moderated Social Media
- Closed, child-safe social environment  
- Moderation supported by trusted partners (charity/government)  
- NTI ensures age-appropriate interaction without exposing personal data  
- Educational and gamified engagement  


### 4. Mobile VPN Enforcement
- App enforces rules beyond the home network  
- Prevents bypass via mobile data or external Wi-Fi  
- NTI maintains consistent identity and policy across environments  


### 5. Privacy-First Location Safety
- Location shared only during SOS or explicit consent  
- Uses What3Words for human-readable, privacy-aware location  
- NTI validates requests without exposing identity data  
- Optional check-ins and safe-zone alerts  


### 6. NTI Identity & Avatar Layer
- Non-Transferable Identity (NTI) acts as a secure, non-clonable identity anchor  
- Avatar provides a child-friendly interface for authentication and guidance  
- Functions as a passkey-style login (no usernames/passwords)  
- Enforces age and permission rules without sharing personal data  
- Provides consistent identity across all apps, devices, and services  


## Brand & Deployment

**Name:** SIGEAR (Social Internet Governance Educator And Relay)


### Licensing Model
- AGPL v3 for core platform  
- Identity layer (NTI + Avatar) designed as open, interoperable standard  
- Prevents privatization while enabling ecosystem collaboration  
- Encourages community contribution while protecting user trust  


### Deployment Model
- Plug-and-play SBC hub between router and home network  
- Mobile app extends protection beyond the home via VPN  
- NTI stored securely and paired during initial setup (USB/card optional for provisioning)  
- Optional partnerships enable preconfigured profiles and moderation  


## Summary

SIGEAR delivers a unified, identity-led safety layer powered by NTI — enabling secure, private, and consistent digital experiences across home and mobile environments, balancing protection, privacy, and independence for modern families.