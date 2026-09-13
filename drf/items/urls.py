from rest_framework.routers import DefaultRouter

from .views import CategoryViewSet, GameViewSet, ItemViewSet

router = DefaultRouter()

router.register("categories", CategoryViewSet, basename="category")
router.register("games", GameViewSet, basename="game")
router.register("items", ItemViewSet, basename="item")

urlpatterns = router.urls