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
app.include_router(system_route.router, prefix="/api")  # Root and system endpoints
app.include_router(user_route.router, prefix="/api")    # /users endpoints
app.include_router(progressRoute.router, prefix="/api")
app.include_router(assignmentRoute.router, prefix="/api")
app.include_router(submissionRoute.router, prefix="/api")
app.include_router(feedbackRoute.router, prefix="/api")
app.include_router(attendance_route.router, prefix="/api")

# class modules
app.include_router(class_route.router, prefix="/api")

# registration modules
app.include_router(registration_route.router, prefix="/api")

# admin modules
app.include_router(admin_route.router, prefix="/api")

#learning modules
app.include_router(learning_route.router, prefix="/api")

#subject modules
app.include_router(subject_route.router, prefix="/api")

#note modules
app.include_router(note_route.router, prefix="/api")

#session modules
app.include_router(session_route.router, prefix="/api")
