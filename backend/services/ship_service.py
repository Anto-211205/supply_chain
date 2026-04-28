ships = {
    "S12": {
        "ship_id": "S12",
        "ship_name": "Cargo Titan",
        "current_grid": "C14",
        "speed": "28 km/h",
        "eta": "18 hours",
        "lat": 13.08,
        "lon": 80.27,
        "route": ["A10", "B11", "C14", "D16"]
    },
    "S15": {
        "ship_id": "S15",
        "ship_name": "Ocean Pearl",
        "current_grid": "B09",
        "speed": "24 km/h",
        "eta": "26 hours",
        "lat": 11.90,
        "lon": 75.20,
        "route": ["A05", "A07", "B09"]
    }
}


def get_all_live_ships():
    return list(ships.values())


def get_ship(ship_id):
    return ships.get(ship_id)


def coordinate_to_grid(lat, lon):
    row = int(abs(lat)) % 26
    col = int(abs(lon)) % 100

    letter = chr(65 + row)
    return f"{letter}{col:02d}"