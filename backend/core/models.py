from django.conf import settings
from django.db import models

# One line, one slot. Keep it tight on purpose.
LINE_MAX = 140


class Scale(models.TextChoices):
    DAY = "day", "Day"
    WEEK = "week", "Week"
    MONTH = "month", "Month"
    YEAR = "year", "Year"
    DECADE = "decade", "Decade"


class Profile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    name = models.CharField(max_length=120, blank=True)
    birth_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.name or self.user.get_username()


class Entry(models.Model):
    """One line of text anchored to a single period slot.

    `anchor_date` is the canonical first day of the period (see core.utils.anchor_for),
    so (user, scale, anchor_date) uniquely identifies a slot and edits upsert cleanly.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="entries",
    )
    scale = models.CharField(max_length=6, choices=Scale.choices)
    anchor_date = models.DateField()
    text = models.CharField(max_length=LINE_MAX)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "scale", "anchor_date"],
                name="unique_slot_per_user",
            )
        ]
        ordering = ["-anchor_date"]
        indexes = [models.Index(fields=["user", "scale", "anchor_date"])]

    def __str__(self):
        return f"{self.scale} {self.anchor_date}: {self.text[:30]}"
