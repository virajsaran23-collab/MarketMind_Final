from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class AssetQuerySet(models.QuerySet):
    def live_stocks(self):
        return self.filter(category='Stocks').exclude(symbol__icontains='TEST', name='')

    def live_assets(self):
        return self.exclude(symbol__icontains='TEST', name='')


class AssetManager(models.Manager):
    def get_queryset(self):
        return AssetQuerySet(self.model, using=self._db)

    def live_stocks(self):
        return self.get_queryset().live_stocks()

    def live_assets(self):
        return self.get_queryset().live_assets()


class Asset(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    symbol = models.CharField(max_length=30)
    name = models.CharField(max_length=200)
    exchange = models.CharField(max_length=20)
    category = models.CharField(max_length=20)
    sector = models.CharField(max_length=100, blank=True)
    last_price = models.FloatField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    objects = AssetManager()

    @property
    def price(self):
        from .services.market_data import get_quote
        return get_quote(self.symbol)["price"]

    @property
    def change(self):
        from .services.market_data import get_quote
        return get_quote(self.symbol)["change"]

    def __str__(self):
        return self.symbol


class UserProfile(models.Model):
    BADGE_CHOICES = [
        ('Market Rookie', 'Market Rookie'),
        ('Value Investor', 'Value Investor'),
        ('Trend Hunter', 'Trend Hunter'),
        ('Risk Master', 'Risk Master'),
        ('Market Legend', 'Market Legend'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    badge = models.CharField(max_length=30, choices=BADGE_CHOICES, default='Market Rookie')
    learning_score = models.IntegerField(default=0)
    risk_score = models.IntegerField(default=50)
    simulations_completed = models.IntegerField(default=0)
    portfolio_value = models.FloatField(default=100000.0)
    cash = models.FloatField(default=100000.0)
    accuracy = models.IntegerField(default=0)
    bonus_tokens = models.IntegerField(default=0)
    global_rank = models.IntegerField(default=0)

    def __str__(self):
        return self.user.username


class Holding(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='holdings')
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE)
    shares = models.FloatField(default=0)
    avg_price = models.FloatField(default=0)

    class Meta:
        unique_together = ('user', 'asset')

    def __str__(self):
        return f"{self.user.username} - {self.asset.symbol}"


class Trade(models.Model):
    MODE_CHOICES = [('buy', 'Buy'), ('sell', 'Sell')]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trades')
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE)
    mode = models.CharField(max_length=4, choices=MODE_CHOICES)
    shares = models.FloatField()
    price = models.FloatField()
    total = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} {self.mode} {self.shares} {self.asset.symbol}"


class PortfolioSnapshot(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='snapshots')
    value = models.FloatField()
    cash = models.FloatField()
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['recorded_at']

    def __str__(self):
        return f"{self.user.username} {self.recorded_at} {self.value}"


class CaseStudy(models.Model):
    DIFFICULTY_CHOICES = [
        ('Beginner', 'Beginner'),
        ('Intermediate', 'Intermediate'),
        ('Advanced', 'Advanced'),
    ]
    id = models.CharField(max_length=50, primary_key=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    long_description = models.TextField()
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES)
    read_time = models.CharField(max_length=20)
    image = models.CharField(max_length=200)
    tags = models.JSONField(default=list)

    def __str__(self):
        return self.title


class GameChallenge(models.Model):
    CATEGORY_CHOICES = [
        ('achievement', 'Achievement'),
        ('daily', 'Daily Task'),
    ]
    slug = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=150)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    token_reward = models.PositiveIntegerField(default=0)
    target_value = models.FloatField(default=0)
    active = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0)

    class Meta:
        ordering = ['category', 'sort_order', 'name']

    def __str__(self):
        return self.name


class UserChallenge(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('complete', 'Complete'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='challenges')
    challenge = models.ForeignKey(GameChallenge, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    progress = models.FloatField(default=0)
    completed_at = models.DateTimeField(null=True, blank=True)
    date = models.DateField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'challenge', 'date')
        ordering = ['challenge__category', 'challenge__sort_order']

    def __str__(self):
        return f"{self.user.username} - {self.challenge.name}"


class LeaderboardEntry(models.Model):
    BADGE_CHOICES = [
        ('Market Rookie', 'Market Rookie'),
        ('Value Investor', 'Value Investor'),
        ('Trend Hunter', 'Trend Hunter'),
        ('Risk Master', 'Risk Master'),
        ('Market Legend', 'Market Legend'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='leaderboard')
    rank = models.IntegerField(default=0)
    portfolio = models.FloatField(default=0)
    learning_score = models.IntegerField(default=0)
    badge = models.CharField(max_length=30, choices=BADGE_CHOICES, default='Market Rookie')
    accuracy = models.IntegerField(default=0)
    handle = models.CharField(max_length=50, default='')
    token_count = models.IntegerField(default=0)

    class Meta:
        ordering = ['rank']

    def __str__(self):
        return f"#{self.rank} {self.user.username}"
