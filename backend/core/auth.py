from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.authentication import BaseAuthentication


class SingleUserAuthentication(BaseAuthentication):
    """Local mode: every request is the one seeded user, no login.

    When going multi-user, drop this from DEFAULT_AUTHENTICATION_CLASSES and use
    TokenAuthentication instead. Nothing else in the API changes (all querysets are
    already scoped to request.user).
    """

    def authenticate(self, request):
        if not getattr(settings, "LIFE_SINGLE_USER", False):
            return None
        User = get_user_model()
        user, _ = User.objects.get_or_create(
            username=settings.LIFE_LOCAL_USERNAME,
        )
        return (user, None)
