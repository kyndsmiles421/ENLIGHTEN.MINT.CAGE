from fastapi import APIRouter, Depends, HTTPException
from deps import db, get_current_user
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/broker", tags=["AI Broker — Trade Circle Gatekeeper"])

# ─── Broker Constants ───
HARMONY_COMMERCE_FEE = 2   # 2% on all trades
DUST_TO_GEM_RATIO = 100
RETURN_TAX_PERCENT = 30
SOVEREIGN_ADMIN_ID = "sovereign_master"


async def _get_wallet(user_id):
    """Retrieve a user's vault wallet (created by Central Bank)."""
    wallet = await db.hub_wallets.find_one({"user_id": user_id}, {"_id": 0})
    if not wallet:
        from routes.central_bank import get_or_create_vault_wallet
        wallet = await get_or_create_vault_wallet(user_id)
    return wallet


async def _get_reserve():
    """Retrieve the Central Bank reserve vault."""
    from routes.central_bank import get_reserve_vault
    return await get_reserve_vault()


async def _run_quad_scan(initiator_id, target_id):
    """Run the H² recursive 2-pass Quad-Scan through the matrix engine.
    
    Pass 1 (Proposal): Does the trade align with fundamental 24-line rules?
    Pass 2 (Impact): How does this trade change the vibration of the other 23 lines?
    Final Key: Determinant must be positive (trade adds value, not extracts).
    """
    from routes.quad_hexagram import (
        detect_phase, resolve_security, resolve_finance, resolve_evolution,
        resolve_location, compute_h2_matrix, compute_matrix_determinant_proxy,
        compute_cross_cluster_resonance, compute_matrix_density,
        compute_variable_return_tax, apply_cross_cluster_effects,
    )

    phase = await detect_phase(initiator_id)

    # Resolve full state vectors for both users
    i_sec = await resolve_security(initiator_id, phase)
    i_loc = await resolve_location(initiator_id)
    i_fin = await resolve_finance(initiator_id)
    i_evo = await resolve_evolution(initiator_id)

    t_sec = await resolve_security(target_id, phase)
    t_loc = await resolve_location(target_id)
    t_fin = await resolve_finance(target_id)
    t_evo = await resolve_evolution(target_id)

    i_vector = i_sec + i_loc + i_fin + i_evo
    t_vector = t_sec + t_loc + t_fin + t_evo

    # ─── Pass 1: Fundamental Rule Check ───
    sec_total = sum(i_sec) + sum(t_sec)
    fin_total = sum(i_fin) + sum(t_fin)
    sec_pass = sec_total >= 8
    fin_pass = fin_total >= 4
    pass1_cleared = sec_pass and fin_pass

    # ─── Pass 2: Impact Analysis via H² Matrix ───
    # Compute combined state vector (OR of both users' lines = maximum potential)
    combined_vector = [max(i_vector[k], t_vector[k]) for k in range(24)]
    matrix = compute_h2_matrix(combined_vector, phase)
    determinant = compute_matrix_determinant_proxy(matrix, combined_vector)
    density = compute_matrix_density(matrix)
    resonance = compute_cross_cluster_resonance(matrix)
    variable_tax = compute_variable_return_tax(matrix)
    effects = apply_cross_cluster_effects(combined_vector, resonance)

    # Determinant check: positive = adds value, negative = extracts
    determinant_positive = determinant > 0
    pass2_cleared = determinant_positive

    # Evolution exit risk
    evo_exit_risk = sum(i_evo[4:6]) < 2

    return {
        "cleared": pass1_cleared and pass2_cleared,
        "phase": phase,
        "pass1": {
            "cleared": pass1_cleared,
            "security_pass": sec_pass,
            "finance_pass": fin_pass,
            "security_combined": sec_total,
            "finance_combined": fin_total,
        },
        "pass2": {
            "cleared": pass2_cleared,
            "determinant": determinant,
            "determinant_positive": determinant_positive,
            "matrix_density": density,
            "cross_cluster_resonance": resonance,
        },
        "variable_return_tax": variable_tax,
        "cross_effects": effects,
        "exit_risk": evo_exit_risk,
        "details": {
            "security_combined": sec_total,
            "finance_combined": fin_total,
            "evolution_exit_lines": i_evo[4:6],
        },
    }


