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

    path('math-modules/', views.math_modules_list),
    path('math-modules/<str:slug>/', views.math_module_detail),
    path('math-modules/<str:slug>/submit-quiz/', views.submit_math_quiz),

    path('story/', views.story_mode_index),
    path('story/<str:chapter_id>/', views.story_chapter_detail),
    path('story/<str:chapter_id>/execute/', views.story_chapter_execute),

    path('leaderboard/', views.leaderboard),

    path('analytics/', views.analytics),
    path('simulation/complete/', views.complete_simulation),
    path('mentor/', views.mentor),
    path('challenges/', views.challenges),
    path('ai-analyzer/', views.ai_analyzer),
]
