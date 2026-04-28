"""
Comprehensive test suite for the AI Supply Chain Operations Chatbot.

Covers:
  - Delayed shipment queries (specific + all)
  - Low stock detection
  - Ship risk assessment
  - Route optimisation
  - Operational summary
  - Multi-intent / compound prompts
  - Context-aware follow-ups
  - Corrective action recommendations
  - Signal status
  - Alerts
  - Fallback behaviour
  - Edge cases
"""

import pytest

from backend.services.chatbot_service import chatbot_reply, _session_context
from backend.utils.chatbot_utils import (
    detect_intents,
    extract_ship_id,
    extract_shipment_id,
    extract_locations,
    normalize_text,
)


# ============================================================================
# Helpers
# ============================================================================


def reply(msg: str, session_id=None):
    """Shorthand for calling the chatbot."""
    return chatbot_reply(msg, session_id=session_id)


def assert_success(result):
    """Assert the response is successful."""
    assert result["status"] == "success", f"Expected success, got: {result}"
    assert result["message"], "Message should not be empty"
    return result["message"]


# ============================================================================
# NLP Utility Tests
# ============================================================================


class TestNLPUtils:
    """Test low-level NLP utilities."""

    def test_normalize_text(self):
        assert normalize_text("  Hello   World  ") == "hello world"

    def test_extract_shipment_id(self):
        assert extract_shipment_id("What about SH102?") == "SH102"
        assert extract_shipment_id("Tell me about sh101") == "SH101"
        assert extract_shipment_id("No shipment here") is None

    def test_extract_ship_id(self):
        assert extract_ship_id("Check ship S12") == "S12"
        assert extract_ship_id("Risk for S15") == "S15"
        assert extract_ship_id("No ship here") is None

    def test_extract_ship_id_avoids_shipment_prefix(self):
        # SH102 should NOT match as a ship ID
        assert extract_ship_id("Shipment SH102 is delayed") is None

    def test_extract_locations(self):
        locs = extract_locations("Route from Chennai to Singapore")
        assert "Chennai" in locs
        assert "Singapore" in locs

    def test_detect_single_intent(self):
        intents = detect_intents("Which shipment is delayed?")
        assert "delay_status" in intents

    def test_detect_multiple_intents(self):
        intents = detect_intents("Show risky ships and low stock items")
        assert "ship_risk" in intents
        assert "low_stock" in intents

    def test_detect_summary_fallback(self):
        intents = detect_intents("hello")
        assert intents == ["summary"]

    def test_detect_reasoning_intent(self):
        intents = detect_intents("Why is shipment SH102 delayed?")
        assert "reasoning" in intents

    def test_detect_corrective_intent(self):
        intents = detect_intents("How can we fix the delay?")
        assert "corrective_action" in intents


# ============================================================================
# Delayed Shipment Tests
# ============================================================================


class TestDelayedShipments:
    """Test delay-related queries."""

    def test_specific_shipment_delay(self):
        result = reply("Why is SH102 delayed?")
        msg = assert_success(result)
        assert "SH102" in msg
        assert "delay" in msg.lower() or "delayed" in msg.lower()

    def test_all_delayed_shipments(self):
        result = reply("Which shipments are delayed?")
        msg = assert_success(result)
        # Should mention at least one shipment or say none are delayed
        assert "delayed" in msg.lower() or "no" in msg.lower() or "good news" in msg.lower()

    def test_delay_includes_recommendations(self):
        result = reply("Tell me about delayed shipments")
        msg = assert_success(result)
        # Should include actionable recommendations
        assert "recommend" in msg.lower() or "action" in msg.lower() or "notify" in msg.lower()

    def test_specific_delay_with_route_info(self):
        result = reply("Is SH102 delayed?")
        msg = assert_success(result)
        assert "SH102" in msg


# ============================================================================
# Low Stock Tests
# ============================================================================


