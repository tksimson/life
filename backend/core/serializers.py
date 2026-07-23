from rest_framework import serializers

from .models import Entry, Profile


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["name", "birth_date"]


class EntrySerializer(serializers.ModelSerializer):
    # Clients send `date` (any day in the period); the view normalizes it to anchor_date.
    date = serializers.DateField(write_only=True)
    # Blank text is allowed on write: it signals "clear this slot".
    text = serializers.CharField(max_length=Entry._meta.get_field("text").max_length, allow_blank=True)

    class Meta:
        model = Entry
        fields = ["id", "scale", "date", "anchor_date", "text", "updated_at"]
        read_only_fields = ["id", "anchor_date", "updated_at"]
