"""Auth 路由：登录/注册/登出"""
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.security import (
    create_access_token,
    verify_password,
    hash_password,
    revoke_token,
)
from app.deps import get_current_user_id
from app.security import oauth2_scheme

router = APIRouter()


class RegisterIn(BaseModel):
    username: str
    password: str


class LoginIn(BaseModel):
    username: str
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int


# 简化：内存用户表（实际项目应使用 ORM）
_USERS: dict[str, dict] = {}
_NEXT_USER_ID = 1


def _next_id() -> int:
    global _NEXT_USER_ID
    _NEXT_USER_ID += 1
    return _NEXT_USER_ID


@router.post("/register", response_model=TokenOut)
def register(payload: RegisterIn, db: Session = Depends(get_db)):
    if payload.username in _USERS:
        raise HTTPException(status_code=409, detail="用户已存在")
    user_id = _next_id()
    _USERS[payload.username] = {
        "id": user_id,
        "username": payload.username,
        "password": hash_password(payload.password),
    }
    token = create_access_token(user_id)
    return TokenOut(access_token=token, user_id=user_id)


@router.post("/login", response_model=TokenOut)
def login(payload: LoginIn):
    user = _USERS.get(payload.username)
    if not user or not verify_password(payload.password, user["password"]):
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    token = create_access_token(user["id"])
    return TokenOut(access_token=token, user_id=user["id"])


@router.post("/logout")
def logout(
    user_id: int = Depends(get_current_user_id),
    token: Optional[str] = Depends(oauth2_scheme),
):
    if token:
        revoke_token(token)
    return {"ok": True}
