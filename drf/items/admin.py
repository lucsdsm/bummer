from django.contrib import admin

from .models import Category, Game, Item


@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "slug",
    )
    search_fields = (
        "name",
    )
    prepopulated_fields = {
        "slug": (
            "name",
        ),
    }


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "slug",
    )
    search_fields = (
        "name",
    )
    prepopulated_fields = {
        "slug": (
            "name",
        ),
    }


@admin.register(Item)
class ModAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "game",
        "category",
        "is_published",
        "created_at",
        "updated_at",
    )
    list_filter = (
        "game",
        "category",
        "is_published",
        "created_at",
    )
    search_fields = (
        "name",
        "description",
        "game__name",
        "category__name",
    )
    autocomplete_fields = (
        "game",
        "category",
    )
    prepopulated_fields = {
        "slug": (
            "name",
        ),
    }
    readonly_fields = (
        "created_at",
        "updated_at",
    )
    list_editable = (
        "is_published",
    )
    ordering = (
        "-created_at",
    )