"""
Sovereign Armor - PGP ASCII Armor Wrapping Utilities
Provides formal armoring for encrypted payloads.
"""

ARMOR_VERSIONS = {
    "default": "SovereignRefractor v2.0",
    "rainbow": "SovereignRefractor v2.0 (Rainbow Edition)",
    "violet": "SovereignRefractor v2.0 (Violet Resonance)",
    "spectrum": "SovereignRefractor v2.0 (Full Spectrum)",
}

SPECTRUM_MARKERS = {
    "red": "RED_BARRIER_ACTIVE",
    "orange": "ORANGE_FREQUENCY_LOCKED",
    "yellow": "YELLOW_CORE_STABILIZED",
    "green": "GREEN_CHANNEL_OPEN",
    "blue": "BLUE_RESONANCE_ALIGNED",
    "indigo": "INDIGO_DEPTH_REACHED",
    "violet": "SPECTRUM_DATA_LOCKED_IN_VIOLET_RESONANCE",
}


def armor_payload(data_base64: str, label: str = "MESSAGE", version: str = "default", spectrum: str = None) -> str:
    """
    Wraps raw base64 data in formal PGP ASCII Armor.
    
    Args:
        data_base64: Base64-encoded data
        label: PGP block type (MESSAGE, PUBLIC KEY BLOCK, etc.)
        version: Armor version key (default, rainbow, violet, spectrum)
        spectrum: Optional spectrum marker (red, orange, yellow, green, blue, indigo, violet)
        
    Returns:
        PGP ASCII-armored string
    """
    header = f"-----BEGIN PGP {label}-----\n"
    footer = f"\n-----END PGP {label}-----"
    
    ver = ARMOR_VERSIONS.get(version, ARMOR_VERSIONS["default"])
    meta = f"Version: {ver}\nComment: ENLIGHTEN.MINT.CAFE Barrier Protocol\n"
    
    if spectrum and spectrum in SPECTRUM_MARKERS:
        meta += f"Spectrum: [{SPECTRUM_MARKERS[spectrum]}]\n"
    
    meta += "\n"
    
    # Wrap base64 at 64 characters per line (PGP standard)
    wrapped = '\n'.join([data_base64[i:i+64] for i in range(0, len(data_base64), 64)])
    
    # Add checksum line (PGP standard format)
    checksum = "=R4iN"  # Rainbow signature
    
    return f"{header}{meta}{wrapped}\n{checksum}{footer}"


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
        elif line.startswith('Version:') or line.startswith('Comment:') or line.startswith('Spectrum:') or line == '':
            if not in_data:
                continue
        elif line.startswith('='):  # Checksum line
            continue
        else:
            in_data = True
            data_lines.append(line)
    
    return ''.join(data_lines)


def armor_full_artifact(email_body: dict, version: str = "rainbow", spectrum: str = "violet") -> dict:
    """
    Armors a complete email artifact with all components.
    
    Args:
        email_body: Dict with p (payload), k (key), n (nonce), t (tag)
        version: Armor version (default, rainbow, violet, spectrum)
        spectrum: Spectrum marker (red, orange, yellow, green, blue, indigo, violet)
        
    Returns:
        Armored artifact dict
    """
    return {
        "shielded_data": armor_payload(email_body.get('p', email_body.get('payload', '')), "MESSAGE", version, spectrum),
        "barrier_key": armor_payload(email_body.get('k', email_body.get('barrier_key', '')), "SESSION KEY", version),
        "nonce": armor_payload(email_body.get('n', email_body.get('nonce', '')), "NONCE", version),
        "auth_tag": armor_payload(email_body.get('t', email_body.get('auth_tag', email_body.get('tag', ''))), "AUTH TAG", version)
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
