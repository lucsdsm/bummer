import os

import discord
from discord.ext import commands
from django.core.exceptions import ValidationError
from django.core.validators import URLValidator

from asgiref.sync import sync_to_async

import django

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "config.settings",
)
django.setup()

from posts.models import Category, Game, Image, Post


DISCORD_TOKEN = os.environ["DISCORD_TOKEN"]
DISCORD_GUILD_ID = int(os.environ["DISCORD_GUILD_ID"])
DISCORD_ALLOWED_ROLE_ID = int(
    os.environ["DISCORD_ALLOWED_ROLE_ID"],
)

MAX_IMAGES = 8
MAX_SELECT_OPTIONS = 25


@sync_to_async
def get_root_categories() -> list[Category]:
    return list(
        Category.objects.filter(
            parent__isnull=True,
        ).order_by("name")[:MAX_SELECT_OPTIONS],
    )


@sync_to_async
def get_subcategories(
    category_id: int,
) -> list[Category]:
    return list(
        Category.objects.filter(
            parent_id=category_id,
        ).order_by("name")[:MAX_SELECT_OPTIONS],
    )


@sync_to_async
def get_games() -> list[Game]:
    return list(
        Game.objects.order_by("name")[:MAX_SELECT_OPTIONS],
    )


def user_can_submit(
    interaction: discord.Interaction,
) -> bool:
    member = interaction.user

    if not isinstance(member, discord.Member):
        return False

    return any(
        role.id == DISCORD_ALLOWED_ROLE_ID
        for role in member.roles
    )


def validate_url(url: str) -> str:
    normalized_url = url.strip()

    URLValidator(
        schemes=[
            "http",
            "https",
        ],
    )(normalized_url)

    return normalized_url


class PostLinksModal(
    discord.ui.Modal,
    title="Links do post",
):
    download_url = discord.ui.TextInput(
        label="Link para download",
        placeholder="https://...",
        style=discord.TextStyle.short,
        required=True,
        max_length=500,
    )

    image_urls = discord.ui.TextInput(
        label="Links das imagens",
        placeholder=(
            "Uma URL por linha\n"
            "https://exemplo.com/imagem-1.jpg\n"
            "https://exemplo.com/imagem-2.jpg"
        ),
        style=discord.TextStyle.paragraph,
        required=False,
        max_length=4000,
    )

    def __init__(
        self,
        *,
        name: str,
        description: str,
        category_id: int,
        subcategory_id: int | None,
        game_id: int | None,
    ):
        super().__init__()

        self.post_name = name
        self.post_description = description
        self.category_id = category_id
        self.subcategory_id = subcategory_id
        self.game_id = game_id

    async def on_submit(
        self,
        interaction: discord.Interaction,
    ) -> None:
        try:
            download_url = validate_url(str(self.download_url))

            image_urls = [
                validate_url(url)
                for url in str(self.image_urls).splitlines()
                if url.strip()
            ]

            if len(image_urls) > MAX_IMAGES:
                await interaction.response.send_message(
                    (
                        f"Envie no máximo {MAX_IMAGES} "
                        "links de imagem."
                    ),
                    ephemeral=True,
                )
                return

            category = await Category.objects.aget(
                id=(
                    self.subcategory_id
                    if self.subcategory_id
                    else self.category_id
                ),
            )

            game = None

            if self.game_id:
                game = await Game.objects.aget(
                    id=self.game_id,
                )

            post = await Post.objects.acreate(
                name=self.post_name.strip(),
                description=self.post_description.strip(),
                category=category,
                game=game,
                download_url=download_url,
                is_published=False,
            )

            for position, image_url in enumerate(image_urls):
                await Image.objects.acreate(
                    post=post,
                    image_url=image_url,
                    position=position,
                )

        except Category.DoesNotExist:
            await interaction.response.send_message(
                "Categoria ou subcategoria inválida.",
                ephemeral=True,
            )
            return

        except Game.DoesNotExist:
            await interaction.response.send_message(
                "Jogo inválido.",
                ephemeral=True,
            )
            return

        except ValidationError:
            await interaction.response.send_message(
                "Um ou mais links enviados são inválidos.",
                ephemeral=True,
            )
            return

        await interaction.response.send_message(
            (
                "Post enviado para revisão com sucesso. "
                "Ele ficará visível no site após aprovação."
            ),
            ephemeral=True,
        )

