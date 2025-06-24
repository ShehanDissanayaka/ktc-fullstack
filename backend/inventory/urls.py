from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    GroupMasterViewSet,
    TypeMasterViewSet,
    CategoryMasterViewSet,
    ItemMasterViewSet,
    generate_price_list_pdf,
    generate_item_pdf,
    QuotationHeaderViewSet,
    generate_quotation_pdf,
)

router = DefaultRouter()
router.register(r'groupMasters', GroupMasterViewSet)
router.register(r'typeMasters', TypeMasterViewSet)
router.register(r'categoryMasters', CategoryMasterViewSet)
router.register(r'item', ItemMasterViewSet)
router.register(r'quotation', QuotationHeaderViewSet, basename='quotation')

urlpatterns = [
    path('', include(router.urls)),  # REST Endpoints
    path("item/<int:id>/pdf/", generate_item_pdf, name="generate_item_pdf"),
    path("price-list/pdf/", generate_price_list_pdf, name="generate_price_list_pdf"),
    path("quotation/<int:id>/pdf/", generate_quotation_pdf, name="generate_quotation_pdf"),
]
