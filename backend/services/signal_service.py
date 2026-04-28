from datetime import datetime, timedelta


# Mock AIS / Radio Signal Data
ship_signals = {
    "S12": {
        "ship_id": "S12",
        "ship_name": "Cargo Titan",
        "last_signal_time": datetime.utcnow() - timedelta(minutes=12),
        "signal_strength": -58,
        "lat": 13.08,
        "lon": 80.27
    },
    "S15": {
        "ship_id": "S15",
        "ship_name": "Ocean Pearl",
        "last_signal_time": datetime.utcnow() - timedelta(minutes=45),
        "signal_strength": -79,
        "lat": 11.90,
        "lon": 75.20
    },
    "S19": {
        "ship_id": "S19",
        "ship_name": "Sea Falcon",
        "last_signal_time": datetime.utcnow() - timedelta(hours=2),
        "signal_strength": -96,
        "lat": 9.50,
        "lon": 78.10
    }
}


def get_status(minutes):
    if minutes <= 20:
        return "Online"
    elif minutes <= 60:
        return "Weak"
    return "Offline"


def get_quality(dbm):
    if dbm >= -65:
        return "Excellent"
    elif dbm >= -80:
        return "Good"
    elif dbm >= -95:
        return "Weak"
    return "Poor"


def get_ship_signal(ship_id):
    if ship_id not in ship_signals:
        return None

    signal_data = ship_signals[ship_id]
    minutes_ago = int((datetime.utcnow() - signal_data["last_signal_time"]).total_seconds() / 60)
    dbm = signal_data["signal_strength"]

    return {
        "ship_id": ship_id,
        "ship_name": signal_data["ship_name"],
        "last_signal_received": minutes_ago,
        "status": get_status(minutes_ago),
        "signal_strength_dbm": dbm,
        "signal_quality": get_quality(dbm),
        "lat": signal_data["lat"],
        "lon": signal_data["lon"]
    }


def get_all_ship_signals():
    return [get_ship_signal(ship_id) for ship_id in ship_signals.keys()]
