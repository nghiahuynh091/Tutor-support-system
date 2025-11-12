import asyncpg  # type: ignore
from db.config import settings
from typing import List, Dict, Any, Optional


class DatabasePool:
    def __init__(self):
        self.pool: Optional[asyncpg.Pool] = None  # type: ignore

    async def initialize(self):
        """Initialize the connection pool"""
        try:
            self.pool = await asyncpg.create_pool(
                settings.DATABASE_URL,
                min_size=settings.DB_POOL_MIN_SIZE,
                max_size=settings.DB_POOL_MAX_SIZE,
                command_timeout=settings.DB_COMMAND_TIMEOUT,
                statement_cache_size=0  # Disable prepared statements
            )
        except Exception as e:
            print(f"❌ Failed to initialize database pool: {e}")
            raise

    async def close(self):
        if self.pool:
            await self.pool.close()
            print("Database pool closed")

    async def execute_query(self, query: str, *args: Any) -> List[Dict[str, Any]]:
        """Execute a SELECT query and return results as list of dicts"""
        if self.pool is None:
            raise RuntimeError("Database pool not initialized")
        async with self.pool.acquire() as connection:
            rows = await connection.fetch(query, *args)
            return [dict(row) for row in rows]

    async def execute_single(
        self, query: str, *args: Any
    ) -> Optional[Dict[str, Any]]:
        """Execute a query and return single result as dict"""
        if self.pool is None:
            raise RuntimeError("Database pool not initialized")
        async with self.pool.acquire() as connection:
            row = await connection.fetchrow(query, *args)
            return dict(row) if row else None

    async def execute_command(self, query: str, *args: Any) -> str:
        """Execute INSERT, UPDATE, DELETE commands"""
        if self.pool is None:
            raise RuntimeError("Database pool not initialized")
        async with self.pool.acquire() as connection:
            result = await connection.execute(query, *args)
            return result

    async def test_connection(self) -> Dict[str, str]:
        try:
            result = await self.execute_single(
                "SELECT NOW() as current_time, version() as version"
            )
            if result is None:
                return {
                    "status": "error",
                    "message": "No result returned from database"
                }
            return {
                "status": "connected",
                "message": "PostgreSQL connection successful",
                "server_time": str(result['current_time']),
                "version": result['version']
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Connection failed: {str(e)}"
            }


# Global instance
db = DatabasePool()
