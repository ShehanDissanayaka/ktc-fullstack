from django.shortcuts import render
from django.utils import timezone


from rest_framework import viewsets
from .models import GroupMaster, TypeMaster, CategoryMaster, ItemMaster
from .serializers import (
    GroupMasterSerializer,
    TypeMasterSerializer,
    CategoryMasterSerializer,
    ItemMasterSerializer
)

class GroupMasterViewSet(viewsets.ModelViewSet):
    queryset = GroupMaster.objects.all()
    serializer_class = GroupMasterSerializer

class TypeMasterViewSet(viewsets.ModelViewSet):
    queryset = TypeMaster.objects.all()
    serializer_class = TypeMasterSerializer

class CategoryMasterViewSet(viewsets.ModelViewSet):
    queryset = CategoryMaster.objects.all()
    serializer_class = CategoryMasterSerializer

class ItemMasterViewSet(viewsets.ModelViewSet):
    queryset = ItemMaster.objects.all().order_by('-ITEM_id')
    serializer_class = ItemMasterSerializer

from django.template.loader import get_template
from xhtml2pdf import pisa
from django.http import HttpResponse
from .models import ItemMaster
import os

def generate_item_pdf(request, id):
    try:
        item = ItemMaster.objects.get(pk=id)
    except ItemMaster.DoesNotExist:
        return HttpResponse("Item not found", status=404)

    template = get_template("item_pdf_template.html")
    context = {
        "item": item,
        "image_path": item.image.path if item.image else None
    }
    html = template.render(context)

    response = HttpResponse(content_type='application/pdf')
    pisa_status = pisa.CreatePDF(html, dest=response)
    if pisa_status.err:
        return HttpResponse("PDF generation failed", status=500)
    return response


from django.template.loader import get_template
from django.http import HttpResponse
from weasyprint import HTML
from .models import ItemMaster
from django.utils import timezone
import base64

def generate_price_list_pdf(request):
    items = []
    for obj in ItemMaster.objects.all().order_by('ITEM_model_number'):
        # Prepare image in Base64
        if obj.image and obj.image.path:
            with open(obj.image.path, 'rb') as img_file:
                image_data = base64.b64encode(img_file.read()).decode('utf-8')
        else:
            image_data = None  # handle missing image gracefully

        # Prepare full description (left side)
        full_description = f"""
        <b>{obj.ITEM_name}</b><br/>
        <b>Model: {obj.ITEM_model_number}</b><br/>
        <span style='color:red;'><b>Spec / Capacity: {obj.ITEM_spec}</b></span><br/>
        *** <b>{obj.ITEM_notes[3] if obj.ITEM_notes and len(obj.ITEM_notes) > 3 else ''}</b><br/>
        *** <b>{obj.ITEM_notes[4] if obj.ITEM_notes and len(obj.ITEM_notes) > 4 else ''}</b><br/>
        <span style='color:red;'><b>Brand Name: {obj.ITEM_brand_name}</b></span><br/>
        <span style='color:red;'><b>Country of Origin: {obj.ITEM_origin_country}</b></span><br/>
        <span style='color:red;'><b>Certificate: {obj.ITEM_certificate}</b></span><br/>
        """

        # Prepare label tag (right side)
        label_tag = f"""
        {obj.ITEM_name}<br/>
        Model: {obj.ITEM_model_number}<br/>
        Bowl Size: {obj.ITEM_spec}<br/>
        LKR {obj.ITEM_normal_selling_price:,.0f}/-
        """

        items.append({
            'no': obj.ITEM_id,
            'image_base64': image_data,
            'description': full_description,
            'price': f"LKR {obj.ITEM_normal_selling_price:,.2f}",
            'special_price': obj.ITEM_purchase_price,  # you can adjust discount logic here
            'label_tag': label_tag
        })

    template = get_template("price_list_template.html")
    context = {
        "items": items,
        "now": timezone.now(),
    }
    html_string = template.render(context)

    pdf_file = HTML(string=html_string).write_pdf()

    response = HttpResponse(pdf_file, content_type='application/pdf')
    response['Content-Disposition'] = 'inline; filename="price_list.pdf"'
    return response



from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from .models import QuotationHeader
from .serializers import QuotationHeaderSerializer
from django.template.loader import render_to_string
from weasyprint import HTML
import tempfile

def generate_quotation_pdf(request, id):
    quotation = get_object_or_404(QuotationHeader, id=id)
    details = quotation.details.all()

    context = {
        "header": quotation,
        "details": details,
    }

    # Render HTML
    html_string = render_to_string("quotation.html", context)

    # Generate PDF
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
        HTML(string=html_string, base_url=request.build_absolute_uri()).write_pdf(temp_file.name)

        temp_file.seek(0)
        response = HttpResponse(temp_file.read(), content_type="application/pdf")
        response["Content-Disposition"] = f'inline; filename="quotation_{quotation.QUH_code}.pdf"'
        return response

from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import QuotationHeader
from .serializers import QuotationHeaderSerializer

class QuotationHeaderViewSet(viewsets.ModelViewSet):
    """
    Provides GET, POST, PUT, PATCH, and DELETE for QuotationHeader.
    """
    serializer_class = QuotationHeaderSerializer
    queryset = QuotationHeader.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        # ✅ Validate
        serializer.is_valid(raise_exception=True)

        # ✅ Save (this creates the header and details thanks to your serializer!)
        instance = serializer.save()

        # ✅ Return the saved data, including its `id`
        return Response(serializer.data, status=status.HTTP_201_CREATED)


