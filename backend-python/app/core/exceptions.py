from typing import Any

from fastapi import Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError

from app.core.response import error_response


# ── Custom exception classes ────────────────────────────────────────────────

class NotFoundError(Exception):
    def __init__(self, resource: str, id: Any):
        self.message = f"{resource} with id '{id}' not found."
        super().__init__(self.message)


class ConflictError(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)


class ForbiddenError(Exception):
    def __init__(self, message: str = "You do not have permission to perform this action."):
        self.message = message
        super().__init__(self.message)


class UnauthorizedError(Exception):
    def __init__(self, message: str = "Authentication required."):
        self.message = message
        super().__init__(self.message)


class ValidationError(Exception):
    def __init__(self, message: str, data: Any = None):
        self.message = message
        self.data = data
        super().__init__(self.message)


# ── Exception handlers ──────────────────────────────────────────────────────

async def not_found_handler(request: Request, exc: NotFoundError) -> JSONResponse:
    return JSONResponse(
        status_code=404,
        content=error_response(exc.message),
    )


async def conflict_handler(request: Request, exc: ConflictError) -> JSONResponse:
    return JSONResponse(
        status_code=409,
        content=error_response(exc.message),
    )


async def forbidden_handler(request: Request, exc: ForbiddenError) -> JSONResponse:
    return JSONResponse(
        status_code=403,
        content=error_response(exc.message),
    )


async def unauthorized_handler(request: Request, exc: UnauthorizedError) -> JSONResponse:
    return JSONResponse(
        status_code=401,
        content=error_response(exc.message),
    )


def _to_json_safe(value: Any) -> Any:
    return jsonable_encoder(
        value,
        custom_encoder={
            Exception: lambda err: str(err),
        },
    )


async def validation_handler(
    request: Request, exc: RequestValidationError | ValidationError
) -> JSONResponse:
    if isinstance(exc, ValidationError):
        return JSONResponse(
            status_code=422,
            content=error_response(exc.message, data=_to_json_safe(exc.data)),
        )

    return JSONResponse(
        status_code=422,
        content=error_response("Validation failed.", data=_to_json_safe(exc.errors())),
    )


async def integrity_handler(request: Request, exc: IntegrityError) -> JSONResponse:
    return JSONResponse(
        status_code=409,
        content=error_response("A record with this data already exists."),
    )


async def generic_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content=error_response("An unexpected error occurred."),
    )
