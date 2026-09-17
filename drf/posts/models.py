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
    parent = models.ForeignKey(
        "self",
        on_delete=models.PROTECT,
        related_name="children",
        null=True,
        blank=True,
        verbose_name="categoria principal",
        help_text=(
            "Deixe vazio para uma categoria principal. "
            "Selecione uma categoria para criar uma subcategoria."
        ),
    )

    class Meta:
        verbose_name = "categoria"
        verbose_name_plural = "categorias"
        ordering = [
            "parent__name",
            "name",
        ]

    def clean(self):
        from django.core.exceptions import ValidationError

        if self.pk and self.parent_id == self.pk:
            raise ValidationError(
                {
                    "parent": "Uma categoria não pode ser pai dela mesma.",
                }
            )

        ancestor = self.parent

        while ancestor:
            if self.pk and ancestor.pk == self.pk:
                raise ValidationError(
                    {
                        "parent": (
                            "Essa seleção criaria um ciclo entre categorias."
                        ),
                    }
                )

            ancestor = ancestor.parent

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)

        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        if self.parent_id:
            return f"{self.parent.name} → {self.name}"

        return self.name


class Post(models.Model):
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
        blank=True,
        null=True,
        related_name="posts",
        verbose_name="jogo",
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="posts",
        verbose_name="categoria",
    )

    download_url = models.URLField(
        max_length=500,
        verbose_name="link para download",
        help_text="URL externa para download ou página de download do post.",
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
        verbose_name = "post"
        verbose_name_plural = "posts"
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

class Image(models.Model):
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="images",
        verbose_name="post",
    )
    image_url = models.URLField(
        max_length=500,
        verbose_name="link da imagem",
        help_text="URL externa da imagem de exemplo do post.",
    )
    position = models.PositiveSmallIntegerField(
        default=0,
        verbose_name="posição",
        help_text="Ordem da imagem na exibição.",
    )

    class Meta:
        verbose_name = "imagem do post"
        verbose_name_plural = "imagens do post"
        ordering = [
            "position",
            "id",
        ]

    def __str__(self):
        return f"Imagem {self.position + 1} — {self.post.name}"