class TestLowStock:
    """Test inventory / low stock queries."""

    def test_show_low_stock(self):
        result = reply("Show low stock items")
        msg = assert_success(result)
        assert "medicine kit" in msg.lower() or "below" in msg.lower() or "healthy" in msg.lower()

    def test_low_stock_has_priority(self):
        result = reply("Which products need reordering?")
        msg = assert_success(result)
        # Should mention priority or action
        assert any(
            w in msg.lower()
            for w in ["critical", "high", "medium", "healthy", "reorder"]
        )

    def test_low_stock_recommendations(self):
        result = reply("Low stock alerts")
        msg = assert_success(result)
        assert "recommend" in msg.lower() or "action" in msg.lower() or "order" in msg.lower() or "healthy" in msg.lower()


# ============================================================================
# Ship Risk Tests
# ============================================================================


class TestShipRisk:
    """Test risk assessment queries."""

    def test_specific_ship_risk(self):
        result = reply("Is S12 in danger?")
        msg = assert_success(result)
        assert "S12" in msg or "Cargo Titan" in msg

    def test_all_risky_ships(self):
        result = reply("Any dangerous ships now?")
        msg = assert_success(result)
        assert "risk" in msg.lower() or "safe" in msg.lower()

    def test_risk_mitigation_steps(self):
        result = reply("Show risky ships")
        msg = assert_success(result)
        assert any(
            w in msg.lower()
            for w in ["monitor", "divert", "safe", "risk"]
        )


# ============================================================================
# Route Optimisation Tests
# ============================================================================


class TestRouteOptimisation:
    """Test route optimisation queries."""

    def test_route_for_shipment(self):
        result = reply("Optimize route for SH101")
        msg = assert_success(result)
        assert "route" in msg.lower() or "optimis" in msg.lower() or "optimi" in msg.lower()

    def test_route_with_locations(self):
        result = reply("Best route from Chennai to Dubai")
        msg = assert_success(result)
        assert "route" in msg.lower()

    def test_route_includes_savings(self):
        result = reply("Optimize route for SH101")
        msg = assert_success(result)
        assert "day" in msg.lower() or "hour" in msg.lower() or "saving" in msg.lower()


# ============================================================================
# Summary / Dashboard Tests
# ============================================================================


class TestSummary:
    """Test dashboard summary queries."""

    def test_today_summary(self):
        result = reply("Give me today's summary")
        msg = assert_success(result)
        assert "shipment" in msg.lower() or "dashboard" in msg.lower()

    def test_whats_happening(self):
        result = reply("What is happening now?")
        msg = assert_success(result)
        assert "shipment" in msg.lower() or "fleet" in msg.lower() or "transit" in msg.lower()

    def test_summary_includes_all_sections(self):
        result = reply("Give me an overview")
        msg = assert_success(result)
        # Should cover shipments, fleet and inventory
        low = msg.lower()
        assert "shipment" in low or "delivery" in low
        assert "ship" in low or "fleet" in low or "transit" in low

    def test_any_issues_today(self):
        result = reply("Any issues today?")
        msg = assert_success(result)
        assert result["status"] == "success"


# ============================================================================
# Multi-Intent / Compound Prompt Tests
# ============================================================================


class TestMultiIntent:
    """Test compound questions with multiple intents."""

    def test_delay_and_fix(self):
        result = reply("Which shipment is delayed and how can we fix it?")
        msg = assert_success(result)
        # Should address both delay info AND corrective actions
        assert "delay" in msg.lower() or "action" in msg.lower()

    def test_risk_and_low_stock(self):
        result = reply("Show risky ships and low stock items")
        msg = assert_success(result)
        low = msg.lower()
        assert "risk" in low or "safe" in low
        assert "stock" in low or "reorder" in low or "healthy" in low

    def test_summary_and_recommendations(self):
        result = reply("Give summary and route recommendation")
        msg = assert_success(result)
        assert result["status"] == "success"

    def test_multi_intents_detected_in_response(self):
        result = reply("Show risky ships and low stock items")
        assert "intents_detected" in result
        intents = result["intents_detected"]
        assert len(intents) >= 2


# ============================================================================
# Context Awareness Tests
# ============================================================================


