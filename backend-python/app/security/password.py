import os
from dotenv import load_dotenv
load_dotenv()
from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=[os.getenv("SCHEME")],
    deprecated="auto",
    pbkdf2_sha256__default_rounds=int(os.getenv("ROUNDS")),
    pbkdf2_sha256__default_salt_size=int(os.getenv("SALT_SIZE")),
)

# for testing **
def hash_password(password: str, user: str) -> str:
    # Don't concatenate - just hash the password
    return pwd_context.hash(password[:72])  # Limit to 72 bytes as bcrypt requires


def verify_password(password: str, hashed_password: str, user: str) -> str:
    return pwd_context.verify(password, hashed_password)


if __name__ == "__main__":
    plain_password = "123456789"
    user = "student1 "
    hashed = hash_password(plain_password, user)
    print(
        "hashed password:", hashed, "\n", verify_password(plain_password, hashed, user)
    )
