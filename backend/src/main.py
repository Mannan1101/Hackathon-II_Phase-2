"""
FastAPI application entry point.

Main application instance with CORS middleware and lifecycle events.
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .database import create_tables
from .api.routes import tasks
from .config import settings
import logging
import time
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.

    Handles startup and shutdown events.
    """
    # Startup: Create database tables
    logger.info("Starting up: Creating database tables...")
    create_tables()
    logger.info("Database tables created successfully!")

    yield

    # Shutdown: Cleanup if needed
    logger.info("Shutting down...")

# Create FastAPI application instance
app = FastAPI(
    title="Todo Backend API",
    description="RESTful API for task management with user-scoped data handling.\n\n"
                "**Authentication Note**: In Spec-1, user_id is passed as a request parameter. "
                "In Spec-2 integration, user_id will be extracted from JWT token automatically.",
    version="1.0.0",
    lifespan=lifespan,
    contact={
        "name": "Todo Backend Team",
    },
)

# Request/Response Logging Middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """
    Log all API requests and responses with timestamps.

    Logs:
        - Request method, path, and timestamp
        - Response status code and processing time
    """
    start_time = time.time()

    # Log request
    logger.info(f"Request: {request.method} {request.url.path}")

    try:
        # Process request
        response = await call_next(request)

        # Calculate processing time
        process_time = time.time() - start_time

        # Log response
        logger.info(
            f"Response: {request.method} {request.url.path} - "
            f"Status: {response.status_code} - "
            f"Time: {process_time:.3f}s"
        )

        # Add processing time header
        response.headers["X-Process-Time"] = str(process_time)

        return response
    except Exception as e:
        # Log errors
        process_time = time.time() - start_time
        logger.error(
            f"Error: {request.method} {request.url.path} - "
            f"Exception: {str(e)} - "
            f"Time: {process_time:.3f}s"
        )
        raise

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """
    Add security headers to all responses.

    Headers:
        - X-Content-Type-Options: Prevent MIME type sniffing
        - X-Frame-Options: Prevent clickjacking attacks
        - X-XSS-Protection: Enable browser XSS protection
        - Strict-Transport-Security: Enforce HTTPS (production only)
        - Content-Security-Policy: Restrict resource loading
    """
    response = await call_next(request)

    # Prevent MIME type sniffing
    response.headers["X-Content-Type-Options"] = "nosniff"

    # Prevent clickjacking
    response.headers["X-Frame-Options"] = "DENY"

    # Enable XSS protection
    response.headers["X-XSS-Protection"] = "1; mode=block"

    # Enforce HTTPS in production
    if os.getenv("ENVIRONMENT") == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

    # Content Security Policy
    response.headers["Content-Security-Policy"] = "default-src 'self'"

    return response

# Configure CORS middleware
# Get allowed origins from environment variable or use default for development
allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

logger.info(f"CORS configured with allowed origins: {allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # Specify exact origins from environment
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# Register routers
app.include_router(tasks.router)

@app.get("/")
async def root():
    """
    Root endpoint for health check.

    Returns:
        dict: Welcome message and API status
    """
    return {
        "message": "Todo Backend API",
        "status": "running",
        "version": "1.0.0",
        "docs": "/docs",
    }

@app.get("/health")
async def health_check():
    """
    Health check endpoint.

    Returns:
        dict: Health status
    """
    return {"status": "healthy"}
