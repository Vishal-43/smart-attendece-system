import os
from dotenv import load_dotenv
from jose import jwt
from datetime import datetime, timedelta

load_dotenv()


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


def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    exp_min = datetime.utcnow() + timedelta(
        minutes=int(os.getenv("REFRESH_TOKEN_EXPIRE_MINUTES"))
    )
    to_encode.update({"exp": exp_min})
    encoded_jwt = jwt.encode(
        to_encode, os.getenv("JWT_SECRET"), algorithm=os.getenv("JWT_ALGORITHM")
    )
    return encoded_jwt


def decode_token(token: str) -> dict:
    try:
        decode_token = jwt.decode(
            token=token,
            key=os.getenv("JWT_SECRET"),
            algorithms=[os.getenv("JWT_ALGORITHM")],
        )
        return decode_token
    except jwt.JWTError as e:
        raise Exception(f"Token is invalid: {str(e)}")
