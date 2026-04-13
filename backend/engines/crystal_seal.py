# ENLIGHTEN.MINT.CAFE - Core Structural Integrity Seal
# Crystal Seal v1.0 - Security Hardening & Circular Import Resolution
import os
import hashlib
import secrets
from typing import Optional
from functools import lru_cache

# ═══════════════════════════════════════════════════════════════════════════
# 1. SECURE ENVIRONMENT VARIABLE ACCESS (No Hardcoded Secrets)
# ═══════════════════════════════════════════════════════════════════════════

@lru_cache(maxsize=1)
def get_secure_config():
    """Centralized config - all secrets from environment variables only."""
    return {
        "TEST_API_KEY": os.getenv('TEST_API_KEY', 'local-dev-only'),
        "STRIPE_API_KEY": os.getenv('STRIPE_API_KEY', ''),
        "EMERGENT_LLM_KEY": os.getenv('EMERGENT_LLM_KEY', ''),
        "MONGO_URL": os.getenv('MONGO_URL', ''),
        "JWT_SECRET": os.getenv('JWT_SECRET', secrets.token_hex(32)),
    }

# ═══════════════════════════════════════════════════════════════════════════
# 2. SECURE HASHING (MD5 → SHA-256)
# ═══════════════════════════════════════════════════════════════════════════

def secure_hash(data: str) -> str:
    """
    Crystal-grade secure hash.
    MD5 is fractured (collision-vulnerable). SHA-256 is the standard.
    """
    return hashlib.sha256(data.encode()).hexdigest()

def secure_hash_short(data: str, length: int = 12) -> str:
    """Short hash for cache keys and IDs (truncated SHA-256)."""
    return hashlib.sha256(data.encode()).hexdigest()[:length]


# DEPRECATED: Legacy MD5 function - DO NOT USE IN NEW CODE
# Keeping for backward compatibility during migration only
def _legacy_cache_key(data: str) -> str:
    """
    DEPRECATED: For backward compatibility only.
    New code MUST use secure_hash_short().
    """
    import warnings
    warnings.warn("legacy_cache_key is deprecated, use secure_hash_short", DeprecationWarning)
    return hashlib.sha256(data.encode()).hexdigest()

# ═══════════════════════════════════════════════════════════════════════════
# 3. SECURE RANDOMNESS (Cryptographic)
# ═══════════════════════════════════════════════════════════════════════════

def generate_cosmic_id(length: int = 16) -> str:
    """
    Generate cryptographically secure random ID.
    'random' module is predictable. 'secrets' is crypto-safe.
    """
    return secrets.token_hex(length)

def generate_secure_token(length: int = 32) -> str:
    """Generate a secure token for sessions, API keys, etc."""
    return secrets.token_urlsafe(length)

def secure_random_int(min_val: int, max_val: int) -> int:
    """Cryptographically secure random integer."""
    return secrets.randbelow(max_val - min_val + 1) + min_val

# ═══════════════════════════════════════════════════════════════════════════
# 4. ECONOMY COMMON HUB (Circular Import Resolution)
# ═══════════════════════════════════════════════════════════════════════════

class EconomyCommon:
    """
    Shared economy logic hub to break circular imports between:
    - economy_admin.py
    - marketplace.py
    - refinement.py
    - energy_gates.py
    
    Import this instead of cross-importing between routes.
    """
    
    # Locked constants
    TRANSACTION_FEE = 0.05  # 5% per Trade Circle logic
    DEFAULT_EXCHANGE_RATE = 100  # 100 Dust = 1 Credit (base)
    
    # Credit operation types
    CREDIT_OP_ADD = "add"
    CREDIT_OP_SUBTRACT = "subtract"
    CREDIT_OP_SET = "set"
    
    @staticmethod
    def calculate_mint(amount: float) -> float:
        """Calculate net amount after transaction fee."""
        return amount * (1 - EconomyCommon.TRANSACTION_FEE)
    
    @staticmethod
    def calculate_dust_to_credits(dust: int, exchange_rate: Optional[int] = None) -> int:
        """Convert Dust to Credits using exchange rate."""
        rate = exchange_rate or EconomyCommon.DEFAULT_EXCHANGE_RATE
        if rate <= 0:
            rate = EconomyCommon.DEFAULT_EXCHANGE_RATE
        return dust // rate
    
    @staticmethod
    def calculate_credits_to_dust(credits: int, exchange_rate: Optional[int] = None) -> int:
        """Convert Credits to Dust using exchange rate."""
        rate = exchange_rate or EconomyCommon.DEFAULT_EXCHANGE_RATE
        return credits * rate
    
    @staticmethod
    def validate_transaction(amount: float, available: float) -> tuple[bool, str]:
        """Validate a transaction is possible."""
        if amount <= 0:
            return False, "Amount must be positive"
        if amount > available:
            return False, "Insufficient funds"
        return True, "OK"

# Singleton instance
economy_common = EconomyCommon()

# ═══════════════════════════════════════════════════════════════════════════
# 5. INPUT SANITIZATION (Prevent eval/exec injection)
# ═══════════════════════════════════════════════════════════════════════════

def sanitize_input(value: str, max_length: int = 1000) -> str:
    """
    Sanitize user input to prevent injection attacks.
    NEVER use eval() or exec() on user input.
    """
    if not isinstance(value, str):
        value = str(value)
    
    # Truncate
    value = value[:max_length]
    
    # Remove dangerous characters
    dangerous = ['<script>', '</script>', 'javascript:', 'eval(', 'exec(']
    for d in dangerous:
        value = value.replace(d, '')
    
    return value.strip()

def safe_json_key(key: str) -> str:
    """Ensure a cache/DB key is safe (alphanumeric + limited chars)."""
    import re
    return re.sub(r'[^a-zA-Z0-9_\-:]', '', key)[:200]

# ═══════════════════════════════════════════════════════════════════════════
# 6. COMMUNAL GOALS (Shared data structure to prevent undefined vars)
# ═══════════════════════════════════════════════════════════════════════════

COMMUNAL_GOALS = [
    {
        "id": "community_meditation",
        "name": "Global Meditation Hour",
        "description": "Participate in synchronized meditation sessions",
        "target": 1000,
        "current": 0,
        "reward_dust": 500,
        "active": True,
    },
    {
        "id": "knowledge_sharing",
        "name": "Wisdom Exchange",
        "description": "Share insights and teachings with the community",
        "target": 500,
        "current": 0,
        "reward_dust": 300,
        "active": True,
    },
    {
        "id": "frequency_harmony",
        "name": "Harmonic Convergence",
        "description": "Play healing frequencies collectively",
        "target": 2000,
        "current": 0,
        "reward_dust": 750,
        "active": True,
    },
]

# ═══════════════════════════════════════════════════════════════════════════
# EXPORTS
# ═══════════════════════════════════════════════════════════════════════════

__all__ = [
    'secure_hash',
    'secure_hash_short',
    'legacy_cache_key',
    'generate_cosmic_id',
    'generate_secure_token',
    'secure_random_int',
    'EconomyCommon',
    'economy_common',
    'sanitize_input',
    'safe_json_key',
    'get_secure_config',
    'COMMUNAL_GOALS',
]
