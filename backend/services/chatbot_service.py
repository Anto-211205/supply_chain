"""
AI-powered Supply Chain Operations Assistant — chatbot_service.py

Professional, context-aware chatbot that provides intelligent operational
analysis with actionable recommendations. Uses structured intent detection
with LLM fallback for unmatched queries.
"""

import os
import uuid
from pathlib import Path
from typing import Dict, List, Optional

from dotenv import load_dotenv

from backend.services.ai_service import optimize_route, predict_delay
from backend.services.alert_service import get_all_alerts, get_risk_zones, get_ship_risk
from backend.services.dashboard_service import get_dashboard_summary
from backend.services.inventory_service import get_inventory, get_low_stock
from backend.services.ship_service import get_all_live_ships, get_ship
from backend.services.signal_service import get_all_ship_signals, get_ship_signal
from backend.services.tracking_service import get_all_shipments, get_shipment
from backend.utils.chatbot_utils import (
    SHIPMENT_TO_SHIP,
    build_llm_context,
    detect_intents,
    extract_locations,
    extract_ship_id,
    extract_shipment_id,
    find_risk,
    find_ship,
    find_shipment,
    find_signal,
    get_known_entities,
    normalize_text,
    resolve_ship_for_query,
)

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

# ============================================================================
# Configuration
# ============================================================================

CHATBOT_MODEL = "llama-3.1-8b-instant"

SYSTEM_PROMPT = (
    "You are a professional AI Supply Chain Operations Assistant. "
    "You have deep expertise in maritime logistics, inventory management, "
    "delay mitigation, and risk assessment. "
    "Analyse the operational data provided and respond with clear, concise, "
    "actionable insights. Use bullet points for recommendations. "
    "Never use robotic tags like [ALERT] or [OK]. "
    "Sound like a knowledgeable operations manager briefing a colleague."
)

# In-memory conversation context store (keyed by session_id)
_session_context: Dict[str, Dict] = {}

# ============================================================================
# Response helpers
# ============================================================================


def _ok(
    message: str,
    intents: Optional[List[str]] = None,
    session_id: Optional[str] = None,
) -> Dict:
    """Build a success response envelope."""
    resp: Dict = {"status": "success", "message": message}
    if intents:
        resp["intents_detected"] = intents
    if session_id:
        resp["session_id"] = session_id
    return resp


def _err(message: str) -> Dict:
    """Build an error response envelope."""
    return {"status": "error", "message": message}


