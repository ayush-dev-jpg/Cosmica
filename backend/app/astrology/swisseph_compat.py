"""
Lazy swisseph compatibility layer.
Import this instead of swisseph directly.
"""
try:
    import swisseph as swe
    SWE_AVAILABLE = True
except ImportError:
    swe = None
    SWE_AVAILABLE = False