class CategorySelect(
    discord.ui.Select,
):
    def __init__(
        self,
        categories: list[Category],
    ):
        options = [
            discord.SelectOption(
                label=category.name[:100],
                value=str(category.id),
                description=category.slug[:100],
            )
            for category in categories
        ]

        super().__init__(
            placeholder="Escolha uma categoria",
            min_values=1,
            max_values=1,
            options=options,
        )

    async def callback(
        self,
        interaction: discord.Interaction,
    ) -> None:
        view = self.view

        if not isinstance(view, CategorySelectView):
            return

        if interaction.user.id != view.author_id:
            await interaction.response.send_message(
                "Somente quem iniciou o envio pode usar este menu.",
                ephemeral=True,
            )
            return

        category_id = int(self.values[0])

        category = next(
            category
            for category in view.categories
            if category.id == category_id
        )

        subcategories = await get_subcategories(category.id)

        if subcategories:
            next_view = SubcategorySelectView(
                name=view.post_name,
                description=view.post_description,
                category=category,
                subcategories=subcategories,
                author_id=view.author_id,
            )

            await interaction.response.edit_message(
                content=(
                    f"Categoria selecionada: **{category.name}**.\n"
                    "Agora selecione a subcategoria."
                ),
                view=next_view,
            )
            return

        games = await get_games()

        next_view = GameSelectView(
            name=view.post_name,
            description=view.post_description,
            category=category,
            subcategory=None,
            games=games,
            author_id=view.author_id,
        )

        await interaction.response.edit_message(
            content=(
                f"Categoria selecionada: **{category.name}**.\n"
                "Agora selecione o jogo, caso este post pertença a um."
            ),
            view=next_view,
        )
    
class CategorySelectView(
    discord.ui.View,
):
    def __init__(
        self,
        *,
        name: str,
        description: str,
        categories: list[Category],
        author_id: int,
    ):
        super().__init__(timeout=10 * 60)

        self.post_name = name
        self.post_description = description
        self.categories = categories
        self.author_id = author_id

        self.add_item(
            CategorySelect(categories),
        )

class SubcategorySelect(
    discord.ui.Select,
):
    def __init__(
        self,
        subcategories: list[Category],
    ):
        options = [
            discord.SelectOption(
                label="Nenhuma subcategoria",
                value="none",
                description="O post ficará diretamente na categoria principal.",
            ),
            *[
                discord.SelectOption(
                    label=subcategory.name[:100],
                    value=str(subcategory.id),
                    description=subcategory.slug[:100],
                )
                for subcategory in subcategories
            ],
        ]

        super().__init__(
            placeholder="Escolha uma subcategoria",
            min_values=1,
            max_values=1,
            options=options,
        )

    async def callback(
        self,
        interaction: discord.Interaction,
    ) -> None:
        view = self.view

        if not isinstance(view, SubcategorySelectView):
            return

        if interaction.user.id != view.author_id:
            await interaction.response.send_message(
                "Somente quem iniciou o envio pode usar este menu.",
                ephemeral=True,
            )
            return

        selected_value = self.values[0]
        subcategory = None

        if selected_value != "none":
            subcategory_id = int(selected_value)

            subcategory = next(
                item
                for item in view.subcategories
                if item.id == subcategory_id
            )

        games = await get_games()

        next_view = GameSelectView(
            name=view.post_name,
            description=view.post_description,
            category=view.category,
            subcategory=subcategory,
            games=games,
            author_id=view.author_id,
        )

        selected_subcategory_name = (
            subcategory.name
            if subcategory
            else "Nenhuma"
        )

        await interaction.response.edit_message(
            content=(
                f"Categoria: **{view.category.name}**\n"
                f"Subcategoria: **{selected_subcategory_name}**\n"
                "Agora selecione o jogo, caso este post pertença a um."
            ),
            view=next_view,
        )
    
class SubcategorySelectView(
    discord.ui.View,
):
    def __init__(
        self,
        *,
        name: str,
        description: str,
        category: Category,
        subcategories: list[Category],
        author_id: int,
    ):
        super().__init__(timeout=10 * 60)

        self.post_name = name
        self.post_description = description
        self.category = category
        self.subcategories = subcategories
        self.author_id = author_id

        self.add_item(
            SubcategorySelect(subcategories),
        )

class GameSelect(
    discord.ui.Select,
):
    def __init__(
        self,
        games: list[Game],
    ):
        options = [
            discord.SelectOption(
                label="Sem jogo",
                value="none",
                description="Use para ferramentas, utilitários e posts gerais.",
            ),
            *[
                discord.SelectOption(
                    label=game.name[:100],
                    value=str(game.id),
                    description=game.slug[:100],
                )
                for game in games
            ],
        ]

        super().__init__(
            placeholder="Escolha um jogo",
            min_values=1,
            max_values=1,
            options=options,
        )

    async def callback(
        self,
        interaction: discord.Interaction,
    ) -> None:
        view = self.view

        if not isinstance(view, GameSelectView):
            return

        if interaction.user.id != view.author_id:
            await interaction.response.send_message(
                "Somente quem iniciou o envio pode usar este menu.",
                ephemeral=True,
            )
            return

        selected_value = self.values[0]
        game = None

        if selected_value != "none":
            game_id = int(selected_value)

            game = next(
                item
                for item in view.games
                if item.id == game_id
            )

        next_view = ContinuePostView(
            name=view.post_name,
            description=view.post_description,
            category_id=view.category.id,
            subcategory_id=(
                view.subcategory.id
                if view.subcategory
                else None
            ),
            game_id=game.id if game else None,
            author_id=view.author_id,
        )

        subcategory_name = (
            view.subcategory.name
            if view.subcategory
            else "Nenhuma"
        )
        game_name = game.name if game else "Sem jogo"

        await interaction.response.edit_message(
            content=(
                "**Revise suas escolhas**\n"
                f"Categoria: **{view.category.name}**\n"
                f"Subcategoria: **{subcategory_name}**\n"
                f"Jogo: **{game_name}**\n\n"
                "Clique em **Adicionar links** para continuar."
            ),
            view=next_view,
        )

