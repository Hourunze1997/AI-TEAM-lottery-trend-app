"""统一错误处理"""
import uuid
import logging
from typing import Optional, Dict, Any

from fastapi import Request, HTTPException as FastAPIHTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

logger = logging.getLogger(__name__)


class AppError(Exception):
    """应用层业务异常"""

    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = 400,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(message)


class ErrorOut(BaseModel):
    """统一错误响应 schema"""

    error: Dict[str, Any]
    request_id: str


def _build_request_id(request: Request) -> str:
    return request.headers.get("X-Request-ID") or str(uuid.uuid4())


async def http_exception_handler(request: Request, exc: FastAPIHTTPException):
    """HTTPException → ErrorOut"""
    request_id = _build_request_id(request)
    code_map = {
        401: "UNAUTHORIZED",
        403: "FORBIDDEN",
        404: "NOT_FOUND",
        409: "CONFLICT",
        422: "VALIDATION_ERROR",
        429: "TOO_MANY_REQUESTS",
    }
    code = code_map.get(exc.status_code, f"HTTP_{exc.status_code}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": code,
                "message": str(exc.detail) if exc.detail else "Error",
                "details": getattr(exc, "headers", None) or {},
            },
            "request_id": request_id,
        },
    )


async def app_error_handler(request: Request, exc: AppError):
    """AppError → ErrorOut"""
    request_id = _build_request_id(request)
    logger.warning(f"AppError {exc.code}: {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details,
            },
            "request_id": request_id,
        },
    )


async def generic_exception_handler(request: Request, exc: Exception):
    """兜底异常 → ErrorOut(500)"""
    request_id = _build_request_id(request)
    logger.exception(f"Unhandled error: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "服务器内部错误",
                "details": {"type": exc.__class__.__name__},
            },
            "request_id": request_id,
        },
    )
