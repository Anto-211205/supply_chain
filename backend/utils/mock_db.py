import uuid

from backend.utils.auth_utils import hash_password, verify_password


USERS_DB: dict = {}


def create_user(data: dict) -> dict:
    email = data.get("email", "").lower().strip()
    if not email:
        raise ValueError("Email is required")
    if email in USERS_DB:
        raise ValueError("An account with this email already exists")

    password = data.get("password", "")
    if len(password) < 6:
        raise ValueError("Password must be at least 6 characters")

    user = {
        "id": str(uuid.uuid4()),
        "email": email,
        "first_name": data.get("first_name", ""),
        "last_name": data.get("last_name", ""),
        "phone": data.get("phone", ""),
        "company_name": data.get("company_name", ""),
        "role": data.get("role", "user"),
        "country": data.get("country", ""),
        "password_hash": hash_password(password),
    }
    USERS_DB[email] = user
    print(f"User created: {email}")
    return user


def get_user_by_email(email: str):
    return USERS_DB.get(email.lower().strip())


def update_user_password(email: str, new_password: str) -> bool:
    user = get_user_by_email(email)
    if not user:
        return False
    user["password_hash"] = hash_password(new_password)
    USERS_DB[email.lower().strip()] = user
    return True


def _seed_default_users():
    defaults = [
        {
            "email": "admin@supplychain.com",
            "password": "Admin@123",
            "first_name": "Admin",
            "last_name": "User",
            "role": "admin",
            "company_name": "SmartChain AI",
            "country": "US",
            "phone": "",
        },
        {
            "email": "demo@supplychain.com",
            "password": "Demo@123",
            "first_name": "Demo",
            "last_name": "User",
            "role": "viewer",
            "company_name": "SmartChain AI",
            "country": "US",
            "phone": "",
        },
    ]
    for user in defaults:
        try:
            create_user(user)
        except ValueError:
            pass


_seed_default_users()
