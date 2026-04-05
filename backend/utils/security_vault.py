"""
THE SECURITY VAULT - Backend Encryption Module
Version: 2.88_SHAMBHALA
Logic: AES-256-CBC Encryption for Sovereign Data Protection

THE MASTER KEY: 256-bit (32 bytes)
This is the "back side" key. It should stay in an environment variable (.env)
and NEVER be sent to the front-end browser.
"""

import os
import secrets
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend

# Load encryption key from environment or use default (CHANGE IN PRODUCTION)
ENCRYPTION_KEY_HEX = os.environ.get(
    'ENCRYPTION_KEY',
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
)
ENCRYPTION_KEY = bytes.fromhex(ENCRYPTION_KEY_HEX)
IV_LENGTH = 16  # For AES, this is always 16 bytes


class BackEndVault:
    """
    AES-256-CBC Encryption Vault
    - protect(): Encrypts data for storage
    - recover(): Decrypts data for internal processing
    """
    
    @staticmethod
    def protect(text: str) -> str:
        """
        Encrypts data using AES-256-CBC
        Returns: IV:EncryptedData (hex encoded)
        """
        # Generate random IV
        iv = secrets.token_bytes(IV_LENGTH)
        
        # Pad text to block size (16 bytes for AES)
        text_bytes = text.encode('utf-8')
        padding_length = 16 - (len(text_bytes) % 16)
        padded_text = text_bytes + bytes([padding_length] * padding_length)
        
        # Create cipher and encrypt
        cipher = Cipher(
            algorithms.AES(ENCRYPTION_KEY),
            modes.CBC(iv),
            backend=default_backend()
        )
        encryptor = cipher.encryptor()
        encrypted = encryptor.update(padded_text) + encryptor.finalize()
        
        # Returns the IV + Encrypted data so the front end can identify the packet
        return iv.hex() + ':' + encrypted.hex()
    
    @staticmethod
    def recover(encrypted_text: str) -> str:
        """
        Decrypts data for internal processing
        """
        # Split IV and encrypted data
        parts = encrypted_text.split(':')
        iv = bytes.fromhex(parts[0])
        encrypted_data = bytes.fromhex(':'.join(parts[1:]))
        
        # Create cipher and decrypt
        cipher = Cipher(
            algorithms.AES(ENCRYPTION_KEY),
            modes.CBC(iv),
            backend=default_backend()
        )
        decryptor = cipher.decryptor()
        decrypted_padded = decryptor.update(encrypted_data) + decryptor.finalize()
        
        # Remove PKCS7 padding
        padding_length = decrypted_padded[-1]
        decrypted = decrypted_padded[:-padding_length]
        
        return decrypted.decode('utf-8')
    
    @staticmethod
    def generate_key() -> str:
        """
        Generates a new 256-bit encryption key
        Use this to create a new key for production
        """
        return secrets.token_hex(32)
    
    @staticmethod
    def hash_identity(identity: str) -> str:
        """
        Creates a SHA-256 hash of an identity string
        Useful for creating unique identifiers without exposing raw data
        """
        import hashlib
        return hashlib.sha256(identity.encode('utf-8')).hexdigest()


# Singleton instance
vault = BackEndVault()

# Startup log
print("[VAULT] Security Vault Active: AES-256-CBC Encryption Key Loaded on the Back Side.")


# FastAPI route integration helper
def encrypt_response(data: dict) -> dict:
    """
    Encrypts sensitive fields in a response dictionary
    """
    import json
    encrypted = vault.protect(json.dumps(data))
    return {"encrypted": True, "payload": encrypted}


def decrypt_request(encrypted_payload: str) -> dict:
    """
    Decrypts an incoming encrypted payload
    """
    import json
    decrypted = vault.recover(encrypted_payload)
    return json.loads(decrypted)


# Export
__all__ = ['vault', 'BackEndVault', 'encrypt_response', 'decrypt_request']
