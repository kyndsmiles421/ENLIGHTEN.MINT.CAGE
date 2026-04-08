"""
ENLIGHTEN.MINT.CAFE - MASTER DEPLOYMENT SCRIPT (PHASE 2)
Location: Rapid City Dev Node
Protocol: Crystal Seal / Sovereign Engine
"""

import os
import hashlib
import subprocess
import sys
from typing import Dict, Any, Callable, Optional
from pathlib import Path
from functools import lru_cache

# --- I. THE VAULT (Environment & Config) ---
class SovereignVault:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        self._initialized = True
        self.SECRET_KEY = os.getenv("SOVEREIGN_KEY", os.getenv("JWT_SECRET", ""))
        self.CRYSTAL_SALT = os.getenv("CRYSTAL_SALT", "refracted_2026")
        self.DB_URL = os.getenv("MONGO_URL", "")
        self.EMERGENT_KEY = os.getenv("EMERGENT_LLM_KEY", "")

    def verify_integrity(self) -> tuple[bool, list[str]]:
        """Verify all critical environment variables are present."""
        errors = []
        if not self.SECRET_KEY:
            errors.append("SOVEREIGN_KEY/JWT_SECRET missing")
        if not self.DB_URL:
            errors.append("MONGO_URL missing")
        return len(errors) == 0, errors

    @property
    def is_production(self) -> bool:
        return os.getenv("ENVIRONMENT", "development") == "production"


# --- II. CRYSTAL SEAL CORE (Encryption & Sanitization) ---
class CrystalSeal:
    """Centralized security primitives for the Sovereign Engine."""
    
    @staticmethod
    def secure_hash(data: str) -> str:
        """Standardized SHA-256 replacing legacy MD5."""
        return hashlib.sha256(data.encode()).hexdigest()

    @staticmethod
    def secure_hash_short(data: str, length: int = 12) -> str:
        """Truncated hash for cache keys and UI IDs."""
        return hashlib.sha256(data.encode()).hexdigest()[:length]

    @staticmethod
    def secure_hash_salted(data: str, salt: Optional[str] = None) -> str:
        """Salted SHA-256 for sensitive data."""
        vault = SovereignVault()
        actual_salt = salt or vault.CRYSTAL_SALT
        return hashlib.sha256(f"{actual_salt}:{data}".encode()).hexdigest()

    @staticmethod
    def sanitize_input(value: str, max_length: int = 1000) -> str:
        """Prevents eval/exec injection via character stripping."""
        if not isinstance(value, str):
            value = str(value)
        
        value = value[:max_length]
        
        forbidden = [
            ";", "eval", "exec", "import", "__import__",
            "getattr", "setattr", "delattr", "globals", "locals",
            "compile", "open", "file", "input", "raw_input"
        ]
        for keyword in forbidden:
            value = value.replace(keyword, "")
        
        return value.strip()

    @staticmethod
    def sanitize_dict(data: Dict[str, Any]) -> Dict[str, str]:
        """Sanitize all string values in a dictionary."""
        return {k: CrystalSeal.sanitize_input(str(v)) for k, v in data.items()}

    @staticmethod
    def verify_signature(data: str, signature: str) -> bool:
        """Verify a data signature matches."""
        expected = CrystalSeal.secure_hash(data)
        return signature == expected

    @staticmethod
    def generate_signature(data: str) -> str:
        """Generate a signature for data integrity verification."""
        return CrystalSeal.secure_hash(data)


# --- III. LOGIC GATE (Safe Execution - replaces eval()) ---
class LogicGate:
    """Safe mapping to replace eval() calls with controlled execution."""
    
    FUNCTIONS: Dict[str, Callable] = {
        # Frequency operations
        "freq_shift": lambda x: float(x) * 1.059,
        "solfeggio_check": lambda hz: hz in [174, 285, 396, 432, 528, 639, 741, 852, 963],
        "schumann_harmonic": lambda n: 7.83 * n,
        
        # Math operations
        "phi_scale": lambda x: float(x) * 1.618033988749895,
        "sacred_multiply": lambda x, y: x * y,
        "consciousness_level": lambda xp: int((xp / 100) ** 0.5) + 1,
        
        # String operations
        "truncate": lambda s, n=100: str(s)[:n],
        "hash_id": lambda s: CrystalSeal.secure_hash_short(str(s)),
    }

    @classmethod
    def register(cls, name: str, func: Callable):
        """Register a new safe function."""
        cls.FUNCTIONS[name] = func

    @classmethod
    def run(cls, action: str, *args, **kwargs) -> Any:
        """Execute a registered function safely."""
        clean_action = CrystalSeal.sanitize_input(action)
        func = cls.FUNCTIONS.get(clean_action)
        if not func:
            raise PermissionError(f"LogicGate: '{clean_action}' is not authorized.")
        return func(*args, **kwargs)

    @classmethod
    def available_actions(cls) -> list[str]:
        """List all available actions."""
        return list(cls.FUNCTIONS.keys())


