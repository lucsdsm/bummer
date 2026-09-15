from rest_framework import serializers

from .models import Game, Category, Post

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = [
            "id",
            "name",
            "slug",
        ]

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "slug",
        ]

class PostListSerializer(serializers.ModelSerializer):
    game = serializers.CharField(source="game.name", read_only=True)
    category = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Post
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "game",
            "category",
            "image_url",
            "download_url",
        ]