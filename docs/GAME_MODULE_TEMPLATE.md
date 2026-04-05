# Universal Game Module Template — Developer Recipe

## Architecture Overview

The ENLIGHTEN.MINT.CAFE uses a **plug-and-play game architecture** where individual game modules connect to a central "Universal Game Core" via a standardized bridge pattern. This document is the recipe for adding new game modules.

```
┌─────────────────────────────────────────────────────┐
│           FRONTEND: useGameController Hook           │
│  Location: /frontend/src/hooks/useGameController.js  │
│                                                      │
│  Provides to ANY game module:                        │
│  - nexusState    (current element percentages)       │
│  - coreStats     (level, XP, currencies, stats)      │
│  - distortions   (blur, grain, glitch from harmony)  │
│  - dominantElement / deficientElement                │
│  - harmonyScore                                      │
│  - commitReward()  (Soul-to-Game Bridge call)        │
│  - refreshState()  (force refresh after action)      │
│  - containerStyle  (auto-distortion CSS)             │
└──────────────┬──────────────────────────────────────┘
               │
    ┌──────────▼──────────┐
    │ GameModuleWrapper    │ ← Visual shell, auto-applies:
    │ /components/game/    │   - HarmonyGlow (element-colored ambient)
    │                      │   - GrainOverlay (low harmony noise)
    │                      │   - GlitchStripes (very low harmony flicker)
    └──────────────────────┘
               │
    ┌──────────▼──────────┐     ┌────────────────────┐
    │ Rock Hounding Module │     │ Elemental Crafting  │
    │ (implemented)        │     │ (future — same API) │
    └──────────────────────┘     └────────────────────┘
```

---

## How to Add a New Game Module

### Step 1: Backend — Create the Module File

Create `/app/backend/routes/your_game.py`:

```python
from fastapi import APIRouter, Depends, Body
from deps import db, get_current_user, logger
from routes.game_core import (
    register_module, award_xp, award_currency, modify_stat,
    roll_loot, RARITY_TIERS
)
from routes.nexus import compute_elemental_balance

router = APIRouter()

# Register with Core on import
register_module("your_game_id", {
    "name": "Your Game Name",
    "description": "What this game does",
    "icon": "icon-name",       # lucide icon name
    "color": "#HEX",
    "stat_mapping": {           # which stats this game affects
        "wisdom": "action_name",
        "vitality": "action_name",
        "resonance": "action_name",
    },
})

# Your game-specific endpoints
@router.get("/your-game/state")
async def get_state(user=Depends(get_current_user)):
    # Get Nexus state to drive game logic
    balance = await compute_elemental_balance(user["id"])
    # Use balance to determine biome, difficulty, rewards...
    return {"state": "..."}

@router.post("/your-game/action")
async def do_action(data: dict = Body(...), user=Depends(get_current_user)):
    user_id = user["id"]
    
    # Your game logic here...
    
    # Feed rewards to Core (updates global XP, stats, currencies)
    xp_result = await award_xp(user_id, 50, "your_game:action_name")
    await award_currency(user_id, "cosmic_dust", 25, "your_game:action_name")
    await modify_stat(user_id, "wisdom", 2, "your_game:action_name")
    
    # Feed element modifier back to Nexus
    await db.nexus_decoded_modifiers.update_one(
        {"user_id": user_id},
        {"$inc": {"modifiers.fire": 1}},  # whatever element applies
        upsert=True,
    )
    
    return {"result": "...", "rewards": {"xp": 50, "dust": 25}}
```

### Step 2: Backend — Register the Router

In `/app/backend/server.py`:
```python
from routes.your_game import router as your_game_router

# Add to all_routers list
all_routers = [
    ...,
    your_game_router,
]
```

### Step 3: Frontend — Create the Module Page

Create `/app/frontend/src/pages/YourGame.js`:

```jsx
import useGameController from '../hooks/useGameController';
import GameModuleWrapper from '../components/game/GameModuleWrapper';

export default function YourGame() {
  // This hook gives you EVERYTHING from the Nexus and Core
  const controller = useGameController('your_game_id');
  
  // controller.dominantElement  → 'fire', 'water', etc.
  // controller.harmonyScore     → 0-100
  // controller.distortions      → { blur, grainOpacity, glitchIntensity, ... }
  // controller.coreStats        → { level, currencies, stats }
  // controller.nexusState       → full elemental breakdown
  // controller.deficientElement → element that needs feeding
  
  const doAction = async () => {
    // Your game action...
    // After action, refresh controller state
    controller.refreshState();
  };

  return (
    <GameModuleWrapper
      distortions={controller.distortions}
      dominantElement={controller.dominantElement}
      harmonyScore={controller.harmonyScore}
      moduleName="your_game_id">
      
      {/* Your game UI here — it automatically gets:
          - Harmony-based ambient glow
          - Low-harmony grain/noise overlay
          - Very-low-harmony glitch stripes
          - Element-colored lighting
      */}
      <div>Your game content...</div>
    </GameModuleWrapper>
  );
}
```

