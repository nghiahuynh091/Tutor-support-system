from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from db.config import settings
from middleware.database import DatabaseMiddleware

# Import route modules

from routes import user_route, system_route, class_route

#tạo mới tránh conflict
from routes import registration_route, admin_route

from routes import learning_route

from routes import subject_route

from routes import note_route

from routes import session_route

from routes.FeedbackAndProgressTracking import assignmentRoute, feedbackRoute, progressRoute, submissionRoute
from routes import attendance_route

app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    description=settings.API_DESCRIPTION,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None
)

# Add database middleware FIRST (before CORS)
app.add_middleware(DatabaseMiddleware)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include route modules
app.include_router(system_route.router)  # Root and system endpoints
app.include_router(user_route.router)    # /users endpoints
app.include_router(progressRoute.router)
app.include_router(assignmentRoute.router)
app.include_router(submissionRoute.router)
app.include_router(feedbackRoute.router)
app.include_router(attendance_route.router)

# class modules
app.include_router(class_route.router)

# registration modules
app.include_router(registration_route.router)

# admin modules
app.include_router(admin_route.router)

#learning modules
app.include_router(learning_route.router)

#subject modules
app.include_router(subject_route.router)

#note modules
app.include_router(note_route.router)

#session modules
app.include_router(session_route.router)

# Root endpoint
@app.get("/")
async def root():
    return {"status": "ok", "message": "Tutor Support System API"}

# Handle favicon request
@app.get("/favicon.ico")
async def favicon():
    return Response(status_code=204)

# Vercel serverless handler
handler = app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=settings.RELOAD)
