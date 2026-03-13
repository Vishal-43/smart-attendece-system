import os
from jose import jwt
from datetime import datetime, timedelta


def _secret_key() -> str:
    key = os.getenv("SECRET_KEY") or os.getenv("JWT_SECRET")
    if not key:
        raise ValueError("SECRET_KEY is not configured")
    return key


def _algorithm() -> str:
    return os.getenv("ALGORITHM") or os.getenv("JWT_ALGORITHM", "HS256")

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    exp_min = datetime.utcnow() + timedelta(
        minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
    )
    to_encode.update({"exp": exp_min})
    encoded_jwt = jwt.encode(
        to_encode, _secret_key(), algorithm=_algorithm()
    )
    return encoded_jwt


# Add create_refresh_token function
def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    exp_min = datetime.utcnow() + timedelta(
        days=int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7))
    )
    to_encode.update({"exp": exp_min})
    encoded_jwt = jwt.encode(
        to_encode, _secret_key(), algorithm=_algorithm()
    )
    return encoded_jwt


from jose import jwt, JWTError
def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            _secret_key(),
            algorithms=[_algorithm()],
        )
        return payload
    except JWTError:
        raise Exception("Token is invalid or expired")
