"""
Chatbot NLP utilities — entity extraction, intent classification, and context helpers.
"""

import re
from typing import Dict, List, Optional, Set, Tuple

from backend.services.alert_service import get_all_alerts, get_risk_zones, get_ship_risk
from backend.services.dashboard_service import get_dashboard_summary
from backend.services.inventory_service import get_inventory, get_low_stock
from backend.services.ship_service import get_all_live_ships, get_ship, ships
from backend.services.signal_service import get_all_ship_signals, get_ship_signal
from backend.services.tracking_service import get_all_shipments, get_shipment, shipments

# ============================================================================
# Constants
# ============================================================================

SHIPMENT_TO_SHIP: Dict[str, str] = {
    "SH101": "S12",
    "SH102": "S15",
}

KNOWN_LOCATIONS: Set[str] = {
    "chennai",
    "mumbai",
    "singapore",
    "dubai",
}

# Intent keywords — each intent maps to trigger phrases.
# Order matters: more specific intents should appear earlier.
INTENT_PATTERNS: Dict[str, List[str]] = {
    "delay_status": [
        "delayed", "delay", "hold", "stuck", "behind schedule",
        "behind", "late", "overdue", "waiting",
    ],
    "low_stock": [
        "low stock", "reorder", "out of stock", "stockout", "stock out",
        "insufficient stock", "shortage", "running low",
    ],
    "ship_risk": [
        "risk", "dangerous", "danger", "hazard", "threat",
        "unsafe", "piracy", "storm zone",
    ],
    "route_optimization": [
        "optimize route", "best route", "improve route", "route optimization",
        "optimize", "reroute", "shortest path", "fastest route",
    ],
    "tracking": [
        "track", "where is", "location", "position", "find shipment",
        "where", "locate",
    ],
    "signal_status": [
        "signal", "communication", "contact status", "ais signal",
        "radio", "connectivity",
    ],
    "alerts": [
        "alert", "warning", "notification", "alarm",
    ],
    "inventory_status": [
        "inventory", "stock level", "warehouse stock",
    ],
    "summary": [
        "summary", "overview", "today", "happening", "what is going on",
        "status report", "dashboard", "issues", "problems",
        "what should i know", "brief me", "sitrep",
    ],
    "corrective_action": [
        "fix", "solve", "resolve", "action", "recommend", "suggestion",
        "how to fix", "what should we do", "what can we do",
        "how do we handle", "how can we",
    ],
    "reasoning": [
        "why", "reason", "cause", "because", "explain why",
    ],
}


# ============================================================================
# Text normalisation
# ============================================================================


def normalize_text(text: str) -> str:
    """Lowercase, collapse whitespace, strip punctuation-clusters."""
    return re.sub(r"\s+", " ", text.strip()).lower()


# ============================================================================
# Entity extraction
# ============================================================================


def extract_shipment_id(text: str) -> Optional[str]:
    """Extract a shipment ID like SH101, SH102, etc."""
    match = re.search(r"\bSH\d+\b", text.upper())
    return match.group(0) if match else None


def extract_ship_id(text: str) -> Optional[str]:
    """Extract a ship ID like S12, S15, etc. Avoids matching SH-prefixed IDs."""
    match = re.search(r"\b(?<!H)S(\d+)\b", text.upper())
    if match:
        return f"S{match.group(1)}"
    return None


def extract_locations(text: str) -> List[str]:
    """Return known location names found in the query, title-cased."""
    lowered = normalize_text(text)
    return sorted(
        loc.title() for loc in KNOWN_LOCATIONS if loc in lowered
    )


# ============================================================================
# Intent detection
# ============================================================================


def detect_intents(message: str) -> List[str]:
    """
    Detect *all* intents contained in a single user message.
    Returns a de-duplicated list in priority order.
    """
    text = normalize_text(message)
    found: List[str] = []

    for intent, triggers in INTENT_PATTERNS.items():
        if any(trigger in text for trigger in triggers):
            found.append(intent)

    # Question-prefix heuristics
    if text.startswith("why") and "reasoning" not in found:
        found.insert(0, "reasoning")
    if text.startswith("how") and "corrective_action" not in found:
        if any(w in text for w in ["fix", "solve", "handle", "resolve"]):
            found.insert(0, "corrective_action")

    # Deduplicate while preserving order
    seen: set = set()
    unique = [x for x in found if not (x in seen or seen.add(x))]

    return unique if unique else ["summary"]


# ============================================================================
# Entity helpers
# ============================================================================


def get_known_entities() -> Dict[str, List[str]]:
    """Return all known entity IDs for lookups."""
    shipment_locs: List[str] = []
    for s in shipments.values():
        shipment_locs.extend([s["source"], s["destination"]])

    return {
        "shipments": sorted(shipments.keys()),
        "ships": sorted(ships.keys()),
        "locations": sorted(
            set(shipment_locs + [loc.title() for loc in KNOWN_LOCATIONS])
        ),
    }


def resolve_ship_for_query(
    ship_id: Optional[str],
    shipment_id: Optional[str],
) -> Optional[str]:
    """Resolve a ship ID from either a direct ship ID or a linked shipment."""
    if ship_id and get_ship(ship_id):
        return ship_id
    if shipment_id:
        linked = SHIPMENT_TO_SHIP.get(shipment_id)
        if linked and get_ship(linked):
            return linked
    return None


# ============================================================================
# Data retrieval helpers
# ============================================================================


def find_shipment(shipment_id: str):
    return get_shipment(shipment_id) if shipment_id else None


def find_ship(ship_id: str):
    return get_ship(ship_id) if ship_id else None


def find_signal(ship_id: str):
    return get_ship_signal(ship_id) if ship_id else None


def find_risk(ship_id: str):
    return get_ship_risk(ship_id) if ship_id else None


# ============================================================================
# LLM context builder
# ============================================================================


def build_llm_context() -> str:
    """Build a compact operational context string for the LLM."""
    return (
        f"Active Shipments: {get_all_shipments()}\n"
        f"Live Ships: {get_all_live_ships()}\n"
        f"Inventory: {get_inventory()}\n"
        f"Low Stock Items: {get_low_stock()}\n"
        f"Risk Zones: {get_risk_zones()}\n"
        f"Active Alerts: {get_all_alerts()}\n"
        f"Ship Signals: {get_all_ship_signals()}\n"
        f"Dashboard Summary: {get_dashboard_summary()}\n"
    )
