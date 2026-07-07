from django.contrib import admin
from .models import Asset, UserProfile, Holding, Trade, CaseStudy, LeaderboardEntry, GameChallenge, UserChallenge

admin.site.register(Asset)
admin.site.register(UserProfile)
admin.site.register(Holding)
admin.site.register(Trade)
admin.site.register(CaseStudy)
admin.site.register(GameChallenge)
admin.site.register(UserChallenge)
admin.site.register(LeaderboardEntry)