class TestContextAwareness:
    """Test session-based context for follow-up questions."""

    def test_followup_why_after_shipment(self):
        # First ask about a specific shipment
        r1 = reply("Is SH102 delayed?", session_id="test-ctx-1")
        assert_success(r1)
        sid = r1.get("session_id", "test-ctx-1")

        # Then ask "Why?" — should use context
        r2 = reply("Why?", session_id=sid)
        msg = assert_success(r2)
        assert "SH102" in msg or "delay" in msg.lower() or "reason" in msg.lower()

    def test_session_id_returned(self):
        result = reply("Hello")
        assert "session_id" in result
        assert result["session_id"] is not None


# ============================================================================
# Corrective Action Tests
# ============================================================================


class TestCorrectiveActions:
    """Test corrective action / recommendation queries."""

    def test_how_to_fix_delays(self):
        result = reply("How can we fix the delays?")
        msg = assert_success(result)
        assert "reroute" in msg.lower() or "notify" in msg.lower() or "action" in msg.lower()

    def test_what_should_we_do(self):
        result = reply("What should we do about delays?")
        msg = assert_success(result)
        assert result["status"] == "success"


# ============================================================================
# Signal Status Tests
# ============================================================================


class TestSignalStatus:
    """Test signal / communication status queries."""

    def test_specific_ship_signal(self):
        result = reply("Signal status for S12")
        msg = assert_success(result)
        assert "S12" in msg or "Cargo Titan" in msg

    def test_fleet_signal_overview(self):
        result = reply("Show all ship signals")
        msg = assert_success(result)
        assert "signal" in msg.lower() or "communication" in msg.lower() or "online" in msg.lower()


# ============================================================================
# Alerts Tests
# ============================================================================


class TestAlerts:
    """Test alert queries."""

    def test_active_alerts(self):
        result = reply("Show active alerts")
        msg = assert_success(result)
        assert "alert" in msg.lower() or "normal" in msg.lower()


# ============================================================================
# Edge Cases
# ============================================================================


class TestEdgeCases:
    """Test edge cases and error handling."""

    def test_empty_message(self):
        result = reply("")
        assert result["status"] == "error"

    def test_whitespace_only_message(self):
        result = reply("   ")
        assert result["status"] == "error"

    def test_unknown_shipment(self):
        result = reply("Track shipment SH999")
        msg = assert_success(result)
        # Should handle gracefully — either not found msg or fallback
        assert result["status"] == "success"

    def test_gibberish_input(self):
        result = reply("asdfghjkl qwertyuiop")
        # Should not crash — may fallback to LLM or default
        assert result["status"] in ("success", "error")

    def test_response_format(self):
        result = reply("Show low stock")
        assert "status" in result
        assert "message" in result
        assert isinstance(result["message"], str)

    def test_no_robotic_tags_in_output(self):
        """Ensure old robotic tags like [ALERT], [OK], [CRITICAL] are gone."""
        queries = [
            "Which shipment is delayed?",
            "Show low stock items",
            "Any dangerous ships?",
            "Give me today's summary",
        ]
        for q in queries:
            result = reply(q)
            msg = result.get("message", "")
            assert "[ALERT]" not in msg, f"Found [ALERT] in response to: {q}"
            assert "[OK]" not in msg, f"Found [OK] in response to: {q}"
            assert "[DASHBOARD]" not in msg, f"Found [DASHBOARD] in response to: {q}"


# ============================================================================
# Response Quality Tests
# ============================================================================


class TestResponseQuality:
    """Test that responses are professional and human-quality."""

    def test_no_all_caps_headers(self):
        """Responses shouldn't have ALL-CAPS section headers."""
        result = reply("Give me today's summary")
        msg = result.get("message", "")
        # Allow acronyms but not full lines in caps
        for line in msg.split("\n"):
            stripped = line.strip("• *-#")
            if len(stripped) > 10:
                assert stripped != stripped.upper(), f"All-caps line found: {line}"

    def test_professional_tone(self):
        result = reply("Which shipment is delayed?")
        msg = result.get("message", "").lower()
        # Should not contain casual filler
        assert "lol" not in msg
        assert "haha" not in msg
        assert "idk" not in msg
