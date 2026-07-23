from django.contrib import admin

from .models import Entry, Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "name", "birth_date"]


@admin.register(Entry)
class EntryAdmin(admin.ModelAdmin):
    list_display = ["user", "scale", "anchor_date", "text"]
    list_filter = ["scale"]
    search_fields = ["text"]
