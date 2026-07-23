import datetime

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Entry, Scale
from .utils import anchor_for


class AnchorForTests(TestCase):
    def test_day_is_itself(self):
        d = datetime.date(2026, 7, 23)  # a Thursday
        self.assertEqual(anchor_for(Scale.DAY, d), d)

    def test_week_is_monday(self):
        d = datetime.date(2026, 7, 23)  # Thursday
        self.assertEqual(anchor_for(Scale.WEEK, d), datetime.date(2026, 7, 20))

    def test_month_first(self):
        self.assertEqual(
            anchor_for(Scale.MONTH, datetime.date(2026, 7, 23)),
            datetime.date(2026, 7, 1),
        )

    def test_year_first(self):
        self.assertEqual(
            anchor_for(Scale.YEAR, datetime.date(2026, 7, 23)),
            datetime.date(2026, 1, 1),
        )

    def test_decade_start(self):
        self.assertEqual(
            anchor_for(Scale.DECADE, datetime.date(1974, 5, 9)),
            datetime.date(1970, 1, 1),
        )


class EntryApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()  # SingleUserAuthentication resolves the local user

    def _post(self, **payload):
        return self.client.post("/api/entries/", payload, format="json")

    def test_upsert_does_not_duplicate(self):
        self._post(scale="day", date="2026-07-23", text="first")
        r = self._post(scale="day", date="2026-07-23", text="second")
        self.assertEqual(r.status_code, 200)  # updated, not created
        self.assertEqual(Entry.objects.count(), 1)
        self.assertEqual(Entry.objects.first().text, "second")

    def test_any_day_in_week_hits_same_slot(self):
        self._post(scale="week", date="2026-07-20", text="mon")
        self._post(scale="week", date="2026-07-23", text="thu")
        self.assertEqual(Entry.objects.filter(scale="week").count(), 1)
        self.assertEqual(Entry.objects.get(scale="week").text, "thu")

    def test_empty_text_deletes_slot(self):
        self._post(scale="day", date="2026-07-23", text="something")
        r = self._post(scale="day", date="2026-07-23", text="   ")
        self.assertEqual(r.status_code, 204)
        self.assertEqual(Entry.objects.count(), 0)

    def test_entries_scoped_to_request_user(self):
        # A different user's entry must not leak into the API response.
        User = get_user_model()
        other = User.objects.create(username="someone-else")
        Entry.objects.create(
            user=other, scale="day", anchor_date=datetime.date(2026, 7, 23), text="theirs"
        )
        self._post(scale="day", date="2026-07-22", text="mine")
        r = self.client.get("/api/entries/?scale=day")
        texts = [e["text"] for e in r.json()]
        self.assertEqual(texts, ["mine"])

    def test_profile_roundtrip(self):
        r = self.client.put(
            "/api/profile/",
            {"name": "Tomasz", "birth_date": "1975-01-01"},
            format="json",
        )
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()["name"], "Tomasz")
