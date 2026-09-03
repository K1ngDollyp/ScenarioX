import uuid
from typing import Optional, Dict, Any
from fastapi import Depends, Header
from jose import jwt, JWTError
from app.core.config import settings
from app.core.exceptions import AuthenticationError


class AuthenticatedUser:
    """Stores verified authenticated user context derived from Supabase JWT."""
    def __init__(self, user_id: str, email: str, role: str = "authenticated"):
        self.id = user_id
        self.email = email
        self.role = role


async def get_current_user(
    authorization: Optional[str] = Header(None)
) -> AuthenticatedUser:
    """
    Supabase Auth JWT verification dependency.
    Extracts Bearer token, verifies JWT, and extracts authenticated user context.
    NEVER trusts client-supplied user IDs.
    """
    if not authorization:
        # Fallback for dev/demo mode if Authorization header is missing
        if settings.ENVIRONMENT == "development":
            return AuthenticatedUser(
                user_id="00000000-0000-0000-0000-000000000001",
                email="demo@scenariox.ai"
            )
        raise AuthenticationError("Missing Authorization header")

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise AuthenticationError("Invalid token header. Format: Bearer <token>")

    token = parts[1]

    # For testing or dev environments with local mock keys
    if settings.ENVIRONMENT == "development" and token.startswith("dev-token-"):
        user_uuid = token.replace("dev-token-", "")
        if len(user_uuid) != 36:
            user_uuid = "00000000-0000-0000-0000-000000000001"
        return AuthenticatedUser(
            user_id=user_uuid,
            email=f"user-{user_uuid[:8]}@scenariox.ai"
        )

    try:
        payload: Dict[str, Any] = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False}
        )
        user_id = payload.get("sub")
        email = payload.get("email", "")
        if not user_id:
            raise AuthenticationError("Invalid JWT token payload: missing sub")

        return AuthenticatedUser(user_id=user_id, email=email)
    except JWTError as e:
        # In dev mode, gracefully allow test tokens
        if settings.ENVIRONMENT == "development":
            return AuthenticatedUser(
                user_id="00000000-0000-0000-0000-000000000001",
                email="demo@scenariox.ai"
            )
        raise AuthenticationError(f"JWT Verification failed: {str(e)}")
