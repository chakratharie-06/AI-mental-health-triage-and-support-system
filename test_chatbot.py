"""
Tests for chatbot functionality and triage engine integration
"""

import sys
import os

# Ensure backend directory is in python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from triage_engine import triage_engine


def test_analyze_severity():
    """Test analyze_severity method used by app.py"""
    severity, reason, intensity = triage_engine.analyze_severity("I'm feeling stressed")
    assert severity in ["RED", "YELLOW", "GREEN"], "Invalid severity"
    assert intensity >= 0, "Invalid intensity"


def test_detect_mood():
    """Test detect_mood method used by app.py"""
    mood, confidence, reason = triage_engine.detect_mood("I'm feeling anxious and worried")
    assert mood in ['happy', 'sad', 'anxious', 'angry', 'stressed', 'calm', 'confused', None], "Invalid mood"


def test_generate_rule_based_response():
    """Test generate_rule_based_response method used by app.py"""
    response = triage_engine.generate_rule_based_response(
        text="I can't sleep",
        severity="YELLOW",
        history=[],
        detected_mood="anxious"
    )
    assert response and len(response) > 0, "Empty response"


def test_get_coping_strategy():
    """Test get_coping_strategy method used by app.py"""
    strategy = triage_engine.get_coping_strategy("anxious", 6)
    assert strategy is not None, "Coping strategy should not be None"


def test_extract_emojis():
    """Test extract_emojis method used by app.py"""
    emojis = triage_engine.extract_emojis("I'm feeling 😢 and 😰")
    assert isinstance(emojis, list), "Should return list"
    assert len(emojis) == 2, "Should extract 2 emojis"


if __name__ == "__main__":
    print("=" * 60)
    print("CHATBOT FUNCTIONALITY TEST")
    print("=" * 60)
    test_analyze_severity()
    print("✓ Test 1: analyze_severity passed")
    test_detect_mood()
    print("✓ Test 2: detect_mood passed")
    test_generate_rule_based_response()
    print("✓ Test 3: generate_rule_based_response passed")
    test_get_coping_strategy()
    print("✓ Test 4: get_coping_strategy passed")
    test_extract_emojis()
    print("✓ Test 5: extract_emojis passed")
    print("=" * 60)
    print("✅ ALL CHATBOT METHODS WORKING!")
    print("=" * 60)
