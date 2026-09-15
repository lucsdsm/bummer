from rest_framework import filters, viewsets

from .models import Category, Game, Post
from .serializers import (
    CategorySerializer,
    GameSerializer,
    PostListSerializer,
)


class GameViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Game.objects.all().order_by("name")
    serializer_class = GameSerializer
    lookup_field = "slug"


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all().order_by("name")
    serializer_class = CategorySerializer
    lookup_field = "slug"


class PostViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PostListSerializer
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
            Post.objects.filter(is_published=True)
            .select_related("game", "category")
            .order_by("-created_at")
        )