from django.db.models import Q
from rest_framework import filters, viewsets

from .models import Category, Game, Post
from .serializers import (
    CategorySerializer,
    GameSerializer,
    PostListSerializer,
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = (
        Category.objects.filter(parent__isnull=True)
        .prefetch_related("children")
        .order_by("name")
    )
    serializer_class = CategorySerializer
    lookup_field = "slug"

class GameViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Game.objects.all().order_by("name")
    serializer_class = GameSerializer
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
        "category__parent__name",
    ]

    def get_queryset(self):
        queryset = (
            Post.objects.filter(is_published=True)
            .select_related(
                "game",
                "category",
                "category__parent",
            )
            .prefetch_related("images")
            .order_by("-created_at")
        )

        category_slug = self.request.query_params.get("category")
        game_slug = self.request.query_params.get("game")

        if category_slug:
            queryset = queryset.filter(
                Q(category__slug=category_slug)
                | Q(category__parent__slug=category_slug)
            )

        if game_slug:
            queryset = queryset.filter(game__slug=game_slug)

        return queryset