from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"entries", views.EntryViewSet, basename="entry")

urlpatterns = [
    path("profile/", views.profile_view, name="profile"),
    path("", include(router.urls)),
]
