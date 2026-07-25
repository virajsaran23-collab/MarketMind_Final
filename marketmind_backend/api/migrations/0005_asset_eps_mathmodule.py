from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('api', '0004_usercasestudycompletion'),
    ]

    operations = [
        migrations.AddField(
            model_name='asset',
            name='eps',
            field=models.FloatField(default=0.0),
        ),
        migrations.AddField(
            model_name='asset',
            name='shares_outstanding',
            field=models.FloatField(default=0.0),
        ),
        migrations.CreateModel(
            name='MathModule',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('slug', models.CharField(max_length=100, unique=True)),
                ('title', models.CharField(max_length=200)),
                ('concept_summary', models.TextField(blank=True)),
                ('difficulty', models.CharField(
                    choices=[('Beginner', 'Beginner'), ('Intermediate', 'Intermediate'), ('Advanced', 'Advanced')],
                    default='Beginner',
                    max_length=20,
                )),
                ('order', models.IntegerField(default=0)),
                ('badge_track', models.CharField(blank=True, max_length=100)),
                ('token_reward', models.PositiveIntegerField(default=0)),
            ],
            options={
                'ordering': ['order', 'title'],
            },
        ),
        migrations.CreateModel(
            name='UserMathModuleProgress',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(
                    choices=[
                        ('not_started', 'Not Started'),
                        ('in_progress', 'In Progress'),
                        ('complete', 'Complete'),
                    ],
                    default='not_started',
                    max_length=20,
                )),
                ('quiz_score', models.IntegerField(default=0)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('module', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.mathmodule')),
                ('user', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='math_progress',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'unique_together': {('user', 'module')},
            },
        ),
    ]
