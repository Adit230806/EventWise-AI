"""
gemini_service.py
Provides AI-generated traffic-operations recommendations via Google Gemini.

The service is intentionally fault-tolerant: if Gemini is unavailable (missing
API key, quota exceeded, network error, etc.) it returns a static fallback so
the rest of the triage pipeline is never interrupted.
"""
from __future__ import annotations

import logging
import os
from typing import TypedDict

logger = logging.getLogger(__name__)

# ── Fallback used whenever Gemini cannot be reached ──────────────────────────
FALLBACK: "AiInsights" = {
    "incident_summary": "AI summary unavailable",
    "traffic_impact": "Unable to generate impact assessment",
    "recommended_action": "Follow standard operating procedure",
}


class AiInsights(TypedDict):
    incident_summary: str
    traffic_impact: str
    recommended_action: str


def _get_client():
    """Lazily initialise the Gemini client. Returns None if the key is absent."""
    api_key = os.environ.get("Gemini_API_key", "").strip()
    if not api_key:
        return None
    try:
        import google.generativeai as genai  # type: ignore[import]
        genai.configure(api_key=api_key)
        return genai.GenerativeModel("gemini-2.5-flash")
    except Exception as exc:  # pragma: no cover
        logger.warning("Gemini client initialisation failed: %s", exc)
        return None


def generate_recommendation(
    *,
    event_type: str,
    cause: str,
    zone: str,
    vehicle_type: str,
    priority_label: str,
    confidence: float,
    closure_probability: float,
) -> AiInsights:
    """
    Call Gemini to produce a concise traffic-operations insight for the given
    incident profile.  Returns FALLBACK silently on any failure.
    """
    model = _get_client()
    if model is None:
        return FALLBACK

    prompt = (
        "You are an AI assistant for a city traffic operations centre. "
        "Generate a concise, actionable assessment (max 100 words total) "
        "for the following incident. Respond ONLY with three lines in this exact format:\n"
        "SUMMARY: <one sentence incident summary>\n"
        "IMPACT: <one sentence describing traffic impact>\n"
        "ACTION: <one sentence recommended action for operations staff>\n\n"
        f"Event type: {event_type}\n"
        f"Cause: {cause}\n"
        f"Zone: {zone}\n"
        f"Vehicle type: {vehicle_type}\n"
        f"Priority: {priority_label} (confidence {confidence:.1f}%)\n"
        f"Road closure probability: {closure_probability:.1f}%"
    )

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        return _parse_response(text)
    except Exception as exc:
        logger.warning("Gemini recommendation failed: %s", exc)
        return FALLBACK


def _parse_response(text: str) -> AiInsights:
    """Extract SUMMARY / IMPACT / ACTION lines from Gemini output."""
    summary = traffic_impact = action = ""

    for line in text.splitlines():
        upper = line.upper()
        if upper.startswith("SUMMARY:"):
            summary = line[len("SUMMARY:"):].strip()
        elif upper.startswith("IMPACT:"):
            traffic_impact = line[len("IMPACT:"):].strip()
        elif upper.startswith("ACTION:"):
            action = line[len("ACTION:"):].strip()

    # If parsing fails (model returned free-form text), treat whole response
    # as the recommended action so we still surface something useful.
    if not summary and not traffic_impact and not action:
        action = text[:200]  # truncate to stay reasonable

    return AiInsights(
        incident_summary=summary or FALLBACK["incident_summary"],
        traffic_impact=traffic_impact or FALLBACK["traffic_impact"],
        recommended_action=action or FALLBACK["recommended_action"],
    )
