from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Item
from .serializers import ItemListSerializer

class ItemViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ItemListSerializer
    lookup_field = "slug"

    def get_queryset(self):
        return (
            Item.objects.filter(is_published=True)
            .select_related("game", "category")
            .order_by("-created_at")
        )