def _get_groq_client():
    """Initialise Groq client lazily."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return None, "GROQ_API_KEY not configured"
    try:
        from groq import Groq
        return Groq(api_key=api_key), None
    except Exception as exc:
        return None, str(exc)


# ============================================================================
# Session / context management
# ============================================================================


def _ensure_session(session_id: Optional[str]) -> str:
    """Return an existing or new session id and initialise context."""
    sid = session_id or str(uuid.uuid4())
    if sid not in _session_context:
        _session_context[sid] = {
            "last_shipment_id": None,
            "last_ship_id": None,
            "last_intent": None,
            "last_response": None,
        }
    return sid


def _update_context(sid: str, **kwargs):
    """Merge new values into the session context."""
    ctx = _session_context.setdefault(sid, {})
    ctx.update(kwargs)


def _ctx(sid: str) -> Dict:
    """Get session context."""
    return _session_context.get(sid, {})


# ============================================================================
# Individual intent handlers
# ============================================================================


def _handle_delay(message: str, sid: str) -> Optional[str]:
    """Delayed shipments — specific or all."""
    shipment_id = extract_shipment_id(message) or _ctx(sid).get("last_shipment_id")

    if shipment_id:
        shipment = find_shipment(shipment_id)
        if not shipment:
            return f"Shipment {shipment_id} was not found in the system."

        delay = predict_delay(shipment_id)
        _update_context(sid, last_shipment_id=shipment_id)

        return (
            f"Shipment {shipment_id} is currently **{shipment['status'].lower()}** "
            f"with **{delay['delay_risk'].lower()}** risk. "
            f"Estimated delay is **{delay['expected_delay_hours']} hours** "
            f"due to {delay['reason'].replace('+', ' and ').strip()}.\n\n"
            f"Route: {shipment['source']} → {shipment['destination']}\n\n"
            f"Recommended actions:\n"
            f"• Reroute cargo to an alternate port if the delay exceeds 24 hours\n"
            f"• Notify the destination warehouse and customer of revised ETA\n"
            f"• Prioritise dock unloading slot upon arrival\n"
            f"• Monitor signal status for any route deviations"
        )

    # All delayed shipments
    delayed: List[Dict] = []
    for sid_key in get_known_entities()["shipments"]:
        data = find_shipment(sid_key)
        if data and data["status"].lower() in {"at port", "delayed"}:
            d = predict_delay(sid_key)
            delayed.append({
                "id": sid_key,
                "hours": d["expected_delay_hours"],
                "risk": d["delay_risk"],
                "reason": d["reason"],
                "route": f"{data['source']} → {data['destination']}",
            })

    if not delayed:
        return "Good news — no shipments are currently experiencing delays."

    delayed.sort(key=lambda x: x["hours"], reverse=True)
    lines = [
        f"There {'is' if len(delayed) == 1 else 'are'} "
        f"**{len(delayed)} delayed shipment{'s' if len(delayed) > 1 else ''}** "
        f"requiring attention:\n",
    ]
    for item in delayed:
        lines.append(
            f"• **{item['id']}** — {item['risk']} risk, ~{item['hours']}h delay "
            f"({item['route']}). Cause: {item['reason'].replace('+', ', ')}"
        )

    lines.extend([
        "",
        "Recommended actions:",
        "• Notify destination warehouses of revised ETAs",
        "• Evaluate rerouting options for high-risk shipments",
        "• Prioritise dock allocation for incoming vessels",
    ])
    return "\n".join(lines)


def _handle_low_stock(message: str, sid: str) -> Optional[str]:
    """Low inventory items with priority classification."""
    items = get_low_stock()

    if not items:
        return "All inventory levels are healthy — no products are below reorder thresholds."

    prioritised = []
    for item in items:
        gap = item["reorder_level"] - item["quantity"]
        prio = "CRITICAL" if gap > 10 else "HIGH" if gap > 5 else "MEDIUM"
        prioritised.append({
            "name": item["product_name"],
            "qty": item["quantity"],
            "reorder": item["reorder_level"],
            "gap": gap,
            "priority": prio,
        })
    prioritised.sort(key=lambda x: x["gap"], reverse=True)

    lines = [
        f"**{len(prioritised)} product{'s' if len(prioritised) > 1 else ''}** "
        f"{'are' if len(prioritised) > 1 else 'is'} below reorder level:\n",
    ]
    for p in prioritised:
        lines.append(
            f"• **{p['name']}** [{p['priority']}]: {p['qty']} units on hand, "
            f"need {p['gap']} more to reach reorder point ({p['reorder']})"
        )

    lines.extend([
        "",
        "Recommended actions:",
        "• Place emergency orders for CRITICAL items with primary suppliers",
        "• Expedite shipping for HIGH-priority restocks",
        "• Schedule MEDIUM-priority items in the next procurement cycle",
        "• Review supplier lead times to prevent recurrence",
    ])
    return "\n".join(lines)


def _handle_risk(message: str, sid: str) -> Optional[str]:
    """Ship risk assessment — specific or fleet-wide."""
    ship_id = extract_ship_id(message) or _ctx(sid).get("last_ship_id")

    if ship_id:
        risk = find_risk(ship_id)
        ship = find_ship(ship_id)
        if not risk or not ship:
            return None

        _update_context(sid, last_ship_id=ship_id)

        if risk["risk_level"] == "None":
            return (
                f"{ship['ship_name']} ({ship_id}) is currently in a safe zone "
                f"with no active risk alerts."
            )

        return (
            f"{ship['ship_name']} ({ship_id}) is operating in **{risk['zone']}** "
            f"with **{risk['risk_level'].lower()} risk**.\n\n"
            f"Situation: {risk['alert']}\n\n"
            f"Mitigation steps:\n"
            f"• Alert the crew to maintain heightened operational awareness\n"
            f"• Reduce speed through the risk zone where feasible\n"
            f"• Evaluate alternative routing to bypass the area\n"
            f"• Ensure continuous monitoring and communication with port control\n"
            f"• Verify insurance coverage for the current route"
        )

    # Fleet-wide risk overview
    alerts = get_all_alerts()
    risky = [a for a in alerts if a and a.get("risk_level") != "None"]

    if not risky:
        return "All ships are currently operating in safe zones — no active risk alerts."

    risky.sort(
        key=lambda x: {"High": 0, "Medium": 1, "Low": 2}.get(x["risk_level"], 3)
    )

    lines = [
        f"**{len(risky)} ship{'s' if len(risky) > 1 else ''}** "
        f"in risk zones requiring attention:\n",
    ]
    for a in risky:
        lines.append(
            f"• **{a['ship_id']}**: {a['risk_level']} risk in {a['zone']} — {a['alert']}"
        )

    lines.extend([
        "",
        "Recommended actions:",
        "• Increase monitoring frequency for high-risk vessels",
        "• Consider route diversions where possible",
        "• Notify insurers of elevated exposure",
    ])
    return "\n".join(lines)


def _handle_tracking(message: str, sid: str) -> Optional[str]:
    """Shipment or ship tracking."""
    shipment_id = extract_shipment_id(message) or _ctx(sid).get("last_shipment_id")
    ship_id = extract_ship_id(message) or _ctx(sid).get("last_ship_id")

    if shipment_id:
        shipment = find_shipment(shipment_id)
        if not shipment:
            return None
        _update_context(sid, last_shipment_id=shipment_id)
        return (
            f"**Shipment {shipment_id}** tracking update:\n\n"
            f"Status: {shipment['status']}\n"
            f"Route: {shipment['source']} → {shipment['destination']}\n"
            f"Product: {shipment['product']}\n"
            f"Position: {shipment['lat']}°N, {shipment['lon']}°E\n"
            f"Waypoints: {' → '.join(shipment['route'])}"
        )

    if ship_id:
        ship = find_ship(ship_id)
        if not ship:
            return None
        _update_context(sid, last_ship_id=ship_id)

        signal = find_signal(ship_id)
        lines = [
            f"**{ship['ship_name']}** ({ship_id}) tracking update:\n",
            f"Grid Position: {ship['current_grid']}",
            f"Speed: {ship['speed']}",
            f"Coordinates: {ship['lat']}°N, {ship['lon']}°E",
            f"ETA: {ship['eta']}",
            f"Route: {' → '.join(ship['route'])}",
        ]
        if signal:
            lines.extend([
                "",
                f"Communications: {signal['status']} "
                f"(last signal {signal['last_signal_received']}m ago, "
                f"quality: {signal['signal_quality']})",
            ])
        return "\n".join(lines)

    return None


def _handle_route(message: str, sid: str) -> Optional[str]:
    """Route optimisation analysis."""
    locations = extract_locations(message)
    shipment_id = extract_shipment_id(message) or _ctx(sid).get("last_shipment_id")
    ship_id = extract_ship_id(message) or _ctx(sid).get("last_ship_id")

    from_loc = to_loc = None
    ship_for_route = "S12"

    if shipment_id:
        shipment = find_shipment(shipment_id)
        if not shipment:
            return None
        from_loc = shipment["source"]
        to_loc = shipment["destination"]
        ship_for_route = SHIPMENT_TO_SHIP.get(shipment_id, "S12")
        _update_context(sid, last_shipment_id=shipment_id)
    elif ship_id:
        if len(locations) < 2:
            return None
        from_loc, to_loc = locations[0], locations[-1]
        ship_for_route = ship_id
    elif len(locations) >= 2:
        from_loc, to_loc = locations[0], locations[-1]
    else:
        return None

    route = optimize_route(from_loc, to_loc, ship_for_route)

    return (
        f"**Route Optimisation** — {route['from']} → {route['to']} "
        f"(Ship {route['ship_id']})\n\n"
        f"• Standard duration: {route['old_route_days']} days\n"
        f"• Optimised duration: {route['new_route_days']} days\n"
        f"• Time savings: **{route['saved_time']}**\n\n"
        f"Recommendation: {route['suggestion'].capitalize()}"
    )


def _handle_summary(message: str, sid: str) -> str:
    """Executive operations dashboard summary."""
    summary = get_dashboard_summary()
    alerts = get_all_alerts()
    risky_ships = [a for a in alerts if a and a.get("risk_level") != "None"]
    low_stock = get_low_stock()

    lines = [
        "**Operations Dashboard Summary**\n",
        "Shipments & Delivery:",
        f"• Total active: {summary['total_shipments']} shipments",
        f"• Delayed: {summary['delayed_shipments']}",
        f"• Delivery success rate: {summary['delivery_success_rate']}%",
        "",
        "Maritime Fleet:",
        f"• Ships in transit: {summary['ships_in_transit']}",
        f"• Ships in risk zones: {len(risky_ships)}",
        "",
        "Inventory:",
        f"• Warehouse stock: {summary['warehouse_stock']} units",
        f"• Products below reorder: {len(low_stock)}",
    ]

    # Action items
    action_items: List[str] = []
    for ship in risky_ships[:3]:
        action_items.append(
            f"• Monitor {ship['ship_id']} — {ship['risk_level']} risk in {ship['zone']}"
        )
    for item in low_stock[:3]:
        action_items.append(f"• Reorder {item['product_name']} (only {item['quantity']} units left)")

    if action_items:
        lines.extend(["", "Immediate action items:"] + action_items)

    return "\n".join(lines)


def _handle_alerts(message: str, sid: str) -> str:
    """Professional alerts breakdown."""
    alerts = get_all_alerts()

    if not alerts or all(a.get("risk_level") == "None" for a in alerts):
        return "No active alerts — all systems operating normally."

    critical = [a for a in alerts if a and a.get("risk_level") == "High"]
    medium = [a for a in alerts if a and a.get("risk_level") == "Medium"]
    low = [a for a in alerts if a and a.get("risk_level") == "Low"]

    lines = ["**Active Alerts Overview**\n"]

    if critical:
        lines.append(f"Critical ({len(critical)}):")
        for a in critical:
            lines.append(f"• {a['ship_id']}: {a['alert']} — {a['zone']}")
        lines.append("")

    if medium:
        lines.append(f"Medium priority ({len(medium)}):")
        for a in medium:
            lines.append(f"• {a['ship_id']}: {a['alert']} — {a['zone']}")
        lines.append("")

    if low:
        lines.append(f"Informational ({len(low)}):")
        for a in low:
            lines.append(f"• {a['ship_id']}: {a['alert']} — {a['zone']}")

    return "\n".join(lines)


def _handle_signal(message: str, sid: str) -> Optional[str]:
    """Ship signal / communication status."""
    ship_id = extract_ship_id(message) or _ctx(sid).get("last_ship_id")

    if ship_id:
        signal = find_signal(ship_id)
        if not signal:
            return None
        _update_context(sid, last_ship_id=ship_id)

        lines = [
            f"**{signal['ship_name']}** ({ship_id}) communication status:\n",
            f"Status: {signal['status']}",
            f"Last signal: {signal['last_signal_received']} minutes ago",
            f"Signal strength: {signal['signal_strength_dbm']} dBm",
            f"Quality: {signal['signal_quality']}",
            f"Last known position: {signal['lat']}°N, {signal['lon']}°E",
        ]
        if signal["status"] != "Online":
            lines.extend([
                "",
                "Action required: Re-establish communication to confirm vessel status "
                "and position accuracy.",
            ])
        return "\n".join(lines)

    # Fleet-wide signals
    signals = get_all_ship_signals()
    if not signals:
        return None

    online = [s for s in signals if s["status"] == "Online"]
    weak = [s for s in signals if s["status"] == "Weak"]
    offline = [s for s in signals if s["status"] == "Offline"]

    lines = ["**Fleet Communication Status**\n"]

    if online:
        lines.append(f"Online ({len(online)}):")
        for s in online:
            lines.append(
                f"• {s['ship_id']} ({s['ship_name']}): signal {s['last_signal_received']}m ago"
            )
        lines.append("")

    if weak:
        lines.append(f"Weak signal ({len(weak)}):")
        for s in weak:
            lines.append(
                f"• {s['ship_id']} ({s['ship_name']}): quality {s['signal_quality']}"
            )
        lines.append("")

    if offline:
        lines.append(f"Offline ({len(offline)}):")
        for s in offline:
            lines.append(
                f"• {s['ship_id']} ({s['ship_name']}): last signal {s['last_signal_received']}m ago"
            )

    return "\n".join(lines)


def _handle_inventory(message: str, sid: str) -> str:
    """Full inventory overview."""
    inv = get_inventory()
    if not inv:
        return "No inventory data available."

    lines = [f"**Inventory Overview** — {len(inv)} products tracked\n"]
    for item in inv:
        status = "✓" if item["quantity"] > item["reorder_level"] else "⚠ LOW"
        lines.append(
            f"• {item['product_name']}: {item['quantity']} units "
            f"(reorder at {item['reorder_level']}) {status}"
        )
    return "\n".join(lines)


def _handle_reasoning(message: str, sid: str) -> Optional[str]:
    """
    Handle 'why' questions by pulling context from the session.
    If a previous shipment or ship was discussed, explain that entity.
    """
    last_shipment = _ctx(sid).get("last_shipment_id")
    last_ship = _ctx(sid).get("last_ship_id")

    if last_shipment:
        shipment = find_shipment(last_shipment)
        if shipment:
            delay = predict_delay(last_shipment)
            return (
                f"Shipment {last_shipment} is experiencing delays because of "
                f"{delay['reason'].replace('+', ' and ').strip()}. "
                f"The current delay risk is {delay['delay_risk'].lower()} "
                f"with an estimated {delay['expected_delay_hours']} hours of delay.\n\n"
                f"Contributing factors typically include weather disruptions, "
                f"port congestion, and scheduling conflicts at the destination."
            )

    if last_ship:
        risk = find_risk(last_ship)
        ship = find_ship(last_ship)
        if risk and ship and risk["risk_level"] != "None":
            return (
                f"{ship['ship_name']} ({last_ship}) is flagged because it entered "
                f"{risk['zone']}, which carries a {risk['risk_level'].lower()} risk level. "
                f"{risk['alert']}."
            )

    return None


def _handle_corrective(message: str, sid: str) -> Optional[str]:
    """Handle 'how to fix / what to do' questions with actionable advice."""
    text = normalize_text(message)
    parts: List[str] = []

    if any(w in text for w in ["delay", "late", "stuck", "behind"]):
        parts.append(
            "To address shipment delays:\n"
            "• Reroute cargo through an alternate port with lower congestion\n"
            "• Notify the customer and destination warehouse of revised ETAs\n"
            "• Prioritise dock unloading slots for delayed vessels\n"
            "• If delay exceeds 24h, consider expedited air freight for critical goods"
        )

    if any(w in text for w in ["risk", "danger", "hazard"]):
        parts.append(
            "To mitigate shipping risks:\n"
            "• Divert vessels away from identified risk zones where possible\n"
            "• Increase monitoring frequency and crew alertness\n"
            "• Coordinate with port authorities for safe passage windows\n"
            "• Verify that insurance policies cover the current risk exposure"
        )

    if any(w in text for w in ["stock", "inventory", "reorder"]):
        parts.append(
            "To resolve inventory shortages:\n"
            "• Place emergency purchase orders with primary suppliers\n"
            "• Enable expedited shipping for critical items\n"
            "• Review safety stock levels and adjust reorder points\n"
            "• Explore secondary suppliers to reduce lead time"
        )

    if parts:
        return "\n\n".join(parts)
    return None


# ============================================================================
# Intent → handler mapping
# ============================================================================

_HANDLER_MAP = {
    "delay_status": _handle_delay,
    "low_stock": _handle_low_stock,
    "ship_risk": _handle_risk,
    "tracking": _handle_tracking,
    "route_optimization": _handle_route,
    "summary": _handle_summary,
    "alerts": _handle_alerts,
    "signal_status": _handle_signal,
    "inventory_status": _handle_inventory,
    "reasoning": _handle_reasoning,
    "corrective_action": _handle_corrective,
}


# ============================================================================
# Multi-intent resolver
# ============================================================================


def _resolve_intents(message: str, sid: str) -> Optional[str]:
    """
    Detect all intents in the message, call each handler,
    and combine the results into a single professional response.
    """
    intents = detect_intents(message)
    responses: List[str] = []

    for intent in intents:
        handler = _HANDLER_MAP.get(intent)
        if handler:
            try:
                result = handler(message, sid)
                if result:
                    responses.append(result)
            except Exception:
                pass

    return "\n\n---\n\n".join(responses) if responses else None


# ============================================================================
# LLM fallback
# ============================================================================


def _fallback_llm(message: str) -> Dict:
    """Use Groq LLM with full operational context when no handler matches."""
    client, err = _get_groq_client()

    if not client:
        return _ok(
            "I can assist with delayed shipments, low stock alerts, ship risk assessment, "
            "route optimisation, tracking, signals, and operational summaries. "
            "Could you rephrase your question?"
        )

    try:
        response = client.chat.completions.create(
            model=CHATBOT_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": f"{SYSTEM_PROMPT}\n\nCurrent Operations Data:\n{build_llm_context()}",
                },
                {"role": "user", "content": message},
            ],
            temperature=0.3,
            max_tokens=1024,
        )
        content = response.choices[0].message.content if response.choices else ""
        if content:
            return _ok(content.strip())
        return _err("The AI model did not return a response. Please try again.")
    except Exception as exc:
        return _ok(
            "I can assist with delayed shipments, low stock alerts, ship risk assessment, "
            "route optimisation, tracking, signals, and operational summaries. "
            f"I could not complete the AI fallback right now: {str(exc)}"
        )


# ============================================================================
# Public entry point
# ============================================================================


def chatbot_reply(message: str, session_id: Optional[str] = None) -> Dict:
    """
    Main chatbot entry point.

    1. Normalises and validates the message.
    2. Detects single or multiple intents.
    3. Resolves via specialised handlers with actionable recommendations.
    4. Falls back to LLM with full operational context if needed.
    5. Maintains session context for follow-up questions.
    """
    try:
        clean = (message or "").strip()
        if not clean:
            return _err("Please provide a question or command.")

        sid = _ensure_session(session_id)
        intents = detect_intents(clean)

        # Try structured resolution
        response_text = _resolve_intents(clean, sid)
        if response_text:
            # Update context
            shipment_id = extract_shipment_id(clean)
            ship_id = extract_ship_id(clean)
            _update_context(
                sid,
                last_intent=intents[0] if intents else None,
                last_response=response_text[:200],
                **({"last_shipment_id": shipment_id} if shipment_id else {}),
                **({"last_ship_id": ship_id} if ship_id else {}),
            )
            return _ok(response_text, intents=intents, session_id=sid)

        # LLM fallback
        fallback = _fallback_llm(clean)
        fallback["session_id"] = sid
        fallback["intents_detected"] = intents
        return fallback

    except Exception as exc:
        return _err(f"An unexpected error occurred: {str(exc)}")