class GameSelectView(
    discord.ui.View,
):
    def __init__(
        self,
        *,
        name: str,
        description: str,
        category: Category,
        subcategory: Category | None,
        games: list[Game],
        author_id: int,
    ):
        super().__init__(timeout=10 * 60)

        self.post_name = name
        self.post_description = description
        self.category = category
        self.subcategory = subcategory
        self.games = games
        self.author_id = author_id

        self.add_item(
            GameSelect(games),
        )

        
class PostInfoModal(
    discord.ui.Modal,
    title="Enviar post para revisão",
):
    name = discord.ui.TextInput(
        label="Nome",
        placeholder="Ex.: Yamaha Lander 2020/21",
        max_length=180,
        required=True,
    )

    description = discord.ui.TextInput(
        label="Descrição",
        placeholder="Descreva o conteúdo do post.",
        style=discord.TextStyle.paragraph,
        required=False,
        max_length=4000,
    )

    async def on_submit(
        self,
        interaction: discord.Interaction,
    ) -> None:
        categories = await get_root_categories()

        if not categories:
            await interaction.response.send_message(
                (
                    "Não há categorias cadastradas no sistema. "
                    "Peça para um administrador criar uma categoria "
                    "antes de enviar o post."
                ),
                ephemeral=True,
            )
            return

        view = CategorySelectView(
            name=str(self.name).strip(),
            description=str(self.description).strip(),
            categories=categories,
            author_id=interaction.user.id,
        )

        await interaction.response.send_message(
            "Selecione a categoria do post.",
            view=view,
            ephemeral=True,
        )


class ContinuePostView(
    discord.ui.View,
):
    def __init__(
        self,
        *,
        name: str,
        description: str,
        category_id: int,
        subcategory_id: int | None,
        game_id: int | None,
        author_id: int,
    ):
        super().__init__(timeout=10 * 60)

        self.post_name = name
        self.post_description = description
        self.category_id = category_id
        self.subcategory_id = subcategory_id
        self.game_id = game_id
        self.author_id = author_id

    @discord.ui.button(
        label="Adicionar links",
        style=discord.ButtonStyle.success,
    )
    async def add_links(
        self,
        interaction: discord.Interaction,
        button: discord.ui.Button,
    ) -> None:
        if interaction.user.id != self.author_id:
            await interaction.response.send_message(
                "Somente quem iniciou o envio pode continuar.",
                ephemeral=True,
            )
            return

        if not user_can_submit(interaction):
            await interaction.response.send_message(
                "Você não possui permissão para enviar posts.",
                ephemeral=True,
            )
            return

        await interaction.response.send_modal(
            PostLinksModal(
                name=self.post_name,
                description=self.post_description,
                category_id=self.category_id,
                subcategory_id=self.subcategory_id,
                game_id=self.game_id,
            ),
        )


class BummerBot(commands.Bot):
    async def setup_hook(self) -> None:
        guild = discord.Object(
            id=DISCORD_GUILD_ID,
        )

        synced_commands = await self.tree.sync(
            guild=guild,
        )

        print(
            f"{len(synced_commands)} comando(s) sincronizado(s) "
            f"na guild {DISCORD_GUILD_ID}.",
        )


intents = discord.Intents.default()
intents.message_content = False


bot = BummerBot(
    command_prefix=commands.when_mentioned,
    intents=intents,
)


@bot.tree.command(
    name="enviar-post",
    description="Envia um post para revisão no catálogo.",
    guild=discord.Object(id=DISCORD_GUILD_ID),
)
async def send_post(
    interaction: discord.Interaction,
) -> None:
    if not user_can_submit(interaction):
        await interaction.response.send_message(
            "Você não possui permissão para enviar posts.",
            ephemeral=True,
        )
        return

    await interaction.response.send_modal(
        PostInfoModal(),
    )


@bot.event
async def on_ready() -> None:
    print(
        f"Bot conectado como {bot.user} "
        f"(ID: {bot.user.id})",
    )


bot.run(DISCORD_TOKEN)