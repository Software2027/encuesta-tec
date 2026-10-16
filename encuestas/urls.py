from django.urls import path
from . import views

urlpatterns = [
    path('', views.encuesta_publica, name='encuesta_publica'),
    path('gracias/', views.gracias_view, name='gracias'),
    path('resultados/', views.resultados_view, name='resultados'),
    path('dashboard/', views.dashboard_view, name='dashboard'),
    path('api/guardar/', views.guardar_respuesta_api, name='guardar_respuesta_api'),
    path('api/estadisticas/', views.estadisticas_api, name='estadisticas_api'),
]
