from fastapi import APIRouter
from db.database import db

# Create router for general/system endpoints
router = APIRouter(
    tags=["system"]
)


@router.get("/")
async def root():
    """Root endpoint - API health check"""
    return {"message": "HireMatch API is running with MVC architecture"}


@router.get("/health")
async def health_check():
    """Health check endpoint with database status"""
    db_status = await db.test_connection()

    return {
        "status": "healthy",
        "message": "API is operational",
        "database": db_status,
        "version": "1.0.0"
    }


@router.get("/test-db")
async def test_database():
    """Test database connection (legacy endpoint)"""
    return await db.test_connection()
