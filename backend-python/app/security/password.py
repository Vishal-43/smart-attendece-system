import os, dotevn
from passlib.context import CryptContext

dotevn.load_dotenv()


pwd_context = CryptContext(schemes=[os.getenv("scheme")], deprecated="auto")
salt = os.getenv("salt").encode()
salt_size = int(os.getenv("salt_size"))
rounds = int(os.getenv("rounds"))

pwd_context.update(
    pbkdf2_sha256__default_salt_size=salt_size,
    pbkdf2_sha256__default_rounds=rounds)


def hash_password(password:str,user:str) -> str:
    return pwd_context.using(salt=salt).hash(password,user=user)

def verify_password(password:str, hashed_password:str,user:str) -> str:
    return pwd_context.using(salt=salt).verify(password,hashed_password,user=user)




