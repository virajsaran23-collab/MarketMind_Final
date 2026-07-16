from unittest.mock import patch

from django.contrib.auth.models import User
from django.core.management import call_command
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Asset, Trade, UserChallenge, GameChallenge, LeaderboardEntry
from .views import fetch_and_create_asset, sync_user_challenges
from .mentor import build_llm_prompt, extract_symbols, generate_reply


class ChallengeSyncTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='tester', password='testpass')
        self.asset = Asset.objects.create(
            id='AAPL',
            symbol='AAPL',
            name='Apple',
            category='Stocks',
            last_price=100.0,
            sector='Technology',
        )

    def test_sync_user_challenges_creates_defaults_and_marks_first_trade_complete(self):
        Trade.objects.create(user=self.user, asset=self.asset, mode='buy', shares=1, price=100.0, total=100.0)

        sync_user_challenges(self.user)

        self.assertTrue(GameChallenge.objects.filter(slug='first_trade').exists())
        challenge = UserChallenge.objects.get(user=self.user, challenge__slug='first_trade')
        self.assertEqual(challenge.status, 'complete')
        self.assertGreaterEqual(challenge.progress, 1)


class LeaderboardTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='leaderboard-user', password='testpass')
        self.client = APIClient()

    def test_leaderboard_lists_new_users_even_before_they_earn_tokens(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/leaderboard/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], self.user.username)


class SeedDataTests(TestCase):
    def test_seed_data_cleans_previous_demo_leaderboard_entries(self):
        demo_user = User.objects.create_user(username='aria_mehta', password='demo1234')
        LeaderboardEntry.objects.create(
            user=demo_user,
            rank=1,
            portfolio=482400,
            token_count=382,
            learning_score=9840,
            badge='Market Legend',
            accuracy=94,
            handle='@aria',
        )

        call_command('seed_data')

        self.assertFalse(LeaderboardEntry.objects.filter(user__username='aria_mehta').exists())


class MentorReplyTests(TestCase):
    def test_build_llm_prompt_includes_market_context(self):
        prompt = build_llm_prompt(
            'what should I buy today?',
            [{'symbol': 'AAPL', 'price': 200.0, 'change': 2.5, 'name': 'Apple'}],
            [{'symbol': 'AAPL', 'shares': 2, 'return_pct': 10.0}],
            50000.0,
        )

        self.assertIn('AAPL', prompt)
        self.assertIn('50,000.00', prompt)
        self.assertIn('what should I buy today?', prompt)

    def test_buy_requests_use_market_momentum_when_available(self):
        reply = generate_reply(
            'what should I buy today?',
            [{'symbol': 'AAPL', 'price': 200.0, 'change': 2.5, 'name': 'Apple'}],
            [],
            50000.0,
        )

        self.assertIn('AAPL', reply)
        self.assertIn('200.00', reply)

    def test_generate_reply_stays_deterministic_even_if_llm_is_available(self):
        with patch('api.mentor.USE_LLM_MENTOR', False):
            with patch('api.mentor.call_llm', return_value='LLM response'):
                reply = generate_reply(
                    'should i buy disney?',
                    [{'symbol': 'DIS', 'price': 102.0, 'change': 1.1, 'name': 'The Walt Disney Company'}],
                    [],
                    50000.0,
                )

        self.assertIn('DIS', reply)
        self.assertNotIn('LLM response', reply)

    def test_portfolio_requests_include_cash_context(self):
        reply = generate_reply(
            'what is my portfolio?',
            [{'symbol': 'MSFT', 'price': 400.0, 'change': 1.2, 'name': 'Microsoft'}],
            [{'symbol': 'MSFT', 'return_pct': 12.0}],
            25000.0,
        )

        self.assertIn('portfolio', reply.lower())
        self.assertIn('25,000.00', reply)

    def test_extract_symbols_uses_deterministic_stock_catalog(self):
        Asset.objects.create(
            id='MSFT', symbol='MSFT', name='Microsoft', exchange='NASDAQ', category='Stocks', sector='Technology'
        )
        Asset.objects.create(
            id='AAPL', symbol='AAPL', name='Apple', exchange='NASDAQ', category='Stocks', sector='Technology'
        )
        Asset.objects.create(
            id='NVDA', symbol='NVDA', name='NVIDIA', exchange='NASDAQ', category='Stocks', sector='Technology'
        )

        symbols = extract_symbols('')

        self.assertEqual(symbols, ['AAPL', 'MSFT', 'NVDA'])

    def test_extract_symbols_matches_full_names_without_false_positives(self):
        Asset.objects.create(
            id='AAPL', symbol='AAPL', name='Apple Inc.', exchange='NASDAQ', category='Stocks', sector='Technology'
        )

        symbols = extract_symbols('I want to buy Apple Inc. today')

        self.assertEqual(symbols, ['AAPL'])

    def test_extract_symbols_matches_partial_company_names(self):
        Asset.objects.create(
            id='DIS', symbol='DIS', name='The Walt Disney Company', exchange='NYSE', category='Stocks', sector='Communication Services'
        )

        symbols = extract_symbols('Should I buy Disney?')

        self.assertEqual(symbols, ['DIS'])

    def test_extract_symbols_matches_alphabet_by_name(self):
        Asset.objects.create(
            id='GOOGL', symbol='GOOGL', name='Alphabet Inc.', exchange='NASDAQ', category='Stocks', sector='Communication Services'
        )

        symbols = extract_symbols('should i by alphabet')

        self.assertEqual(symbols[0], 'GOOGL')


