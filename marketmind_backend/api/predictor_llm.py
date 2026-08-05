import os
import requests
from django.conf import settings


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


def generate_prediction(symbols, question, situation=None, user_context=None):
    """
    Generate a prediction for the predictor game using a Groq-compatible HTTP inference endpoint.

    If `GROQ_API_KEY` or `GROQ_API_URL` are not set in Django settings or environment, a deterministic
    mock response is returned so the app can function during development.
    """
    prompt = _build_prompt(symbols or [], question or "", situation=situation, user_context=user_context)

    api_key = getattr(settings, 'GROQ_API_KEY', os.environ.get('GROQ_API_KEY'))
    api_url = getattr(settings, 'GROQ_API_URL', os.environ.get('GROQ_API_URL'))

    if not api_key or not api_url:
        # Mock deterministic response for development when key/url are not provided
        mock = {
            'prediction': f"MOCK: For {', '.join(symbols or ['<none>'])} — baseline: neutral.\nAssumptions: no major news.\nConfidence: low.",
            'raw': prompt,
        }
        return mock

    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
    }

    payload = {
        # Many Groq-style endpoints accept an `input` or `prompt` key; include both to be resilient.
        'input': prompt,
        'prompt': prompt,
        'max_output_tokens': 300,
        'temperature': 0.6,
    }

    try:
        resp = requests.post(api_url, json=payload, headers=headers, timeout=15)
        resp.raise_for_status()
        j = resp.json()
        # Flexible parsing to handle different response shapes
        if isinstance(j, dict):
            if 'prediction' in j:
                text = j['prediction']
            elif 'output' in j:
                out = j['output']
                text = out[0] if isinstance(out, list) and out else str(out)
            elif 'choices' in j and isinstance(j['choices'], list) and j['choices']:
                text = j['choices'][0].get('text') or j['choices'][0].get('output') or str(j['choices'][0])
            else:
                # Fallback: stringify whole body
                text = str(j)
        else:
            text = str(j)

        return {'prediction': text, 'raw': j}
    except Exception as e:
        return {'prediction': f'ERROR: {str(e)}', 'raw': None}
