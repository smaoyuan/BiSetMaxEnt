# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('datamng', '0011_auto_20150219_1411'),
    ]

    operations = [
        migrations.RenameField(
            model_name='persondoc',
            old_name='doc_id',
            new_name='doc',
        ),
        migrations.RenameField(
            model_name='persondoc',
            old_name='person_name',
            new_name='person',
        ),
    ]
