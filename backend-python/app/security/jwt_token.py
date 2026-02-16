import os
from jose import jwt
from datetime import datetime, timedelta

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    exp_min = datetime.utcnow() + timedelta(
        minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
    )
    to_encode.update({"exp": exp_min})
    encoded_jwt = jwt.encode(
        to_encode, os.getenv("JWT_SECRET"), algorithm=os.getenv("JWT_ALGORITHM")
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
        to_encode, os.getenv("JWT_SECRET"), algorithm=os.getenv("JWT_ALGORITHM")
    )
    return encoded_jwt


from jose import jwt, JWTError
def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            os.getenv("JWT_SECRET"),
            algorithms=[os.getenv("JWT_ALGORITHM")],
        )
        return payload
    except JWTError:
        raise Exception("Token is invalid or expired")
