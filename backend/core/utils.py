import datetime

from .models import Scale


def anchor_for(scale: str, date: datetime.date) -> datetime.date:
    """Normalize a date to the canonical first day of its period for `scale`.

    day    -> the date itself
    week   -> Monday of that ISO week
    month  -> first of the month
    year   -> Jan 1
    decade -> Jan 1 of the decade start (e.g. 1974 -> 1970)
    """
    if scale == Scale.DAY:
        return date
    if scale == Scale.WEEK:
        return date - datetime.timedelta(days=date.weekday())
    if scale == Scale.MONTH:
        return date.replace(day=1)
    if scale == Scale.YEAR:
        return date.replace(month=1, day=1)
    if scale == Scale.DECADE:
        return date.replace(year=date.year - date.year % 10, month=1, day=1)
    raise ValueError(f"Unknown scale: {scale!r}")
