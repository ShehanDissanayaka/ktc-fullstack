from rest_framework import serializers
from .models import GroupMaster, TypeMaster, CategoryMaster, ItemMaster, QuotationHeader, QuotationDetail

class GroupMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupMaster
        fields = '__all__'

class TypeMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = TypeMaster
        fields = '__all__'

class CategoryMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoryMaster
        fields = '__all__'


class ItemMasterSerializer(serializers.ModelSerializer):
    ITEM_notes = serializers.CharField(allow_null=True, required=False)

    class Meta:
        model = ItemMaster
        fields = '__all__'

    def validate(self, data):
        item_type = data.get('ITEM_type')
        serial_number = data.get('ITEM_serial_number')

        if item_type == 'warranty' and not serial_number:
            raise serializers.ValidationError({"ITEM_serial_number": "Serial Number is required for warranty items."})
        
        return data

class QuotationDetailSerializer(serializers.ModelSerializer):
    item_description = serializers.CharField(source='QUD_item.ITEM_description', read_only=True)

    class Meta:
        model = QuotationDetail
        fields = [
            "QUD_line_no",
            "QUD_item",
            "item_description",
            "QUD_rate",
            "QUD_qty",
            "QUD_remark",
            "QUD_warranty",
        ]


class QuotationHeaderSerializer(serializers.ModelSerializer):
    details = QuotationDetailSerializer(many=True)

    class Meta:
        model = QuotationHeader
        fields = [
            "id",
            "QUH_code",
            "QUH_pay_type",
            "QUH_validity",
            "QUH_location",
            "QUH_your_ref",
            "QUH_customer_name",
            "QUH_customer_address",
            "QUH_customer_contact",
            "QUH_attention",
            "QUH_date",
            "QUH_quatation_date",
            "QUH_gross_value",
            "QUH_net_value",
            "details",
        ]

    def create(self, validated_data):
        details_data = validated_data.pop("details")
        header = QuotationHeader.objects.create(**validated_data)
        for item_data in details_data:
            QuotationDetail.objects.create(QUD_quotation=header, **item_data)
        return header


from rest_framework import serializers
from .models import Customer

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'


from rest_framework import serializers
from .models import InvoiceHeader, InvoiceDetail

class InvoiceDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceDetail
        exclude = []
        read_only_fields = ['INVOICE_D_h']


class InvoiceHeaderSerializer(serializers.ModelSerializer):
    details = InvoiceDetailSerializer(many=True)

    class Meta:
        model = InvoiceHeader
        fields = '__all__'

    def create(self, validated_data):
        details_data = validated_data.pop('details')
        header = InvoiceHeader.objects.create(**validated_data)
        for detail in details_data:
            InvoiceDetail.objects.create(INVOICE_D_h=header, **detail)
        return header
