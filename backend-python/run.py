from app.main import app
from starlette.middleware.base import BaseHTTPMiddleware

class LogHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        print(f"[HEADERS] {dict(request.headers)}")
        response = await call_next(request)
        return response

app.add_middleware(LogHeadersMiddleware)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)