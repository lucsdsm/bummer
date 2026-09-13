from rest_framework import filters, viewsets

from .models import Category, Game, Item
from .serializers import (
    CategorySerializer,
    GameSerializer,
    ItemListSerializer,
)


class GameViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Game.objects.all().order_by("name")
    serializer_class = GameSerializer
    lookup_field = "slug"


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all().order_by("name")
    serializer_class = CategorySerializer
    lookup_field = "slug"


class ItemViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ItemListSerializer
    lookup_field = "slug"

    filter_backends = [
        filters.SearchFilter,
    ]
    search_fields = [
        "name",
        "description",
        "game__name",
        "category__name",
    ]

    def get_queryset(self):
        return (
            Item.objects.filter(is_published=True)
            .select_related("game", "category")
            .order_by("-created_at")
        )