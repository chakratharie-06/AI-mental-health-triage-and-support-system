"""
Quick test to verify chatbot functionality after triage engine fix
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from triage_engine import triage_engine

print("=" * 60)
print("CHATBOT FUNCTIONALITY TEST")
print("=" * 60)

# Test 1: analyze_severity (used by app.py)
print("\n✅ Test 1: analyze_severity method")
severity, reason, intensity = triage_engine.analyze_severity("I'm feeling stressed")
print(f"   Severity: {severity}")
print(f"   Reason: {reason}")
print(f"   Intensity: {intensity}")
assert severity in ["RED", "YELLOW", "GREEN"], "Invalid severity"
print("   ✓ PASSED")

# Test 2: detect_mood (used by app.py)
print("\n✅ Test 2: detect_mood method")
mood, confidence, reason = triage_engine.detect_mood("I'm feeling anxious and worried")
print(f"   Mood: {mood}")
print(f"   Confidence: {confidence}")
print(f"   Reason: {reason}")
assert mood in ['happy', 'sad', 'anxious', 'angry', 'stressed', 'calm', 'confused', None], "Invalid mood"
print("   ✓ PASSED")

# Test 3: generate_rule_based_response (CRITICAL - this was missing)
print("\n✅ Test 3: generate_rule_based_response method")
response = triage_engine.generate_rule_based_response(
    text="I can't sleep",
    severity="YELLOW",
    history=[],
    detected_mood="anxious"
)
print(f"   Response: {response[:60]}...")
assert len(response) > 0, "Empty response"
print("   ✓ PASSED")

# Test 4: get_coping_strategy (used by app.py)
print("\n✅ Test 4: get_coping_strategy method")
strategy = triage_engine.get_coping_strategy("anxious", 6)
print(f"   Strategy: {strategy[:60] if strategy else 'None'}...")
print("   ✓ PASSED")

# Test 5: extract_emojis (used by app.py)
print("\n✅ Test 5: extract_emojis method")
emojis = triage_engine.extract_emojis("I'm feeling 😢 and 😰")
print(f"   Emojis: {emojis}")
assert isinstance(emojis, list), "Should return list"
print("   ✓ PASSED")

print("\n" + "=" * 60)
print("✅ ALL CHATBOT METHODS WORKING!")
print("=" * 60)
print("\n🎉 Chatbot should now be functional!\n")
