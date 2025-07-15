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
from weasyprint import HTML
from django.http import HttpResponse
from .models import ItemMaster
from django.utils import timezone
import base64, requests

def generate_price_list_pdf(request):
    print("📥 Called: generate_price_list_pdf")
    items = []

    try:
        for obj in ItemMaster.objects.all().order_by('ITEM_model_number'):
            print(f"🔄 Processing item: {obj.ITEM_code}")

            image_data = None
            try:
                if obj.image:
                    image_url = request.build_absolute_uri(obj.image.url)
                    response = requests.get(image_url)
                    if response.status_code == 200:
                        image_data = base64.b64encode(response.content).decode('utf-8')
                    else:
                        print(f"⚠️ Could not fetch image: {response.status_code}")
            except Exception as e:
                print(f"🚨 Error loading image for {obj.ITEM_code}: {e}")

            description = f"<b>{obj.ITEM_name}</b><br/>{obj.ITEM_description or ''}"

            items.append({
                'no': obj.ITEM_id,
                'image_base64': image_data,
                'description': description,
                'price': f"LKR {obj.ITEM_normal_selling_price:,.2f}",
                'special_price': obj.ITEM_purchase_price,
                'label_tag': obj.ITEM_name,
            })

        template = get_template("price_list_template.html")
        html_string = template.render({"items": items, "now": timezone.now()})
        pdf_file = HTML(string=html_string, base_url=request.build_absolute_uri()).write_pdf()

        response = HttpResponse(pdf_file, content_type='application/pdf')
        response['Content-Disposition'] = 'inline; filename="price_list.pdf"'
        return response

    except Exception as e:
        print("🚨 PDF generation error:", e)
        return HttpResponse("PDF generation failed", status=500)





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


from rest_framework import status
from rest_framework.response import Response
from rest_framework import viewsets
from .models import Customer
from .serializers import CustomerSerializer

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("❌ Validation Errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


from rest_framework import viewsets
from .models import InvoiceHeader
from .serializers import InvoiceHeaderSerializer

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = InvoiceHeader.objects.all()
    serializer_class = InvoiceHeaderSerializer

from django.http import HttpResponse
from django.template.loader import render_to_string
import weasyprint

def generate_invoice_pdf(request, pk):
    invoice = InvoiceHeader.objects.get(pk=pk)
    html = render_to_string('invoice_pdf_template.html', {'invoice': invoice})
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'filename=invoice_{pk}.pdf'
    weasyprint.HTML(string=html).write_pdf(response)
    return response


from django.shortcuts import render, get_object_or_404
from .models import InvoiceHeader, InvoiceDetail
from django.http import HttpResponse
from weasyprint import HTML

def print_invoice_by_number(request, number):
    invoice = get_object_or_404(InvoiceHeader, INVOICE_H_number=number)
    details = InvoiceDetail.objects.filter(INVOICE_D_h=invoice).select_related('INVOICE_D_item')

    subtotal = sum(d.INVOICE_D_qty * d.INVOICE_D_rate for d in details)

    # ✅ Calculate total for each item
    for d in details:
        d.INVOICE_D_total = (d.INVOICE_D_qty * d.INVOICE_D_rate) - (d.INVOICE_D_discount_value or 0)

    html_string = render(
        request,
        'invoice_print.html',
        {
            'invoice': invoice,
            'details': details,
            'subtotal': subtotal
        }
    ).content.decode('utf-8')

    if request.GET.get("pdf"):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename=invoice_{number}.pdf'
        HTML(string=html_string).write_pdf(response)
        return response
    else:
        return render(request, 'invoice_print.html', {
            'invoice': invoice,
            'details': details,
            'subtotal': subtotal
        })
