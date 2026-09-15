from rest_framework.routers import DefaultRouter

from .views import CategoryViewSet, GameViewSet, PostViewSet

router = DefaultRouter()

router.register("categories", CategoryViewSet, basename="category")
router.register("games", GameViewSet, basename="game")
router.register("posts", PostViewSet, basename="post")

urlpatterns = router.urls