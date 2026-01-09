"""
Error response schemas.

Defines standardized error response format for API endpoints.
"""
from pydantic import BaseModel
from typing import Dict, Any, Optional

class ErrorDetail(BaseModel):
    """
    Error detail object containing error information.

    Fields:
        code: Error code for programmatic handling
        message: Human-readable error message
        details: Additional error details (optional)
    """
    code: str
    message: str
    details: Optional[Dict[str, Any]] = None

class Error(BaseModel):
    """
    Error response wrapper.

    Fields:
        error: ErrorDetail object containing error information
    """
    error: ErrorDetail
