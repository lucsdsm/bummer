from django.db import models
from django.utils.text import slugify


class Game(models.Model):
    name = models.CharField(
        max_length=120,
        unique=True,
        verbose_name="nome",
    )
    slug = models.SlugField(
        max_length=140,
        unique=True,
        blank=True,
        verbose_name="slug",
    )

    class Meta:
        verbose_name = "jogo"
        verbose_name_plural = "jogos"
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)

        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Category(models.Model):
    name = models.CharField(
        max_length=100,
        unique=True,
        verbose_name="nome",
    )
    slug = models.SlugField(
        max_length=120,
        unique=True,
        blank=True,
        verbose_name="slug",
    )

    class Meta:
        verbose_name = "categoria"
        verbose_name_plural = "categorias"
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)

        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Item(models.Model):
    name = models.CharField(
        max_length=180,
        verbose_name="nome",
    )
    slug = models.SlugField(
        max_length=220,
        unique=True,
        blank=True,
        verbose_name="slug",
    )
    description = models.TextField(
        blank=True,
        verbose_name="descrição",
    )

    game = models.ForeignKey(
        Game,
        on_delete=models.PROTECT,
        related_name="items",
        verbose_name="jogo",
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="items",
        verbose_name="categoria",
    )

    download_url = models.URLField(
        max_length=500,
        verbose_name="link para download",
        help_text="URL externa para download ou página de download do item.",
    )
    image_url = models.URLField(
        max_length=500,
        verbose_name="link da imagem",
        help_text="URL externa da imagem de exemplo/capa do item.",
    )

    is_published = models.BooleanField(
        default=True,
        verbose_name="publicado",
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="criado em",
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="atualizado em",
    )

    class Meta:
        verbose_name = "item"
        verbose_name_plural = "itens"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["slug"]),
            models.Index(fields=["game", "category"]),
            models.Index(fields=["is_published", "-created_at"]),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)

        super().save(*args, **kwargs)

    def __str__(self):
        return self.name