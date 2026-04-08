"""
Sovereign Armor - PGP ASCII Armor Wrapping Utilities
Provides formal armoring for encrypted payloads.
"""

def armor_payload(data_base64: str, label: str = "MESSAGE") -> str:
    """
    Wraps raw base64 data in formal PGP ASCII Armor.
    
    Args:
        data_base64: Base64-encoded data
        label: PGP block type (MESSAGE, PUBLIC KEY BLOCK, etc.)
        
    Returns:
        PGP ASCII-armored string
    """
    header = f"-----BEGIN PGP {label}-----\n"
    footer = f"\n-----END PGP {label}-----"
    meta = "Version: SovereignRefractor v2.0\nComment: ENLIGHTEN.MINT.CAFE Barrier Protocol\n\n"
    
    # Wrap base64 at 64 characters per line (PGP standard)
    wrapped = '\n'.join([data_base64[i:i+64] for i in range(0, len(data_base64), 64)])
    
    return f"{header}{meta}{wrapped}{footer}"


def unarmor_payload(armored: str) -> str:
    """
    Extracts raw base64 data from PGP ASCII Armor.
    
    Args:
        armored: PGP ASCII-armored string
        
    Returns:
        Raw base64-encoded data
    """
    lines = armored.strip().split('\n')
    data_lines = []
    in_data = False
    
    for line in lines:
        if line.startswith('-----BEGIN'):
            continue
        elif line.startswith('-----END'):
            break
        elif line.startswith('Version:') or line.startswith('Comment:') or line == '':
            if not in_data:
                continue
        else:
            in_data = True
            data_lines.append(line)
    
    return ''.join(data_lines)


def armor_full_artifact(email_body: dict) -> dict:
    """
    Armors a complete email artifact with all components.
    
    Args:
        email_body: Dict with p (payload), k (key), n (nonce), t (tag)
        
    Returns:
        Armored artifact dict
    """
    return {
        "shielded_data": armor_payload(email_body.get('p', email_body.get('payload', '')), "MESSAGE"),
        "barrier_key": armor_payload(email_body.get('k', email_body.get('barrier_key', '')), "SESSION KEY"),
        "nonce": armor_payload(email_body.get('n', email_body.get('nonce', '')), "NONCE"),
        "auth_tag": armor_payload(email_body.get('t', email_body.get('auth_tag', email_body.get('tag', ''))), "AUTH TAG")
    }


def unarmor_full_artifact(armored_artifact: dict) -> dict:
    """
    Extracts raw base64 data from an armored artifact.
    
    Args:
        armored_artifact: Dict with armored components
        
    Returns:
        Raw base64 artifact dict
    """
    return {
        "p": unarmor_payload(armored_artifact.get('shielded_data', '')),
        "k": unarmor_payload(armored_artifact.get('barrier_key', '')),
        "n": unarmor_payload(armored_artifact.get('nonce', '')),
        "t": unarmor_payload(armored_artifact.get('auth_tag', ''))
    }
