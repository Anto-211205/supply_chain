shipments = {
    "SH101": {
        "shipment_id": "SH101",
        "product": "Electronics",
        "source": "Factory - Chennai",
        "destination": "Singapore Warehouse",
        "status": "In Transit",
        "lat": 12.95,
        "lon": 80.14,
        "route": [
            "Factory",
            "Warehouse",
            "Port",
            "Ship",
            "Destination"
        ]
    },
    "SH102": {
        "shipment_id": "SH102",
        "product": "Medicines",
        "source": "Mumbai",
        "destination": "Dubai",
        "status": "At Port",
        "lat": 19.07,
        "lon": 72.87,
        "route": [
            "Factory",
            "Warehouse",
            "Port",
            "Ship",
            "Destination"
        ]
    }
}


def get_all_shipments():
    return list(shipments.values())


def get_shipment(shipment_id):
    return shipments.get(shipment_id)


def update_shipment_location(shipment_id, lat, lon, status):
    if shipment_id not in shipments:
        return None

    shipments[shipment_id]["lat"] = lat
    shipments[shipment_id]["lon"] = lon
    shipments[shipment_id]["status"] = status

    return shipments[shipment_id]
