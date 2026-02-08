import os
from dotenv import load_dotenv
from passlib.context import CryptContext

load_dotenv()

pwd_context = CryptContext(
    schemes=[os.getenv("scheme")],
    deprecated="auto",
    pbkdf2_sha256__default_rounds=int(os.getenv("rounds")),
    pbkdf2_sha256__default_salt_size=int(os.getenv("salt_size")),
)


def hash_password(password: str, user: str) -> str:
    return pwd_context.hash(password + user)


def verify_password(password: str, hashed_password: str, user: str) -> str:
    return pwd_context.verify(password + user, hashed_password)


if __name__ == "__main__":
    plain_password = "123456789"
    user = "admin"
    hashed = hash_password(plain_password, user)
    print(
        "hashed password:", hashed, "\n", verify_password(plain_password, hashed, user)
    )