@router.post("/trade")
async def execute_trade(body: dict, user=Depends(get_current_user)):
    """Execute a trade through the AI Broker at the Trade Circle.
    
    Flow:
    1. Broker receives trade request
    2. Runs 24-line Hexagram Quad-Scan
    3. Holds assets in escrow during validation
    4. Deducts 2% Harmony Commerce Fee
    5. If Evolution lines detect high-exit, triggers 30% Return Tax
    6. Central Bank records the permanent ledger entry
    """
    target_user_id = body.get("target_user_id")
    currency = body.get("currency", "dust")
    amount = body.get("amount", 0)
    trade_type = body.get("trade_type", "transfer")  # noqa: F841

    if not target_user_id:
        raise HTTPException(400, "target_user_id required")
    if target_user_id == user["id"]:
        raise HTTPException(400, "Cannot trade with yourself")
    if currency not in ("dust", "gems"):
        raise HTTPException(400, "Currency must be 'dust' or 'gems'")
    if not isinstance(amount, (int, float)) or amount <= 0:
        raise HTTPException(400, "Amount must be positive")

    amount = int(amount)

    # Check frozen state
    config = await db.sovereign_config.find_one({"id": "global"}, {"_id": 0})
    if config and config.get("frozen_transactions"):
        raise HTTPException(423, "Trade Circle frozen by Sovereign")

    # Verify sender balance
    sender_wallet = await _get_wallet(user["id"])
    if sender_wallet[currency] < amount:
        raise HTTPException(402, f"Insufficient {currency}. Have {sender_wallet[currency]}, need {amount}")

    # ─── Step 1: Quad-Scan ───
    scan = await _run_quad_scan(user["id"], target_user_id)
    if not scan["cleared"]:
        return {
            "traded": False,
            "reason": "Quad-Scan failed — hexagram misalignment",
            "scan": scan,
        }

    now = datetime.now(timezone.utc).isoformat()
    trade_id = str(uuid.uuid4())

    # ─── Step 2: Escrow Hold (with H² tensor data) ───
    escrow_doc = {
        "id": trade_id,
        "type": "broker_trade",
        "status": "held",
        "initiator_id": user["id"],
        "target_id": target_user_id,
        "currency": currency,
        "gross_amount": amount,
        "phase_mode": scan["phase"],
        "quad_scan": scan["details"],
        "h2_pass1": scan["pass1"],
        "h2_pass2": scan["pass2"],
        "cross_effects": scan.get("cross_effects"),
        "created_at": now,
    }
    await db.broker_escrow.insert_one(escrow_doc)

    # ─── Step 3: Commerce Fee ───
    commerce_fee = max(1, int(amount * HARMONY_COMMERCE_FEE / 100))

    # ─── Step 4: Variable Exit Tax from H² Matrix ───
    exit_tax = 0
    variable_tax_rate = scan.get("variable_return_tax", RETURN_TAX_PERCENT)
    if scan["exit_risk"]:
        exit_tax = int(amount * variable_tax_rate / 100)

    net_to_receiver = amount - commerce_fee - exit_tax

    # ─── Step 5: Settlement ───
    # Debit sender
    await db.hub_wallets.update_one(
        {"user_id": user["id"]},
        {"$inc": {currency: -amount, f"total_{currency}_spent": amount}},
    )

    # Credit receiver (net of fees)
    await _get_wallet(target_user_id)
    await db.hub_wallets.update_one(
        {"user_id": target_user_id},
        {"$inc": {currency: net_to_receiver, f"total_{currency}_earned": net_to_receiver}},
    )

    # Commerce fee to reserve
    await _get_reserve()
    total_to_reserve = commerce_fee + exit_tax
    await db.hub_wallets.update_one(
        {"user_id": SOVEREIGN_ADMIN_ID},
        {"$inc": {currency: total_to_reserve, f"total_{currency}_earned": total_to_reserve}},
    )

    # ─── Step 6: Ledger Entries ───
    ledger_entries = [
        {"id": str(uuid.uuid4()), "trade_id": trade_id, "user_id": user["id"],
         "type": "trade_out", "currency": currency, "amount": -amount,
         "target": target_user_id, "created_at": now},
        {"id": str(uuid.uuid4()), "trade_id": trade_id, "user_id": target_user_id,
         "type": "trade_in", "currency": currency, "amount": net_to_receiver,
         "source": user["id"], "created_at": now},
        {"id": str(uuid.uuid4()), "trade_id": trade_id, "user_id": SOVEREIGN_ADMIN_ID,
         "type": "commerce_fee", "currency": currency, "amount": commerce_fee,
         "description": f"{HARMONY_COMMERCE_FEE}% Harmony Commerce Loop", "created_at": now},
    ]
    if exit_tax > 0:
        ledger_entries.append({
            "id": str(uuid.uuid4()), "trade_id": trade_id, "user_id": SOVEREIGN_ADMIN_ID,
            "type": "return_tax", "currency": currency, "amount": exit_tax,
            "description": f"{variable_tax_rate}% Return Tax (H² matrix-adjusted)", "created_at": now,
        })
    await db.hub_ledger.insert_many(ledger_entries)

    # Update escrow to completed
    await db.broker_escrow.update_one(
        {"id": trade_id},
        {"$set": {
            "status": "completed",
            "commerce_fee": commerce_fee,
            "exit_tax": exit_tax,
            "net_to_receiver": net_to_receiver,
            "completed_at": now,
        }},
    )

    # ─── Step 7: Central Bank permanent record ───
    await db.central_bank_ledger.insert_one({
        "id": str(uuid.uuid4()),
        "type": "broker_trade",
        "trade_id": trade_id,
        "initiator_id": user["id"],
        "target_id": target_user_id,
        "currency": currency,
        "gross_amount": amount,
        "commerce_fee": commerce_fee,
        "exit_tax": exit_tax,
        "net_to_receiver": net_to_receiver,
        "phase_mode": scan["phase"],
        "created_at": now,
    })

    # Mirror hook
    await db.sovereign_mirror.insert_one({
        "id": str(uuid.uuid4()),
        "type": "broker_trade",
        "trade_id": trade_id,
        "from_id": user["id"],
        "to_id": target_user_id,
        "currency": currency,
        "gross_amount": amount,
        "commerce_fee": commerce_fee,
        "exit_tax": exit_tax,
        "net_to_receiver": net_to_receiver,
        "created_at": now,
    })

    updated = await _get_wallet(user["id"])
    return {
        "traded": True,
        "trade_id": trade_id,
        "currency": currency,
        "gross_amount": amount,
        "commerce_fee": commerce_fee,
        "exit_tax": exit_tax,
        "exit_tax_rate": variable_tax_rate if exit_tax > 0 else 0,
        "net_to_receiver": net_to_receiver,
        "phase_mode": scan["phase"],
        "h2_analysis": {
            "pass1": scan["pass1"]["cleared"],
            "pass2": scan["pass2"]["cleared"],
            "determinant": scan["pass2"]["determinant"],
            "matrix_density": scan["pass2"]["matrix_density"],
            "economy_health": scan.get("cross_effects", {}).get("economy_health", "stable"),
        },
        "sender_balance": {"dust": updated["dust"], "gems": updated["gems"]},
    }


