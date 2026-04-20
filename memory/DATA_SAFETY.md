# Google Play Data Safety — ENLIGHTEN.MINT.CAFE

Paste these answers into the Play Console → **App content → Data safety** section.

## Data collection summary
- **Does your app collect or share any of the required user data types?** → YES
- **Is all of the user data collected by your app encrypted in transit?** → YES (TLS 1.2+)
- **Do you provide a way for users to request that their data be deleted?** → YES (via email: kyndsmiles@gmail.com)

---

## Data types collected

### Personal info
| Type | Collected | Shared | Processed ephemerally | Required or optional | Purpose |
|---|---|---|---|---|---|
| **Name** | No | — | — | — | — |
| **Email address** | **YES** | No | No | **Required** | Account management, authentication |
| **User IDs** | **YES** (internal UUID) | No | No | Required | App functionality |
| **Address** | No | — | — | — | — |
| **Phone number** | No | — | — | — | — |
| **Race & ethnicity** | No | — | — | — | — |
| **Political / religious beliefs** | No | — | — | — | — |
| **Sexual orientation** | No | — | — | — | — |
| **Other info** | No | — | — | — | — |

### Financial info
| Type | Collected | Shared | Purpose |
|---|---|---|---|
| **User payment info** | No (Stripe handles the card directly; we only receive a receipt token) | No | — |
| **Purchase history** | YES (tier upgrades + timestamps) | No | App functionality, account management |

### Health & fitness
| Type | Collected | Notes |
|---|---|---|
| **Health info / Fitness info** | No | The app coaches on wellness but does not collect health metrics. |

### Messages
| Type | Collected | Shared | Required or optional | Purpose |
|---|---|---|---|---|
| **Emails / SMS / MMS** | No | — | — | — |
| **Other in-app messages** (Sage AI chat logs) | **YES** | **YES → OpenAI / Anthropic / Google LLM providers for response generation only** | **Optional** (only when user chats with Sage) | App functionality, personalization |

### Photos & videos
| Type | Collected | Required or optional | Purpose |
|---|---|---|---|
| **Photos** | YES (only avatar images the user uploads) | **Optional** | Personalization |
| **Videos** | No | — | — |

### Audio files
| Type | Collected | Purpose |
|---|---|---|
| **Voice or sound recordings, Music files, other audio** | No | — |

### Files & docs
| Type | Collected | Purpose |
|---|---|---|
| **Files & docs** | No | — |

### Calendar
Not collected.

### Contacts
Not collected.

### App activity
| Type | Collected | Shared | Required or optional | Purpose |
|---|---|---|---|---|
| **App interactions** | YES (Sparks, quests, Mastery Ledger, tier) | No | Required | App functionality, analytics, personalization |
| **In-app search history** | No | — | — | — |
| **Installed apps** | No | — | — | — |
| **Other user-generated content** (journal, dreams) | YES | No | **Optional** | App functionality, personalization |
| **Other actions** | No | — | — | — |

### Web browsing
Not collected.

### App info & performance
| Type | Collected | Shared | Required or optional | Purpose |
|---|---|---|---|---|
| **Crash logs** | YES (via Play Console, automatic) | No | Required | Analytics (stability) |
| **Diagnostics** | YES (via Play Console) | No | Required | Analytics (performance) |
| **Other app performance data** | No | — | — | — |

### Device or other IDs
| Type | Collected | Purpose |
|---|---|---|
| **Device or other IDs** | No (we do not collect advertising IDs or device serial numbers) | — |

### Location
| Type | Collected |
|---|---|
| **Approximate location / Precise location** | **No** |

---

## Security practices

- ✅ **Data is encrypted in transit** (TLS 1.2+, HTTPS everywhere)
- ✅ **Users can request data deletion** (email-based; purge within 30 days)
- ✅ **Committed to Google Play Families Policy** → N/A (app is 13+)
- ✅ **Independent security review** → Not yet (plan for v1.2 post-launch)

## Developer declaration
- **Legal contact:** Steven Michael
- **Address:** 318 National Street #2, Rapid City, SD 57702, USA
- **Privacy contact email:** kyndsmiles@gmail.com
- **Privacy Policy URL:** `https://enlighten-mint-cafe.me/privacy` (also bundled in-app at `/privacy.html`)

## Target audience & content
- **Target age range:** 13+
- **Contains ads:** No
- **In-app purchases:** Yes (Gilded Path tiers — Seed, Artisan, Sovereign, Gilded — processed via Stripe once wired; currently mocked in v1.0.0)
