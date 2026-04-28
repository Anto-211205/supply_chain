def predict_delay(shipment_id):
    return {
        "shipment_id": shipment_id,
        "delay_risk": "High",
        "expected_delay_hours": 18,
        "reason": "Storm zone + port congestion"
    }


def optimize_route(from_location, to_location, ship_id):
    return {
        "ship_id": ship_id,
        "from": from_location,
        "to": to_location,
        "old_route_days": 6,
        "new_route_days": 5.2,
        "saved_time": "19 hours",
        "suggestion": "Use southern shipping lane"
    }