@router.post("/transmute")
async def transmute_dust_to_gems(body: dict, user=Depends(get_current_user)):
    """Broker-mediated transmutation: Convert Cosmic Dust to Celestial Gems.
    Gated by hexagram alignment — user must meet evolutionary requirements."""
    dust_amount = body.get("dust_amount", 0)

    if not isinstance(dust_amount, (int, float)) or dust_amount < DUST_TO_GEM_RATIO:
        raise HTTPException(400, f"Minimum {DUST_TO_GEM_RATIO} Dust required")

    dust_amount = int(dust_amount)
    gems_to_create = dust_amount // DUST_TO_GEM_RATIO
    dust_to_consume = gems_to_create * DUST_TO_GEM_RATIO

    wallet = await _get_wallet(user["id"])
    if wallet["dust"] < dust_to_consume:
        raise HTTPException(402, f"Insufficient Dust. Have {wallet['dust']}, need {dust_to_consume}")

    # Hexagram gate
    state = await db.hexagram_states.find_one({"user_id": user["id"]}, {"_id": 0})
    if state and state.get("alignment_score", 0) < 0.25:
        raise HTTPException(
            403,
            f"Hexagram alignment too low ({state.get('alignment_score', 0):.0%}). "
            "Increase platform presence to transmute."
        )

    now = datetime.now(timezone.utc).isoformat()

    await db.hub_wallets.update_one(
        {"user_id": user["id"]},
        {"$inc": {
            "dust": -dust_to_consume,
            "gems": gems_to_create,
            "total_dust_spent": dust_to_consume,
            "total_gems_earned": gems_to_create,
            "transmutation_count": 1,
        }},
    )

    await db.transmutation_log.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "dust_consumed": dust_to_consume,
        "gems_created": gems_to_create,
        "alignment_at_time": state.get("alignment_score", 0) if state else None,
        "created_at": now,
    })

    await db.hub_ledger.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "type": "transmute",
        "currency": "dust_to_gems",
        "amount": -dust_to_consume,
        "gems_created": gems_to_create,
        "created_at": now,
    })

    # Central Bank permanent record
    await db.central_bank_ledger.insert_one({
        "id": str(uuid.uuid4()),
        "type": "transmutation",
        "user_id": user["id"],
        "dust_consumed": dust_to_consume,
        "gems_created": gems_to_create,
        "created_at": now,
    })

    updated = await _get_wallet(user["id"])
    return {
        "transmuted": True,
        "dust_consumed": dust_to_consume,
        "gems_created": gems_to_create,
        "dust_balance": updated["dust"],
        "gems_balance": updated["gems"],
    }


