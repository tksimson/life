from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Entry, Profile
from .serializers import EntrySerializer, ProfileSerializer
from .utils import anchor_for


@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated])
def profile_view(request):
    profile, _ = Profile.objects.get_or_create(user=request.user)
    if request.method == "PUT":
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    return Response(ProfileSerializer(profile).data)


class EntryViewSet(viewsets.ModelViewSet):
    serializer_class = EntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Entry.objects.filter(user=self.request.user)
        scale = self.request.query_params.get("scale")
        if scale:
            qs = qs.filter(scale=scale)
        date_from = self.request.query_params.get("from")
        date_to = self.request.query_params.get("to")
        if date_from:
            qs = qs.filter(anchor_date__gte=date_from)
        if date_to:
            qs = qs.filter(anchor_date__lte=date_to)
        return qs

    def create(self, request, *args, **kwargs):
        """Upsert on (user, scale, anchor_date). Empty text clears the slot."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        anchor = anchor_for(data["scale"], data["date"])
        text = data["text"].strip()

        if not text:
            Entry.objects.filter(
                user=request.user, scale=data["scale"], anchor_date=anchor
            ).delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        entry, created = Entry.objects.update_or_create(
            user=request.user,
            scale=data["scale"],
            anchor_date=anchor,
            defaults={"text": text},
        )
        out = self.get_serializer(entry).data
        code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(out, status=code)
