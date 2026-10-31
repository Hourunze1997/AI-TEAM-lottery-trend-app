"""FastAPI 应用入口"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.config import get_settings
from app.errors import (
    AppError,
    http_exception_handler,
    app_error_handler,
    generic_exception_handler,
)
from app.routers import (
    draws,
    frequencies,
    picker,
    favorites,
    notifications,
    auth,
)
from app.jobs.scheduler import start_scheduler, shutdown_scheduler
from app.utils.logging import configure_logging

logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    settings = get_settings()
    configure_logging(settings.LOG_LEVEL)

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        # 启动 scheduler
        await start_scheduler()
        logger.info("应用启动完成")
        try:
            yield
        finally:
            await shutdown_scheduler()
            logger.info("应用关闭")

    app = FastAPI(
        title="Lotto Picker API",
        version="1.0.0",
        lifespan=lifespan,
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 全局异常处理
    app.add_exception_handler(AppError, app_error_handler)
    from fastapi import HTTPException

    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(Exception, generic_exception_handler)

    # 路由
    app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
    app.include_router(draws.router, prefix="/api/v1/draws", tags=["draws"])
    app.include_router(frequencies.router, prefix="/api/v1/frequencies", tags=["frequencies"])
    app.include_router(picker.router, prefix="/api/v1/picker", tags=["picker"])
    app.include_router(favorites.router, prefix="/api/v1/favorites", tags=["favorites"])
    app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["notifications"])

    @app.get("/health", tags=["health"])
    async def health():
        return {"status": "ok"}

    return app


app = create_app()
