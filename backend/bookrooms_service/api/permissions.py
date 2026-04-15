from rest_framework.permissions import BasePermission
import logging

logger = logging.getLogger(__name__)


def allowed_roles(roles):
    def decorator(view_func):
        view_func.allowed_roles = roles
        return view_func
    return decorator


class HasRolePermission(BasePermission):
    def has_permission(self, request, view):
        if request.method == "OPTIONS":
            return True

        if not request.user or not request.user.is_authenticated:
            return False

        user_role = getattr(request.user, "role", None)
        allowed_roles = getattr(view, "allowed_roles", [])

        logger.warning(
            f"Checking permission: user={request.user}, role={user_role}, allowed_roles={allowed_roles}, method={request.method}"
        )

        if request.method in ["GET", "HEAD"]:
            return user_role in allowed_roles

        if request.method in ["POST", "PUT", "PATCH", "DELETE"]:
            return user_role == "admin"

        return False


class HasRoleAdminPermission(BasePermission):
    def has_permission(self, request, view):
        user_role = getattr(request.user, "role", None)
        return request.user.is_authenticated and user_role == "admin"