### Step 4: Frontend — Register the Route

In `/app/frontend/src/App.js`:
```jsx
const YourGame = lazy(() => import('./pages/YourGame'));
// ...
<Route path="/your-game" element={<YourGame />} />
```

---

## Core API Reference

### Soul-to-Game Bridge
```
POST /api/game-core/commit-reward
Body: {
  "module_id": "your_game_id",
  "xp": 50,
  "dust": 25,
  "stat": "wisdom",
  "stat_delta": 3,
  "element": "fire"
}
Response: { status, module, results: { level, currencies, stats, nexus_modifier } }
```

### Game Core Queries
```
GET /api/game-core/stats        → { level, currencies, stats }
GET /api/game-core/modules      → { modules: [...] }
GET /api/game-core/transactions → { transactions: [...] }
```

### Nexus Integration
```python
from routes.nexus import compute_elemental_balance
balance = await compute_elemental_balance(user_id)
# balance.elements -> { wood: {percentage, status}, fire: {...}, ... }
# balance.harmony_score -> 0-100
```

---

## Visual Distortion System

The `GameModuleWrapper` auto-applies these effects based on the user's Nexus harmony score:

| Harmony Score | Blur | Grain | Glitch | Saturation |
|:---:|:---:|:---:|:---:|:---:|
| 100 (perfect) | 0px | 0.01 | 0 | 1.2 |
| 75 (good) | 0.3px | 0.05 | 0 | 1.075 |
| 50 (neutral) | 0.6px | 0.1 | 0 | 0.95 |
| 25 (poor) | 1.2px | 0.15 | 0.17 | 0.825 |
| 0 (critical) | 1.6px | 0.2 | 1.0 | 0.7 |

These are applied via CSS `filter` and overlay `div`s — **no game-specific code required**.

---

## CSS Element Variables

Games automatically inherit these from the Global Element Style Guide (`index.css`):

```css
--el-wood:  #22C55E    --el-wood-glow:  rgba(34,197,94,0.15)
--el-fire:  #EF4444    --el-fire-glow:  rgba(239,68,68,0.15)
--el-earth: #F59E0B    --el-earth-glow: rgba(245,158,11,0.15)
--el-metal: #94A3B8    --el-metal-glow: rgba(148,163,184,0.15)
--el-water: #3B82F6    --el-water-glow: rgba(59,130,246,0.15)
```

The `useGameController` hook also provides dynamic CSS variables via `controller.elementCSS`:
```
--game-el-{element}           → color hex
--game-el-{element}-intensity → 0-1 based on percentage
--game-el-{element}-glow      → color with alpha based on intensity
--game-harmony                → 0-1 normalized harmony score
```

---

## Stats System

| Stat | Color | Description |
|:---:|:---:|:---|
| Wisdom | #A855F7 | Knowledge from exploration and discovery |
| Vitality | #22C55E | Life force from consistent practice |
| Resonance | #3B82F6 | Harmonic alignment with cosmic frequencies |

Each game maps these to game-specific actions via `stat_mapping` during registration.

---

## Rarity Tiers

| Tier | Weight | Dust | XP | Color |
|:---:|:---:|:---:|:---:|:---:|
| Common | 50 | 5 | 10 | #9CA3AF |
| Uncommon | 25 | 15 | 25 | #22C55E |
| Rare | 15 | 35 | 50 | #3B82F6 |
| Epic | 7 | 75 | 100 | #A855F7 |
| Legendary | 2.5 | 150 | 200 | #FCD34D |
| Mythic | 0.5 | 500 | 500 | #EF4444 |

Use `roll_loot(rarity_modifiers, seed)` from `game_core` to roll against these.

---

## File Map

```
Backend:
  /routes/game_core.py          ← Universal Controller (XP, stats, currencies, loot, bridge)
  /routes/rock_hounding.py      ← Module: Rock Hounding (biomes, specimens, mining)
  /routes/[next_game].py        ← Module: Next game (use template above)

Frontend:
  /hooks/useGameController.js   ← Universal Controller hook
  /components/game/GameModuleWrapper.js  ← Visual wrapper
  /pages/RockHounding.js        ← Module: Rock Hounding UI
  /pages/[NextGame].js          ← Module: Next game UI
```
