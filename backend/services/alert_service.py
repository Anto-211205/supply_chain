risk_zones = [
    {
        "zone_id": "Z01",
        "zone_name": "Bay Storm Sector",
        "type": "Storm",
        "risk_level": "High",
        "grid": "C14"
    },
    {
        "zone_id": "Z02",
        "zone_name": "Piracy Watch Area",
        "type": "Piracy",
        "risk_level": "Medium",
        "grid": "B09"
    },
    {
        "zone_id": "Z03",
        "zone_name": "Port Congestion Zone",
        "type": "Congestion",
        "risk_level": "Low",
        "grid": "D16"
    }
]

ship_grid_map = {
    "S12": "C14",
    "S15": "B09",
    "S19": "A07"
}


def get_risk_zones():
    return risk_zones


def get_ship_risk(ship_id):
    if ship_id not in ship_grid_map:
        return None

    current_grid = ship_grid_map[ship_id]

    for zone in risk_zones:
        if zone["grid"] == current_grid:
            return {
                "ship_id": ship_id,
                "zone": zone["zone_name"],
                "risk_level": zone["risk_level"],
                "alert": f"Ship entered {zone['type']} zone"
            }

    return {
        "ship_id": ship_id,
        "zone": "Safe Zone",
        "risk_level": "None",
        "alert": "No active risk"
    }


def get_all_alerts():
    alerts = []

    for ship_id in ship_grid_map:
        alerts.append(get_ship_risk(ship_id))

    return alerts