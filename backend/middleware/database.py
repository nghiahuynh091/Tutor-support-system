from typing import Awaitable, Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from db.database import db


class DatabaseMiddleware(BaseHTTPMiddleware):
    """
    Middleware to ensure database connection pool is available
    for all requests.
    This middleware handles:
    - Lazy initialization of the database connection pool
    - Ensures all endpoints have access to initialized database connections
    - Compatible with development hot reloading (no lifespan dependency)
    - Prevents "NoneType has no attribute 'acquire'" errors
    The database pool is initialized once on the first request and reused
    for all subsequent requests until the server restarts.
    """

    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
        # Initialize database pool if not already initialized
        if db.pool is None:
            print("🔄 Initializing database pool...")
            await db.initialize()
            print("✅ Database pool ready")

        # Process the request
        response = await call_next(request)
        return response
