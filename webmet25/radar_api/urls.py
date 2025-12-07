from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'radar_api'

router = DefaultRouter()
router.register(r'radares', views.RadarView, 'radares_view')
router.register(r'estrategias', views.EstrategiasView, 'estrategias_view')
router.register(r'images_radares', views.RadarImageView, 'images_radares_view')
router.register(r'radares_prod', views.MinRadarProductView, 'radares_prod_view')

urlpatterns = [
    path('', include((router.urls, app_name), namespace='api')),
]

# urlpatterns = [
#                url(r'^', include(router.urls, namespace='api')),
            #    url(r'add_images/', views.AddImagesView.as_view(), name='add_images_view'),
            #    url(r'add_old_images/', views.AddOLDImagesView.as_view(), name='add_old_images_view'),
            #    ]
