from django.db import models


class GroupMaster(models.Model):
    GROUP_code = models.CharField(max_length=10, unique=True)
    GROUP_description = models.TextField()

    def __str__(self):
        return self.GROUP_code

class TypeMaster(models.Model):
    TYPE_code = models.CharField(max_length=10, unique=True)
    TYPE_description = models.CharField(max_length=100)
    TYPE_active = models.BooleanField(default=True)
    TYPE_use_order_form = models.BooleanField(default=False, null=True)

    def __str__(self):
        return self.TYPE_code

class CategoryMaster(models.Model):
    CATEGORY_code = models.CharField(max_length=4, unique=True)
    CATEGORY_description = models.CharField(max_length=100)
    CATEGORY_active = models.BooleanField(default=True)

    def __str__(self):
        return self.CATEGORY_description

import uuid

from cloudinary.models import CloudinaryField
class ItemMaster(models.Model):
    ITEM_TYPE_CHOICES = [
        ('warranty', 'Warranty'),
        ('non-warranty', 'Non-Warranty'),
        ('utensil', 'Utensil'),
        ('spare', 'Spare Part'),
    ]

    ITEM_id = models.BigAutoField(primary_key=True)
    ITEM_code = models.CharField(max_length=20, unique=True, blank=True)

    ITEM_type = models.CharField(max_length=12, choices=ITEM_TYPE_CHOICES)
    ITEM_group = models.CharField(max_length=10)  # Can be ForeignKey to GroupMaster
    ITEM_type_ref = models.CharField(max_length=10)  # rename to avoid field conflict
    ITEM_category = models.CharField(max_length=10)

    ITEM_description = models.CharField(max_length=600, blank=True, null=True)
    ITEM_uom = models.CharField(max_length=10, blank=True, null=True)

    ITEM_reorder_level = models.DecimalField(max_digits=23, decimal_places=3, blank=True, null=True)
    ITEM_reorder_qty = models.DecimalField(max_digits=23, decimal_places=3, blank=True, null=True)
    ITEM_max_level = models.DecimalField(max_digits=23, decimal_places=3, blank=True, null=True)
    ITEM_min_level = models.DecimalField(max_digits=23, decimal_places=3, blank=True, null=True)

    ITEM_purchase_price = models.DecimalField(max_digits=22, decimal_places=2, blank=True, null=True)
    ITEM_min_selling_price = models.DecimalField(max_digits=22, decimal_places=2, blank=True, null=True)
    ITEM_normal_selling_price = models.DecimalField(max_digits=22, decimal_places=2, blank=True, null=True)
    ITEM_cash_selling_price = models.DecimalField(max_digits=22, decimal_places=2, blank=True, null=True)
    ITEM_credit_selling_price = models.DecimalField(max_digits=22, decimal_places=2, blank=True, null=True)

    ITEM_invoicable = models.BooleanField(blank=True, null=True)
    ITEM_active = models.BooleanField(blank=True, null=True)
    ITEM_warranty = models.IntegerField(blank=True, null=True)

    ITEM_has_barcode = models.BooleanField(blank=True, null=True)
    ITEM_barcode = models.CharField(max_length=100, blank=True, null=True)

    # New fields from requirements
    ITEM_serial_number = models.CharField(max_length=100, blank=True, null=True)
    ITEM_model_number = models.CharField(max_length=100, blank=True, null=True)
    ITEM_spec = models.CharField(max_length=255, blank=True, null=True)
    ITEM_brand_name = models.CharField(max_length=100, blank=True, null=True)
    ITEM_origin_country = models.CharField(max_length=100, blank=True, null=True)
    ITEM_certificate = models.CharField(max_length=100, blank=True, null=True)

    ITEM_name = models.CharField(max_length=100, blank=True, null=True)
    power = models.CharField(max_length=100, blank=True, null=True)
    voltage = models.CharField(max_length=100, blank=True, null=True)
    temp_range = models.CharField(max_length=100, blank=True, null=True)
    housing_material = models.CharField(max_length=100, blank=True, null=True)
    ITEM_dimension = models.CharField(max_length=100, blank=True, null=True)
    ITEM_net_weight = models.CharField(max_length=100, blank=True, null=True)

    ITEM_notes = models.JSONField(default=list, blank=True, null=True)
    image = CloudinaryField('image', blank=True, null=True)

    class Meta:
        db_table = "INV_Item_Master"
        managed = True

    def save(self, *args, **kwargs):
        # Auto-generate code for warranty items
        if self.ITEM_type == 'warranty' and not self.ITEM_code:
            self.ITEM_code = f"W-{uuid.uuid4().hex[:6].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.ITEM_code


class QuotationHeader(models.Model):
    QUH_code = models.CharField(max_length=20, unique=True)
    QUH_pay_type = models.CharField(max_length=20, blank=True, null=True)
    QUH_validity = models.IntegerField()
    QUH_location = models.CharField(max_length=100, blank=True, null=True)
    QUH_your_ref = models.CharField(max_length=100, blank=True, null=True)
    
    QUH_customer_name = models.CharField(max_length=255)
    QUH_customer_address = models.TextField()
    QUH_customer_contact = models.CharField(max_length=100, blank=True, null=True)

    QUH_attention = models.CharField(max_length=100, blank=True, null=True)
    QUH_date = models.DateField()
    QUH_quatation_date = models.DateField()
    QUH_gross_value = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    QUH_net_value = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)

    def __str__(self):
        return self.QUH_code


