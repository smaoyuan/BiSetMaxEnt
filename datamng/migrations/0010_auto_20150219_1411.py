# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('datamng', '0009_auto_20150219_1410'),
    ]

    operations = [
        migrations.RenameField(
            model_name='phonedoc',
            old_name='doc_id',
            new_name='doc',
        ),
        migrations.RenameField(
            model_name='phonedoc',
            old_name='phone_number',
            new_name='phone',
        ),
    ]
