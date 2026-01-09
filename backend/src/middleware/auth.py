"""
JWT authentication middleware for FastAPI.

Provides dependency injection for JWT token verification and user identity extraction.
"""
import jwt
import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Annotated

from ..config import settings

# Configure logging for authentication failures
logger = logging.getLogger(__name__)

# HTTP Bearer token scheme
security = HTTPBearer()


def get_current_user_id(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)]
) -> str:
    """
    Verify JWT token and extract user ID from the 'sub' claim.

    Args:
        credentials: HTTP Bearer token from Authorization header

    Returns:
        User ID (string) extracted from JWT 'sub' claim

    Raises:
        HTTPException: 401 if token is missing, invalid, or expired
    """
    token = credentials.credentials

    try:
        # Verify JWT signature and decode payload
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=["HS256"]
        )

        # Extract user ID from 'sub' claim
        user_id: str = payload.get("sub")
        if not user_id:
            logger.warning(
                "Authentication failed: JWT token missing 'sub' claim",
                extra={"token_prefix": token[:10] + "..."}
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing 'sub' claim",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return user_id

    except jwt.ExpiredSignatureError:
        logger.warning(
            "Authentication failed: JWT token has expired",
            extra={"token_prefix": token[:10] + "..."}
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as e:
        logger.warning(
            "Authentication failed: Invalid JWT token",
            extra={"error": str(e), "token_prefix": token[:10] + "..."}
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
