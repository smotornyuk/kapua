from django.urls import path, include
from rest_framework import routers
from django.views.generic import TemplateView
from . import views

app_name = 'tree'

urlpatterns = [
    path('', TemplateView.as_view(template_name="tree/index.html")),
    path(r'api/node/', views.NodeGeneralAPIView.as_view(), name='node'),
    path(
        r'api/node/<int:pk>',
        views.NodeSingleAPIView.as_view(),
        name='node-single'
    ),
]