# --- IV. CACHE MIGRATION HELPER ---
class CacheMigration:
    """Handles migration from MD5 to SHA-256 cache keys."""
    
    # Flag file to track migration status
    MIGRATION_FLAG = Path("/tmp/.crystal_cache_migrated")
    
    @classmethod
    def needs_refresh(cls) -> bool:
        """Check if cache refresh is needed after migration."""
        return not cls.MIGRATION_FLAG.exists()
    
    @classmethod
    def mark_complete(cls):
        """Mark cache migration as complete."""
        cls.MIGRATION_FLAG.touch()
    
    @staticmethod
    def migrate_key(old_key: str) -> str:
        """Generate new SHA-256 based key from old pattern."""
        return CrystalSeal.secure_hash_short(old_key)


# --- V. AUDIT ENGINE ---
class SovereignAudit:
    """Security audit utilities."""
    
    @staticmethod
    def scan_md5_usage(base_path: str = "/app/backend") -> list[str]:
        """Scan for legacy MD5 usage."""
        result = subprocess.run(
            ["grep", "-rn", "hashlib.md5", base_path, "--include=*.py"],
            capture_output=True, text=True
        )
        if result.stdout:
            return result.stdout.strip().split('\n')
        return []

    @staticmethod
    def scan_hardcoded_secrets(base_path: str = "/app/backend") -> list[str]:
        """Scan for hardcoded API keys and secrets."""
        patterns = ["sk-", "api_key.*=.*['\"]sk", "password.*=.*['\"]"]
        findings = []
        for pattern in patterns:
            result = subprocess.run(
                ["grep", "-rn", pattern, base_path, "--include=*.py"],
                capture_output=True, text=True
            )
            if result.stdout:
                findings.extend(result.stdout.strip().split('\n'))
        return findings

    @staticmethod
    def scan_eval_usage(base_path: str = "/app/backend") -> list[str]:
        """Scan for dangerous eval/exec usage."""
        result = subprocess.run(
            ["grep", "-rn", "-E", r"eval\(|exec\(", base_path, "--include=*.py"],
            capture_output=True, text=True
        )
        if result.stdout:
            # Filter out comments and string literals
            lines = result.stdout.strip().split('\n')
            return [line for line in lines if "# " not in line.split("eval")[0].split("exec")[0]]
        return []

    @classmethod
    def run_full_audit(cls) -> Dict[str, Any]:
        """Run complete security audit."""
        print("💎 Running Crystal Seal Sovereign Audit...")
        
        md5_issues = cls.scan_md5_usage()
        secret_issues = cls.scan_hardcoded_secrets()
        eval_issues = cls.scan_eval_usage()
        
        vault = SovereignVault()
        integrity_ok, integrity_errors = vault.verify_integrity()
        
        report = {
            "md5_legacy_count": len(md5_issues),
            "md5_locations": md5_issues[:10],  # First 10
            "hardcoded_secrets_count": len(secret_issues),
            "eval_usage_count": len(eval_issues),
            "vault_integrity": integrity_ok,
            "vault_errors": integrity_errors,
            "status": "CLEAN" if all([
                len(md5_issues) == 0,
                len(secret_issues) == 0,
                len(eval_issues) == 0,
                integrity_ok
            ]) else "NEEDS_ATTENTION"
        }
        
        if report["status"] == "CLEAN":
            print("✅ Codebase is clean, refracted, and secure.")
        else:
            print(f"⚠️  Audit found {len(md5_issues)} MD5, {len(secret_issues)} secrets, {len(eval_issues)} eval issues")
        
        return report


# --- SINGLETON INSTANCES ---
vault = SovereignVault()
seal = CrystalSeal()
gate = LogicGate()
audit = SovereignAudit()

# --- EXPORTS ---
__all__ = [
    'SovereignVault',
    'CrystalSeal', 
    'LogicGate',
    'CacheMigration',
    'SovereignAudit',
    'vault',
    'seal',
    'gate',
    'audit',
]


# --- EXECUTION ---
if __name__ == "__main__":
    print("🔮 Sovereign Engine: INITIALIZING...")
    
    ok, errors = vault.verify_integrity()
    if ok:
        print("✅ Sovereign Engine: ONLINE")
    else:
        print(f"⚠️  Vault integrity issues: {errors}")
    
    # Run audit
    report = audit.run_full_audit()
    print(f"\n📊 Audit Report: {report['status']}")