@router.get("/escrow")
async def get_broker_escrow(user=Depends(get_current_user), skip: int = 0, limit: int = 20):
    """Get all broker escrow contracts."""
    contracts = await db.broker_escrow.find(
        {}, {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.broker_escrow.count_documents({})
    return {"contracts": contracts, "total": total}


@router.get("/scan-preview")
async def scan_preview(body: dict = None, user=Depends(get_current_user)):
    """Preview the H² Quad-Scan for the current user showing trade readiness."""
    from routes.quad_hexagram import (
        detect_phase, resolve_security, resolve_finance, resolve_evolution,
        resolve_location, compute_h2_matrix, compute_matrix_determinant_proxy,
        compute_cross_cluster_resonance, compute_matrix_density,
        compute_variable_return_tax, apply_cross_cluster_effects,
    )

    phase = await detect_phase(user["id"])
    sec = await resolve_security(user["id"], phase)
    loc = await resolve_location(user["id"])
    fin = await resolve_finance(user["id"])
    evo = await resolve_evolution(user["id"])

    state_vector = sec + loc + fin + evo
    matrix = compute_h2_matrix(state_vector, phase)
    density = compute_matrix_density(matrix)
    determinant = compute_matrix_determinant_proxy(matrix, state_vector)
    resonance = compute_cross_cluster_resonance(matrix)
    variable_tax = compute_variable_return_tax(matrix)
    effects = apply_cross_cluster_effects(state_vector, resonance)

    return {
        "phase": phase,
        "security_lines": sec,
        "location_lines": loc,
        "finance_lines": fin,
        "evolution_lines": evo,
        "security_score": sum(sec),
        "finance_score": sum(fin),
        "evolution_score": sum(evo),
        "exit_risk": sum(evo[4:6]) < 2,
        "trade_ready": sum(sec) >= 4 and sum(fin) >= 2,
        "h2_analysis": {
            "matrix_density": density,
            "determinant": determinant,
            "determinant_positive": determinant > 0,
            "variable_return_tax": variable_tax,
            "cross_cluster_resonance": resonance,
            "cross_effects": effects,
        },
    }
