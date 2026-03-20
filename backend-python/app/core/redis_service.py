import json
import logging
from typing import Any, Optional

import redis

from app.core.config import settings

logger = logging.getLogger("smartattendance.redis")


class RedisService:
    def __init__(
        self,
        host: Optional[str] = None,
        port: Optional[int] = None,
        db: Optional[int] = None,
        password: Optional[str] = None,
        decode_responses: bool = True,
    ):
        self._host = host or getattr(settings, "REDIS_HOST", "localhost")
        self._port = port or getattr(settings, "REDIS_PORT", 6379)
        self._db = db or getattr(settings, "REDIS_DB", 0)
        self._password = password or getattr(settings, "REDIS_PASSWORD", None)
        self._decode = decode_responses
        self._client: Optional[redis.Redis] = None

    @property
    def is_configured(self) -> bool:
        return bool(getattr(settings, "REDIS_HOST", None) or getattr(settings, "REDIS_URL", None))

    @property
    def client(self) -> redis.Redis:
        if self._client is None:
            self._client = redis.Redis(
                host=self._host,
                port=self._port,
                db=self._db,
                password=self._password,
                decode_responses=self._decode,
            )
        return self._client

    def get(self, key: str) -> Optional[str]:
        try:
            return self.client.get(key)
        except redis.RedisError:
            logger.exception("Redis GET failed for key: %s", key)
            return None

    def set(
        self,
        key: str,
        value: str,
        ex_seconds: Optional[int] = None,
    ) -> bool:
        try:
            return self.client.set(key, value, ex=ex_seconds)
        except redis.RedisError:
            logger.exception("Redis SET failed for key: %s", key)
            return False

    def delete(self, key: str) -> bool:
        try:
            return bool(self.client.delete(key))
        except redis.RedisError:
            logger.exception("Redis DELETE failed for key: %s", key)
            return False

    def get_json(self, key: str) -> Optional[Any]:
        raw = self.get(key)
        if raw is None:
            return None
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return None

    def set_json(
        self,
        key: str,
        value: Any,
        ex_seconds: Optional[int] = None,
    ) -> bool:
        try:
            return self.set(key, json.dumps(value), ex_seconds)
        except (TypeError, json.JSONEncodeError):
            logger.exception("Redis SET_JSON failed for key: %s", key)
            return False


redis_service = RedisService()
