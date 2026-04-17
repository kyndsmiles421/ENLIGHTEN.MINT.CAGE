# ENLIGHTEN.MINT.CAFE

> 22 Modules | 132 Materials | 198 Tools | 13 Hybrid Titles | 791KB Core Bundle

A Sovereign Unified Engine (PWA) — an immersive wellness, trade mastery, and spiritual platform operating as a 176-nodule organism. Type "Energy" in the Oracle and watch it bridge Nutrition, Electrical, Automotive, and HVAC simultaneously.

---

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB 6+
- yarn

### Installation

```bash
# Clone and enter
cd /app

# Backend
cd backend
pip install -r requirements.txt
# Set environment variables in .env:
#   MONGO_URL=mongodb://localhost:27017
#   DB_NAME=enlightenmint
#   JWT_SECRET=<your-secret>

# Frontend
cd ../frontend
yarn install
# Set environment variable in .env:
#   REACT_APP_BACKEND_URL=http://localhost:8001

# Start services
sudo supervisorctl restart backend
sudo supervisorctl restart frontend
```

### Verify
```bash
# Backend health
curl http://localhost:8001/api/workshop/registry | python3 -c "import sys,json; print(json.load(sys.stdin)['total'], 'modules')"
# Expected: 22 modules

# Search test
curl "http://localhost:8001/api/workshop/search?q=energy"
# Expected: Results bridging multiple domains
```

---

## Architecture

```
React Frontend (3000)  →  Kubernetes Ingress (/api → 8001)  →  FastAPI Backend  →  MongoDB
     │                                                              │
     ├── App.js (184 routes, 3 eager + 210 lazy)                   ├── workshop_v60.py (Master Registry)
     ├── DynamicWorkshop.js (Ghost Router)                         ├── rpg.py (Passport + Titles)
     ├── UniversalWorkshop.js (Universal Cell DNA)                 ├── transmuter.py (Dust Engine)
     ├── OracleSearch.js (Neural Search UI)                        ├── auth.py (JWT Auth)
     └── SovereignProviders.js (25 contexts, 1 chunk)             └── 189 more route files
```

### Key Design Principles
1. **Dynamic Registry:** No manual page files per module. Add data to Python → instantly available.
2. **791KB Metabolic Seal:** Core bundle under 800KB. All heavy data API-fetched.
3. **Intent-Based Search:** Oracle evaluates weighted tags, not filenames. "Pressure" finds Plumbing AND First Aid.
4. **Inline Only:** Zero modals, zero fixed overlays. All expansion is inline.
5. **Universal XP:** Every action flows through `__workAccrue` → Dust + RPG XP → Trade Passport.

---

## Adding a New Workshop Module

1. Open `/app/backend/routes/workshop_v60.py`
2. Add materials array (6 materials, each with 6-depth dive_layers)
3. Add tools array (9 tools)
4. Register: `MODULES["your_module"] = {...}`
5. Add to `WORKSHOP_REGISTRY["your_module"] = {...}`
6. Add to `INTENT_TAGS["your_module"] = [...]`
7. Add skill source to `SKILL_DOMAINS` in `/app/backend/routes/rpg.py`
8. Done. No frontend changes needed.

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/workshop/registry | No | Full module list |
| GET | /api/workshop/search?q= | No | Neural search |
| GET | /api/workshop/:id/materials | No | Module materials |
| GET | /api/workshop/:id/tools | No | Module tools |
| POST | /api/workshop/:id/tool-action | Yes | Execute tool |
| GET | /api/rpg/passport | Yes | Trade Passport |
| POST | /api/rpg/character/gain-xp | Yes | Award XP |
| POST | /api/auth/register | No | Create account |
| POST | /api/auth/login | No | JWT login |
| POST | /api/transmuter/work-submit | Yes | Dust accrual |

---

## Test Credentials

```
Email: test_v29_user@test.com
Password: testpass123
```

---

## Version History

| Version | Milestone |
|---------|-----------|
| V57 | 2 manual workshops (Masonry + Carpentry) |
| V58 | Dead import purge (1.1MB → 1.03MB) |
| V59 | SovereignProviders consolidation (1.03MB → 791KB) |
| V60 | UniversalWorkshop + 5 new cells |
| V61 | Parity + Social Pillar + Neural Clusters |
| V62 | Dynamic Router + search endpoint |
| V63 | Ancestor migration + intent tags |
| V64 | Oracle Search UI + BackToHub route purge |
| V65 | XP wiring fix + 5-module parity push + 6 titles |
| V66 | ABSOLUTE ZERO — 132 materials, 100% density |
| V67 | Sovereign Deployment — architecture docs + audit |

---

## License

Proprietary — ENLIGHTEN.MINT.CAFE by Steven Michael
