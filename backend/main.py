from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db.config import settings
from middleware.database import DatabaseMiddleware

# Import route modules

from routes import user_route, system_route, class_route

#tạo mới tránh conflict
from routes import registration_route, admin_route

app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    description=settings.API_DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add database middleware FIRST (before CORS)
app.add_middleware(DatabaseMiddleware)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include route modules
app.include_router(system_route.router)  # Root and system endpoints
app.include_router(user_route.router)    # /users endpoints

# class modules
app.include_router(class_route.router)

# registration modules
app.include_router(registration_route.router)

# admin modules
app.include_router(admin_route.router)


if __name__ == "__main__":
    import uvicorn
    print(f"📍 Server URL:     {settings.server_url}")
    print(f"📚 API Docs:       {settings.docs_url}")
    print(f"📖 ReDoc:          {settings.redoc_url}")
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.RELOAD,
        log_level="info" if settings.DEBUG else "warning"
    )