class QuotationDetail(models.Model):
    QUD_quotation = models.ForeignKey(QuotationHeader, related_name='details', on_delete=models.CASCADE)
    QUD_item = models.ForeignKey(ItemMaster, on_delete=models.PROTECT)
    QUD_line_no = models.IntegerField()
    QUD_rate = models.DecimalField(max_digits=12, decimal_places=2)
    QUD_qty = models.DecimalField(max_digits=12, decimal_places=2)
    QUD_remark = models.TextField(blank=True, null=True)
    QUD_warranty = models.BooleanField(default=False)

    def total(self):
        return self.QUD_rate * self.QUD_qty


class Customer(models.Model):
    CUSTOMER_code = models.CharField(max_length=15, unique=True)
    CUSTOMER_group = models.IntegerField()
    CUSTOMER_area = models.IntegerField()
    CUSTOMER_name = models.CharField(max_length=150)
    CUSTOMER_title = models.CharField(max_length=20, null=True, blank=True)
    CUSTOMER_title_id = models.IntegerField(null=True, blank=True)
    CUSTOMER_address = models.CharField(max_length=400, null=True, blank=True)
    CUSTOMER_tele_1 = models.CharField(max_length=50, null=True, blank=True)
    CUSTOMER_tele_2 = models.CharField(max_length=50, null=True, blank=True)
    CUSTOMER_tele_mobile = models.CharField(max_length=50, null=True, blank=True)
    CUSTOMER_fax = models.CharField(max_length=50, null=True, blank=True)
    CUSTOMER_email = models.EmailField(max_length=100, null=True, blank=True)
    CUSTOMER_contact_person = models.CharField(max_length=150, null=True, blank=True)
    CUSTOMER_contact_person_title = models.CharField(max_length=20, null=True, blank=True)
    CUSTOMER_contact_person_title_id = models.IntegerField(null=True, blank=True)
    CUSTOMER_term = models.IntegerField()
    CUSTOMER_vat_number = models.CharField(max_length=20, null=True, blank=True)
    CUSTOMER_credit_limit = models.DecimalField(max_digits=22, decimal_places=2, null=True, blank=True)
    CUSTOMER_creidt_period = models.BigIntegerField(null=True, blank=True)
    CUSTOMER_account_number = models.IntegerField()
    CUSTOMER_lock = models.BooleanField(default=False)
    CUSTOMER_created_user_session = models.BigIntegerField(null=True, blank=True)
    CUSTOMER_created_datetime = models.DateTimeField(null=True, blank=True)
    CUSTOMER_last_edited_user_session = models.BigIntegerField(null=True, blank=True)
    CUSTOMER_last_edited_datetime = models.DateTimeField(null=True, blank=True)
    CUSTOMER_prefix_id = models.BigIntegerField()
    CUSTOMER_prefix_number = models.IntegerField()

    def __str__(self):
        return self.CUSTOMER_name


class InvoiceHeader(models.Model):
    INVOICE_H_id = models.BigAutoField(primary_key=True)
    INVOICE_H_location = models.CharField(max_length=100)
    INVOICE_H_number = models.CharField(max_length=20)
    INVOICE_H_code = models.CharField(max_length=20)
    INVOICE_H_token = models.CharField(max_length=50, blank=True, null=True)
    INVOICE_H_sales_rep = models.CharField(max_length=100, blank=True, null=True)
    INVOICE_H_datetime = models.DateTimeField(auto_now_add=True)
    INVOICE_H_customer = models.ForeignKey('Customer', on_delete=models.PROTECT)
    INVOICE_H_payment_term = models.CharField(max_length=20)
    INVOICE_H_total_discount_value = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    INVOICE_H_total_discount_type = models.CharField(max_length=10, choices=[("Value", "Value"), ("Percentage", "Percentage")])
    INVOICE_H_total_discount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    INVOICE_H_processed = models.BooleanField(default=False)
    INVOICE_H_grand_total = models.DecimalField(max_digits=12, decimal_places=2)
    INVOICE_H_commision = models.DecimalField(max_digits=10, decimal_places=2)
    INVOICE_H_user = models.CharField(max_length=100)
    INVOICE_H_type = models.CharField(max_length=20, default='Cash')  # or 'Credit', etc.
    INVOICE_H_remakrs = models.TextField(blank=True, null=True)

    class Meta:
        db_table = "INV_Invoice_H"

class InvoiceDetail(models.Model):
    INVOICE_D_id = models.BigAutoField(primary_key=True)
    INVOICE_D_h = models.ForeignKey(InvoiceHeader, related_name="details", on_delete=models.CASCADE)
    INVOICE_D_item = models.ForeignKey('ItemMaster', on_delete=models.PROTECT)
    INVOICE_D_qty = models.DecimalField(max_digits=10, decimal_places=2)
    INVOICE_D_rate = models.DecimalField(max_digits=10, decimal_places=2)
    INVOICE_D_discount_value = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    INVOICE_D_discount_type = models.CharField(max_length=10, choices=[("Value", "Value"), ("Percentage", "Percentage")])
    INVOICE_D_discount_total = models.DecimalField(max_digits=10, decimal_places=2)
    INVOICE_D_warranty_month = models.IntegerField(default=0)
    INVOICE_D_vat = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    INVOICE_D_vat_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    INVOICE_D_sales_rep = models.CharField(max_length=100, blank=True, null=True)
    INVOICE_D_qty_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    class Meta:
        db_table = "INV_Invoice_D"


