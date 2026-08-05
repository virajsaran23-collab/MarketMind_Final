import json
import os
import re

import requests
from django.conf import settings


DEFAULT_GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
DEFAULT_GROQ_MODEL = 'llama-3.1-8b-instant'


def _groq_config():
    api_key = getattr(settings, 'GROQ_API_KEY', os.environ.get('GROQ_API_KEY', ''))
    api_url = getattr(settings, 'GROQ_API_URL', os.environ.get('GROQ_API_URL', DEFAULT_GROQ_URL))
    model = getattr(settings, 'GROQ_MODEL', os.environ.get('GROQ_MODEL', DEFAULT_GROQ_MODEL))
    return api_key, api_url, model


def _build_prompt(symbols, question, situation=None, user_context=None):
    lines = []
    lines.append("You are a market simulation assistant for the Predictor Game.")
    if user_context:
        lines.append(f"User context: {user_context}")
    if symbols:
        lines.append("Selected symbols: " + ", ".join(symbols))
    if situation:
        lines.append(f"Situation: {situation}")
    lines.append("Question: " + question)
    lines.append("Provide a concise, scenario-aware prediction and reasoning. Be explicit about uncertainty and assumptions.")
    return "\n\n".join(lines)


def _extract_response_text(payload):
    if isinstance(payload, dict):
        if 'choices' in payload and isinstance(payload['choices'], list) and payload['choices']:
            choice = payload['choices'][0] or {}
            if isinstance(choice, dict):
                message = choice.get('message') or {}
                if isinstance(message, dict) and message.get('content'):
                    return str(message['content'])
                if choice.get('text'):
                    return str(choice['text'])
        if 'prediction' in payload:
            return str(payload['prediction'])
        if 'output' in payload:
            output = payload['output']
            if isinstance(output, list) and output:
                return str(output[0])
            return str(output)
    return str(payload)


def _post_groq(messages, temperature=0.6, max_tokens=600):
    api_key, api_url, model = _groq_config()
    if not api_key:
        return {'error': 'GROQ_API_KEY is not configured'}

    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
    }
    payload = {
        'model': model,
        'messages': messages,
        'temperature': temperature,
        'max_tokens': max_tokens,
    }

    resp = requests.post(api_url, json=payload, headers=headers, timeout=20)
    resp.raise_for_status()
    return resp.json()


def _parse_json_object(text):
    if isinstance(text, dict):
        return text

    raw = str(text or '').strip()
    if not raw:
        raise ValueError('Empty Groq response')

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        match = re.search(r'\{.*\}', raw, re.S)
        if match:
            return json.loads(match.group(0))
        raise


def generate_prediction(symbols, question, situation=None, user_context=None):
    """
    Generate a prediction for the predictor game using a Groq-compatible HTTP inference endpoint.

    If `GROQ_API_KEY` or `GROQ_API_URL` are not set in Django settings or environment, a deterministic
    mock response is returned so the app can function during development.
    """
    prompt = _build_prompt(symbols or [], question or "", situation=situation, user_context=user_context)

    api_key, api_url, model = _groq_config()

    if not api_key:
        # Mock deterministic response for development when key/url are not provided
        mock = {
            'prediction': f"MOCK: For {', '.join(symbols or ['<none>'])} — baseline: neutral.\nAssumptions: no major news.\nConfidence: low.",
            'raw': prompt,
        }
        return mock

    try:
        j = _post_groq([
            {'role': 'system', 'content': 'You are a market simulation assistant for the Predictor Game.'},
            {'role': 'user', 'content': prompt},
        ], temperature=0.6, max_tokens=300)
        return {'prediction': _extract_response_text(j), 'raw': j}
    except Exception as e:
        return {'prediction': f'ERROR: {str(e)}', 'raw': None}


def generate_situation(stock, user_context=None):
    api_key, _, _ = _groq_config()
    if not api_key:
        return {'error': 'GROQ_API_KEY is not configured'}

    stock_symbol = stock.get('symbol', 'STOCK')
    stock_name = stock.get('name', stock_symbol)
    stock_category = stock.get('category', 'General')
    stock_driver = stock.get('growth_driver', 'company fundamentals and market demand')
    stock_price = stock.get('current_price', 100)
    stock_return = stock.get('return_pct', 0)

    prompt = f"""
Generate one fresh stock market situation for a learning game.

Target stock:
- Symbol: {stock_symbol}
- Name: {stock_name}
- Category: {stock_category}
- Current price: {stock_price}
- Recent return: {stock_return}%
- Growth driver: {stock_driver}

Rules:
- Output ONLY valid JSON.
- Keep the scenario beginner-friendly but not vague.
- Make the news specific, realistic, and different from generic earnings-only prompts.
- Include 3 questions: concept, price direction, and strategy.
- Use the exact JSON schema below:
{{
  "id": "string",
  "title": "string",
  "emoji": "string",
  "category": "string",
  "headline": "string",
  "story": "string",
  "targetStockSymbol": "string",
  "basicKnowledgeTip": "string",
  "actualOutcomeDirection": "up_strong|up_moderate|flat|down",
  "actualChangePct": number,
  "explanation": "string",
  "chartData": [{{"day":"Day 0","predicted":number,"actual":number}}, {{"day":"Day 7","predicted":number,"actual":number}}, {{"day":"Day 14","predicted":number,"actual":number}}, {{"day":"Day 21","predicted":number,"actual":number}}, {{"day":"Day 30","predicted":number,"actual":number}}],
  "q1": {{"question":"string","options":[{{"id":"a","text":"string","isCorrect":true,"explanation":"string"}}, {{"id":"b","text":"string","isCorrect":false,"explanation":"string"}}, {{"id":"c","text":"string","isCorrect":false,"explanation":"string"}}]}},
  "q2": {{"question":"string","options":[{{"direction":"up_strong","label":"string","range":"string"}}, {{"direction":"up_moderate","label":"string","range":"string"}}, {{"direction":"flat","label":"string","range":"string"}}, {{"direction":"down","label":"string","range":"string"}}]}},
  "q3": {{"question":"string","options":[{{"id":"a","text":"string","isCorrect":true,"advice":"string"}}, {{"id":"b","text":"string","isCorrect":false,"advice":"string"}}, {{"id":"c","text":"string","isCorrect":false,"advice":"string"}}]}}
}}

Keep the answers educational and specific to the scenario.
"""

    try:
        payload = _post_groq([
            {'role': 'system', 'content': 'You create fresh market simulation scenarios for a stock learning game.'},
            {'role': 'user', 'content': prompt},
        ], temperature=0.9, max_tokens=1400)
        content = _extract_response_text(payload)
        scenario = _parse_json_object(content)
        return {'scenario': scenario, 'raw': payload}
    except Exception as e:
        return {'error': str(e), 'raw': None}
