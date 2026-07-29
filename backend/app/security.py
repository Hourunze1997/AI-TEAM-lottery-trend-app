"""JWT / 密码 / 限流"""
import time
from datetime import datetime, timedelta, timezone
from typing import Dict, Set, Optional
from threading import Lock

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from passlib.context import CryptContext

from app.config import get_settings

settings = get_settings()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

# token 黑名单
_revoked_tokens: Set[str] = set()
_revoke_lock = Lock()

# 简易 rate limit（IP → list[timestamp]）
_rate_buckets: Dict[str, list] = {}
_rate_lock = Lock()


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return pwd_context.verify(plain, hashed)
    except Exception:
        return False


def create_access_token(subject: str | int, extra: Optional[Dict] = None) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(subject),
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)).timestamp()),
    }
    if extra:
        payload.update(extra)
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def verify_token(token: str) -> Dict:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"无效的 token: {e}",
        )


def is_token_revoked(token: str) -> bool:
    with _revoke_lock:
        return token in _revoked_tokens


def revoke_token(token: str) -> None:
    with _revoke_lock:
        _revoked_tokens.add(token)


def check_rate_limit(key: str, limit: int = 60, window: int = 60) -> bool:
    """滑动窗口限流"""
    now = time.time()
    with _rate_lock:
        bucket = _rate_buckets.setdefault(key, [])
        # 清理过期
        bucket[:] = [t for t in bucket if now - t < window]
        if len(bucket) >= limit:
            return False
        bucket.append(now)
        return True


async def get_token_payload(token: Optional[str] = Depends(oauth2_scheme)) -> Dict:
    if not token:
        raise HTTPException(status_code=401, detail="未登录")
    if is_token_revoked(token):
        raise HTTPException(status_code=401, detail="token 已失效")
    return verify_token(token)
