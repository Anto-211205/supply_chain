inventory = [
    {
        "product_id": "P101",
        "product_name": "Laptop",
        "quantity": 120,
        "reorder_level": 30
    },
    {
        "product_id": "P102",
        "product_name": "Medicine Kit",
        "quantity": 18,
        "reorder_level": 25
    },
    {
        "product_id": "P103",
        "product_name": "Mobile Phone",
        "quantity": 250,
        "reorder_level": 50
    }
]


def get_inventory():
    return inventory


def get_low_stock():
    return [
        item for item in inventory
        if item["quantity"] <= item["reorder_level"]
    ]


def update_after_delivery(shipment_id):
    # Mock delivery stock update
    inventory[0]["quantity"] += 20

    return {
        "message": f"Inventory updated after {shipment_id}",
        "updated_product": inventory[0]
    }