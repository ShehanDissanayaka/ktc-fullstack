# Generated by Django 5.2.3 on 2025-06-16 16:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='itemmaster',
            name='ITEM_brand_name',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='itemmaster',
            name='ITEM_certificate',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='itemmaster',
            name='ITEM_dimension',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='itemmaster',
            name='ITEM_model_number',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='itemmaster',
            name='ITEM_name',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='itemmaster',
            name='ITEM_net_weight',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='itemmaster',
            name='ITEM_notes',
            field=models.JSONField(blank=True, default=list, null=True),
        ),
        migrations.AddField(
            model_name='itemmaster',
            name='ITEM_origin_country',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='itemmaster',
            name='ITEM_serial_number',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='itemmaster',
            name='ITEM_spec',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='itemmaster',
            name='ITEM_type_ref',
            field=models.CharField(default='UNKNOWN', max_length=10),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='itemmaster',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='item_images/'),
        ),
        migrations.AlterField(
            model_name='itemmaster',
            name='ITEM_barcode',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='itemmaster',
            name='ITEM_category',
            field=models.CharField(max_length=10),
        ),
        migrations.AlterField(
            model_name='itemmaster',
            name='ITEM_code',
            field=models.CharField(blank=True, max_length=20, unique=True),
        ),
        migrations.AlterField(
            model_name='itemmaster',
            name='ITEM_group',
            field=models.CharField(max_length=10),
        ),
        migrations.AlterField(
            model_name='itemmaster',
            name='ITEM_type',
            field=models.CharField(choices=[('warranty', 'Warranty'), ('utensil', 'Utensil'), ('spare', 'Spare Part')], max_length=10),
        ),
        migrations.AlterField(
            model_name='itemmaster',
            name='ITEM_uom',
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
    ]
