from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Asset, UserProfile, Holding, Trade, CaseStudy, LeaderboardEntry, GameChallenge, UserChallenge, PortfolioSnapshot


class AssetSerializer(serializers.ModelSerializer):
    price = serializers.SerializerMethodField()
    change = serializers.SerializerMethodField()

    class Meta:
        model = Asset
        fields = ['id', 'symbol', 'name', 'exchange', 'category', 'sector', 'price', 'change']

    def get_price(self, obj):
        return obj.price

    def get_change(self, obj):
        return obj.change


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = '__all__'


class HoldingSerializer(serializers.ModelSerializer):
    asset = AssetSerializer(read_only=True)
    asset_id = serializers.CharField(write_only=True)
    value = serializers.SerializerMethodField()
    change = serializers.SerializerMethodField()
    return_pct = serializers.SerializerMethodField()

    class Meta:
        model = Holding
        fields = ['id', 'asset', 'asset_id', 'shares', 'avg_price', 'value', 'change', 'return_pct']

    def get_value(self, obj):
        return obj.shares * obj.asset.price

    def get_change(self, obj):
        return obj.asset.change

    def get_return_pct(self, obj):
        if obj.avg_price == 0:
            return 0
        return ((obj.asset.price - obj.avg_price) / obj.avg_price) * 100


class TradeSerializer(serializers.ModelSerializer):
    asset = AssetSerializer(read_only=True)
    asset_id = serializers.CharField(write_only=True)

    class Meta:
        model = Trade
        fields = ['id', 'asset', 'asset_id', 'mode', 'shares', 'price', 'total', 'created_at']
        read_only_fields = ['price', 'total', 'created_at']


class CaseStudySerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseStudy
        fields = '__all__'


class GameChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameChallenge
        fields = ['slug', 'name', 'description', 'category', 'token_reward', 'target_value', 'active']


class UserChallengeSerializer(serializers.ModelSerializer):
    challenge = GameChallengeSerializer(read_only=True)

    class Meta:
        model = UserChallenge
        fields = ['challenge', 'status', 'progress', 'completed_at', 'date']


class LeaderboardEntrySerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = LeaderboardEntry
        fields = ['rank', 'name', 'handle', 'portfolio', 'token_count', 'learning_score', 'badge', 'accuracy']

    def get_name(self, obj):
        return obj.user.get_full_name() or obj.user.username


class PortfolioSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioSnapshot
        fields = ['value', 'cash', 'recorded_at']


class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=6)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        return user
