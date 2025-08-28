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

from weasyprint import HTML
from django.template.loader import render_to_string
import requests, base64
from django.http import HttpResponse

def generate_item_pdf(request, id):
    try:
        item = ItemMaster.objects.get(pk=id)
    except ItemMaster.DoesNotExist:
        return HttpResponse("Item not found", status=404)

    # Fetch image from Cloudinary and encode it
    image_base64 = None
    if item.image:
        try:
            image_url = item.image.url
            response = requests.get(image_url)
            if response.status_code == 200:
                image_base64 = base64.b64encode(response.content).decode('utf-8')
        except Exception as e:
            print(f"⚠️ Failed to fetch image: {e}")

    context = {
        "item": item,
        "image_base64": image_base64,
    }

    html_string = render_to_string("item_pdf_template.html", context)
    pdf_file = HTML(string=html_string, base_url=request.build_absolute_uri()).write_pdf()

    response = HttpResponse(pdf_file, content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="item_{item.ITEM_code}.pdf"'
    return response



from django.template.loader import get_template
from weasyprint import HTML
from django.http import HttpResponse
from django.utils import timezone
from tempfile import NamedTemporaryFile
from .models import ItemMaster
import traceback


def safe_money(value, prefix="LKR"):
    """
    Safely format numeric values to currency style.
    Example: 1234.5 -> 'LKR 1,234.50'
    If value is None or invalid, return 'N/A'.
    """
    if value is None:
        return "N/A"
    try:
        return f"{prefix} {float(value):,.2f}"
    except Exception:
        return "N/A"


from django.template.loader import get_template
from weasyprint import HTML
from django.http import HttpResponse
from django.utils import timezone
from tempfile import NamedTemporaryFile
from .models import ItemMaster
import traceback

def safe_money(value, prefix="LKR"):
    if value is None:
        return "N/A"
    try:
        return f"{prefix} {float(value):,.2f}"
    except Exception:
        return "N/A"

def generate_price_list_pdf(request):
    print("📥 Called: generate_price_list_pdf")
    items = []

    try:
        for obj in ItemMaster.objects.all().order_by("ITEM_model_number")[:20]:
            print(f"🔄 Processing item: {obj.ITEM_code}")

            # ✅ Safe image handling
            image_url = None
            if obj.image:
                try:
                    raw_url = obj.image.url
                    if raw_url and "/upload/" in raw_url:
                        image_url = raw_url.replace("/upload/", "/upload/w_150,h_150,c_fit/")
                    else:
                        image_url = raw_url
                except Exception as e:
                    print(f"⚠️ Image problem for {obj.ITEM_code}: {e}")
                    image_url = None

            items.append({
                "no": obj.ITEM_id,
                "image_url": image_url,
                "name": obj.ITEM_name or "",
                "model_number": obj.ITEM_model_number or "",
                "spec": obj.ITEM_spec or "",
                "dimension": obj.ITEM_dimension or "",
                "brand_name": obj.ITEM_brand_name or "",
                "origin_country": obj.ITEM_origin_country or "",
                "certificate": obj.ITEM_certificate or "",
                "description": obj.ITEM_description or "",
                "price": safe_money(obj.ITEM_normal_selling_price),
                "special_price": safe_money(obj.ITEM_purchase_price),
                "label_tag": obj.ITEM_name or "",
                "notes": obj.ITEM_notes or [],
            })

        # Render template
        template = get_template("price_list_template.html")
        html_string = template.render({"items": items, "now": timezone.now()})

        # ✅ Stream to temp file
        with NamedTemporaryFile(delete=True) as tmp_file:
            HTML(string=html_string, base_url=request.build_absolute_uri("/")).write_pdf(tmp_file.name)
            tmp_file.seek(0)
            pdf_content = tmp_file.read()

        response = HttpResponse(pdf_content, content_type="application/pdf")
        response["Content-Disposition"] = 'inline; filename="price_list.pdf"'
        return response

    except Exception as e:
        print("🚨 PDF generation error:", e)
        traceback.print_exc()
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

from django.db.models import Sum, F, DecimalField, ExpressionWrapper
from django.db.models.functions import TruncDate
from datetime import date, timedelta
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import InvoiceHeader, InvoiceDetail, ItemMaster


class DashboardMetricsView(APIView):
    def get(self, request):
        today = date.today()
        start_14 = today - timedelta(days=13)
        start_30 = today - timedelta(days=29)
        start_month = today.replace(day=1)

        # line total per row
        line_total = ExpressionWrapper(
            F("INVOICE_D_qty") * F("INVOICE_D_rate")
            - F("INVOICE_D_discount_total")
            + F("INVOICE_D_vat"),
            output_field=DecimalField(max_digits=14, decimal_places=2),
        )

        # Today’s stats
        today_details = InvoiceDetail.objects.filter(INVOICE_D_h__INVOICE_H_datetime__date=today)
        today_revenue = today_details.aggregate(v=Sum(line_total))["v"] or 0
        items_sold_today = today_details.aggregate(q=Sum("INVOICE_D_qty"))["q"] or 0
        invoices_today = InvoiceHeader.objects.filter(INVOICE_H_datetime__date=today).count()
        avg_order_value_today = today_revenue / invoices_today if invoices_today else 0

        # ✅ Items sold today by type
        breakdown_qs = (
            today_details.values("INVOICE_D_item__ITEM_type")
            .annotate(total_qty=Sum("INVOICE_D_qty"))
        )

        item_type_distribution = {
            "warranty": 0,
            "non_warranty": 0,
            "utensil": 0,
            "spare": 0,
        }

        for row in breakdown_qs:
            t = row["INVOICE_D_item__ITEM_type"]
            if t in item_type_distribution:
                item_type_distribution[t] = float(row["total_qty"] or 0)

        # Month-to-date revenue
        mtd_revenue = (
            InvoiceDetail.objects.filter(INVOICE_D_h__INVOICE_H_datetime__date__gte=start_month)
            .aggregate(v=Sum(line_total))["v"]
            or 0
        )

        # Sales by day (last 14 days)
        last14 = (
            InvoiceDetail.objects.filter(INVOICE_D_h__INVOICE_H_datetime__date__gte=start_14)
            .annotate(d=TruncDate("INVOICE_D_h__INVOICE_H_datetime"))
            .values("d")
            .annotate(revenue=Sum(line_total), qty=Sum("INVOICE_D_qty"))
            .order_by("d")
        )
        sales_by_day = [
            {"date": r["d"].isoformat(), "revenue": float(r["revenue"] or 0), "qty": float(r["qty"] or 0)}
            for r in last14
        ]

        # Top items last 30 days
        top_items_qs = (
            InvoiceDetail.objects.filter(INVOICE_D_h__INVOICE_H_datetime__date__gte=start_30)
            .values("INVOICE_D_item__ITEM_code", "INVOICE_D_item__ITEM_name")
            .annotate(qty=Sum("INVOICE_D_qty"), revenue=Sum(line_total))
            .order_by("-qty")[:10]
        )
        top_items = [
            {
                "code": r["INVOICE_D_item__ITEM_code"],
                "name": r["INVOICE_D_item__ITEM_name"],
                "qty": float(r["qty"] or 0),
                "revenue": float(r["revenue"] or 0),
            }
            for r in top_items_qs
        ]

        # Global totals
        items_count = ItemMaster.objects.count()
        invoices_count = InvoiceHeader.objects.count()

        # ✅ Return JSON Response
        return Response({
            "kpis": {
                "todayRevenue": float(today_revenue),
                "invoicesToday": invoices_today,
                "itemsSoldToday": float(items_sold_today),
                "avgOrderValueToday": float(avg_order_value_today),
                "mtdRevenue": float(mtd_revenue),
                "itemsCount": items_count,
                "invoicesCount": invoices_count,
            },
            "salesByDay": sales_by_day,
            "topItems": top_items,
            "itemTypeDistribution": item_type_distribution,  # ✅ all 4 categories
        })