from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from core.models import Profile


class Command(BaseCommand):
    help = "Create the single local user + profile used in LIFE_SINGLE_USER mode."

    def handle(self, *args, **options):
        User = get_user_model()
        user, created = User.objects.get_or_create(
            username=settings.LIFE_LOCAL_USERNAME
        )
        Profile.objects.get_or_create(user=user)
        verb = "Created" if created else "Already present"
        self.stdout.write(
            self.style.SUCCESS(f"{verb}: local user '{user.username}'")
        )
