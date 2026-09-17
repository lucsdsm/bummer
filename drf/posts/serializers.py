from rest_framework import serializers

from .models import Game, Category, Post, Image

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = [
            "id",
            "name",
            "slug",
        ]

class CategorySerializer(serializers.ModelSerializer):
    parent_id = serializers.IntegerField(
        read_only=True,
    )
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "slug",
            "parent_id",
            "children",
        ]

    def get_children(self, category):
        children = category.children.all()

        return CategorySerializer(
            children,
            many=True,
            context=self.context,
        ).data

class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = [
            "id",
            "image_url",
            "position",
        ]

class PostListSerializer(serializers.ModelSerializer):
    game = serializers.CharField(
        source="game.name",
        read_only=True,
    )
    category = serializers.CharField(
        source="category.name",
        read_only=True,
    )
    images = ImageSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Post
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "game",
            "category",
            "download_url",
            "images",
        ]