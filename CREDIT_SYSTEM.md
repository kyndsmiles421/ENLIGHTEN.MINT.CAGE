# ENLIGHTEN.MINT.CAFE — Credit System & Closed-Loop Economy

**Document version:** 1.0 · **Last updated:** February 19, 2026
**Audience:** Google Play reviewers · App Store reviewers · Regulators · Internal engineering

---

## 1. Overview

ENLIGHTEN.MINT.CAFE operates a **closed-loop virtual currency economy**. All in-app currency exists **solely within the app's own database** and is exchanged **only for access to app features** — identical in spirit to arcade tokens, game gold (Fortnite V-Bucks, Candy Crush Gold), or learning-platform credits (Duolingo Super).

There is **no mechanism — anywhere in the codebase — by which any in-app currency can be converted back into fiat currency, cryptocurrency, or any external asset of monetary value.** The system is strictly one-directional: real currency in → virtual currency out. The reverse path does not exist.

## 2. Currencies in use

| Currency | Symbol | Source | Purpose | Redeemable outside the app? |
|----------|--------|--------|---------|----------------------------|
| **Dust**    | ✦ | Purchased (Stripe), earned via Quests / Presence | Access learning modules, workshops, crystalline scenes | **No** |
| **Sparks**  | ✨ | Earned only (non-purchasable) | Rank / Merit display, Council Stacking eligibility | **No** |
| **Gaming Cards** | 🂠 | Awarded by terminal-quest completion | Cosmetic collection, no functional power | **No** |
| **Credits** (internal alias) | — | Synonymous with Dust in older code paths | Same as Dust | **No** |

## 3. Money flow (definitive)

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  User  ──USD──▶  Stripe Checkout (hosted by Stripe)          │
│                              │                               │
│                              │ webhook                       │
│                              ▼                               │
│             Backend verifies + grants:                       │
│                • Subscription tier (Architect / Seeker)      │
│                • OR credit pack (N ✦ Dust)                   │
│                              │                               │
│                              ▼                               │
│                   MongoDB.user.dust_balance += N             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**There is NO return path.** Users cannot:
- Transfer Dust/Sparks/Cards to another user (no P2P endpoints exist)
- Withdraw virtual currency as fiat (no cash-out routes exist)
- Sell virtual currency on a secondary market through the app
- Earn USD by performing app actions

## 4. The "Volunteer Credit" feature

Users who opt into the **Volunteer Rank Track** (`sentinel_nexus.py` rank progression) can earn in-app rank by logging `volunteer_hours`. These hours credit **Dust balance only** — they never convert to USD or any external currency.

The `volunteer_rate` constant in `omega_sentinel.py` governs **how many Dust are awarded per logged hour**, not a payroll rate. It functions identically to a "gold per minute" constant in a role-playing game.

**No money leaves the company to a volunteer.** No payroll, no 1099, no W-2, no wire transfer, no check.

## 5. Code-level guarantees

| Guarantee | Evidence (grep-verifiable) |
|-----------|----------------------------|
| No P2P transfer endpoints | `grep -rn "@router.*transfer"` → **0 matches** |
| No withdrawal/cash-out routes | `grep -rn "@router.*withdraw\|@router.*cashout\|@router.*payout"` → **0 matches** |
| No currency-to-fiat conversion code | `grep -rn "credits_to_usd\|dust_to_dollar"` → **0 matches** |
| All Stripe usage is hosted Checkout | `grep -rn "StripeCheckout\|success_url"` → hosted only; zero raw card collection |
| No crypto integration | `grep -rn "bitcoin\|ethereum\|web3\|metamask"` → no functional integrations |
| Closed-loop enforced by LLM system prompt | `MONETIZATION_SENTINEL_RULES` in `sovereigns.py` explicitly forbids the in-app AI from advising cash exchanges |

## 6. Regulatory classification

- **Not a money transmitter** (FinCEN 31 CFR 1010.100(ff)) — no third-party funds transfer
- **Not a financial institution** — no loans, deposits, or investment products
- **Not a cryptocurrency exchange** — no crypto assets exchanged
- **Standard in-app purchase model**, analogous to "arcade tokens" established in legal precedent (e.g., Title 18 gaming-token definitions)
- **Google Play classification:** in-app purchases ✓ · financial features ❌

## 7. Modifications to this policy

Any engineering change that introduces:
- A peer-to-peer transfer endpoint
- A withdrawal / cash-out flow
- A mechanism to convert virtual currency to fiat or crypto
- Affiliate / commission payouts to users in USD

…must first trigger a **compliance review** and an update to this document. The current deployment does **none** of these.

---

## 8. Contact

Questions from reviewers or regulators:
**sovereign@enlighten.mint.cafe** — response SLA 7 business days.

---

*This document is the authoritative source of truth for ENLIGHTEN.MINT.CAFE's economic model.*