class DynamicAssetTests(TestCase):
    def test_fetch_and_create_asset_creates_asset_from_search_result(self):
        class DummyResponse:
            def __init__(self, payload, status_code=200):
                self._payload = payload
                self.status_code = status_code

            def json(self):
                return self._payload

            def raise_for_status(self):
                return None

        def fake_get(url, headers=None, timeout=None, params=None):
            if 'chart' in url:
                return DummyResponse({'chart': {'result': [{'meta': {'regularMarketPrice': 123.45}}]}})
            if 'search' in url:
                return DummyResponse({'quotes': [{'shortname': 'Tesla', 'longname': 'Tesla Inc.', 'symbol': 'TSLA'}]})
            raise AssertionError(url)

        with patch('api.views.requests.get', side_effect=fake_get):
            asset = fetch_and_create_asset('Tesla')

        self.assertIsNotNone(asset)
        self.assertEqual(asset.symbol, 'TSLA')
        self.assertEqual(asset.name, 'Tesla Inc.')
        self.assertEqual(asset.category, 'Stocks')
        self.assertTrue(Asset.objects.filter(id='tsla').exists())


class LocalAIAnalyzerTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='analyzer-tester', password='testpass')
        self.client = APIClient()
        self.asset = Asset.objects.create(
            id='PLTR',
            symbol='PLTR',
            name='Palantir Technologies Inc.',
            category='Stocks',
            last_price=133.76,
            sector='Technology',
        )

    def test_analyze_asset_returns_expected_fields(self):
        from .mentor import analyze_asset
        res = analyze_asset(self.asset)
        self.assertEqual(res['symbol'], 'PLTR')
        self.assertEqual(res['name'], 'Palantir Technologies Inc.')
        self.assertIn(res['decision'], ['BUY', 'SELL', 'HOLD'])
        self.assertGreaterEqual(res['confidence'], 50)
        self.assertIn('trend', res)
        self.assertIn('momentum', res)
        self.assertIn('volatility', res)
        self.assertIn('analysis', res)

    def test_generate_reply_fuzzy_matches_typo(self):
        reply = generate_reply(
            'what about plantir?',
            [{'symbol': 'PLTR', 'price': 133.76, 'change': 1.16, 'name': 'Palantir Technologies Inc.'}],
            [],
            100000.0,
        )
        self.assertIn('Palantir Technologies Inc. (PLTR)', reply)
        self.assertIn('AI Buddy', reply)

    def test_ai_analyzer_view_returns_all_analyzed_assets(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/ai-analyzer/')
        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['symbol'], 'PLTR')


class CaseStudyQuizTests(TestCase):
    def setUp(self):
        from .models import CaseStudy
        self.user = User.objects.create_user(username='quiz-tester', password='testpass')
        self.client = APIClient()
        self.case_study = CaseStudy.objects.create(
            id='russia-ukraine',
            title='Russia-Ukraine Conflict',
            description='Test description',
            long_description='Test long description',
            difficulty='Intermediate',
            read_time='8 min',
            image='/test.png',
            tags=['Test'],
            quiz=[
                {
                    'question': 'Q1',
                    'options': ['A', 'B'],
                    'answer': 'A',
                    'explanation': 'E1'
                }
            ]
        )

    def test_complete_case_study_saves_score_and_updates_profile(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            f'/api/case-studies/{self.case_study.id}/complete/',
            {'score': 1, 'total_questions': 1},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['completion']['score'], 1)
        self.assertEqual(response.data['completion']['total_questions'], 1)

        # Check that completions is returned in challenges endpoint
        challenges_resp = self.client.get('/api/challenges/')
        self.assertEqual(challenges_resp.status_code, 200)
        self.assertEqual(len(challenges_resp.data['completions']), 1)
        self.assertEqual(challenges_resp.data['completions'][0]['id'], self.case_study.id)
        self.assertEqual(challenges_resp.data['completions'][0]['score'], 1)


