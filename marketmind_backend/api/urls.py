from django.urls import path
from . import views

urlpatterns = [
    path('auth/register/', views.register),
    path('auth/login/', views.user_login),
    path('auth/logout/', views.user_logout),
    path('auth/me/', views.me),

    path('assets/', views.assets_list),
    path('assets/<str:asset_id>/', views.asset_detail),
    path('assets/<str:asset_id>/candles/', views.asset_candles),

    path('portfolio/', views.portfolio),
    path('portfolio/history/', views.portfolio_history),
    path('trade/', views.trade),
    path('trades/', views.trade_history),

    path('case-studies/', views.case_studies),
    path('case-studies/<str:study_id>/', views.case_study_detail),
    path('case-studies/<str:study_id>/complete/', views.complete_case_study),

    path('leaderboard/', views.leaderboard),

    path('analytics/', views.analytics),
    path('simulation/complete/', views.complete_simulation),
    path('mentor/', views.mentor),
    path('challenges/', views.challenges),
    path('ai-analyzer/', views.ai_analyzer),
]
