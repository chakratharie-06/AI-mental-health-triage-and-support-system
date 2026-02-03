"""
Test suite for Enhanced Distress Detection System
Run with: python test_triage.py
"""

import sys
import os
sys.path.append(os.path.dirname(__file__))

from triage_engine import enhanced_triage_engine

def test_low_distress():
    """Test LOW distress detection"""
    print("\n" + "="*60)
    print("TEST 1: LOW DISTRESS DETECTION")
    print("="*60)
    
    test_cases = [
        "I'm a bit tired from work today",
        "Feeling slightly stressed about the exam tomorrow",
        "Traffic was frustrating but I'm okay now"
    ]
    
    for text in test_cases:
        print(f"\n📝 Input: \"{text}\"")
        result = enhanced_triage_engine.analyze_distress_enhanced(text)
        print(f"✅ Level: {result['distress_level']}")
        print(f"📊 Confidence: {result['confidence']}")
        print(f"💬 Rationale: {result['rationale']}")
        
        assert result['distress_level'] == 'low', f"Expected 'low', got '{result['distress_level']}'"
        assert result['confidence'] >= 0.60, f"Confidence too low: {result['confidence']}"
        print("✓ PASSED")

def test_medium_distress():
    """Test MEDIUM distress detection"""
    print("\n" + "="*60)
    print("TEST 2: MEDIUM DISTRESS DETECTION")
    print("="*60)
    
    test_cases = [
        "I can't handle this anymore, everything is too much",
        "I feel like I'm drowning and can't cope",
        "I'm avoiding everyone and just want to hide"
    ]
    
    for text in test_cases:
        print(f"\n📝 Input: \"{text}\"")
        result = enhanced_triage_engine.analyze_distress_enhanced(text)
        print(f"✅ Level: {result['distress_level']}")
        print(f"📊 Confidence: {result['confidence']}")
        print(f"💬 Rationale: {result['rationale']}")
        
        assert result['distress_level'] == 'medium', f"Expected 'medium', got '{result['distress_level']}'"
        assert result['confidence'] >= 0.70, f"Confidence too low: {result['confidence']}"
        print("✓ PASSED")

def test_high_distress():
    """Test HIGH distress (crisis) detection"""
    print("\n" + "="*60)
    print("TEST 3: HIGH DISTRESS (CRISIS) DETECTION")
    print("="*60)
    
    test_cases = [
        "I want to end it all, there's no point anymore",
        "I'm going to hurt myself, there's no way out",
        "I feel like I want to die, I can't escape this"
    ]
    
    for text in test_cases:
        print(f"\n📝 Input: \"{text}\"")
        result = enhanced_triage_engine.analyze_distress_enhanced(text)
        print(f"✅ Level: {result['distress_level']}")
        print(f"📊 Confidence: {result['confidence']}")
        print(f"💬 Rationale: {result['rationale']}")
        
        assert result['distress_level'] == 'high', f"Expected 'high', got '{result['distress_level']}'"
        assert result['confidence'] >= 0.85, f"Confidence too low for crisis: {result['confidence']}"
        assert 'Tele MANAS' in str(result['suggested_actions']), "Missing helpline in HIGH distress"
        assert '14416' in str(result['suggested_actions']), "Missing helpline number"
        print("✓ PASSED")

def test_voice_integration():
    """Test voice metadata integration"""
    print("\n" + "="*60)
    print("TEST 4: VOICE METADATA INTEGRATION")
    print("="*60)
    
    # Test 1: Text says fine, but voice indicates distress
    print("\n📝 Input: \"I'm fine\"")
    print("🎤 Voice: {tone: 'crying', pace: 'slow', pauses: 'frequent'}")
    
    result = enhanced_triage_engine.analyze_distress_enhanced(
        "I'm fine",
        voice_metadata={
            'tone': 'crying',
            'pace': 'slow',
            'pauses': 'frequent'
        }
    )
    
    print(f"✅ Level: {result['distress_level']}")
    print(f"📊 Confidence: {result['confidence']}")
    print(f"💬 Rationale: {result['rationale']}")
    print(f"🎤 Voice Used: {result['voice_cues_used']}")
    
    assert result['voice_cues_used'] == True, "Voice cues not used"
    assert 'crying' in result['rationale'].lower(), "Voice tone not in rationale"
    print("✓ PASSED")

def test_confidence_scoring():
    """Test confidence scoring accuracy"""
    print("\n" + "="*60)
    print("TEST 5: CONFIDENCE SCORING")
    print("="*60)
    
    # Single weak indicator
    result1 = enhanced_triage_engine.analyze_distress_enhanced("I'm a bit tired")
    print(f"\n📝 Single weak indicator: confidence = {result1['confidence']}")
    
    # Multiple strong indicators
    result2 = enhanced_triage_engine.analyze_distress_enhanced(
        "I want to die, there's no point, I'm trapped with no way out"
    )
    print(f"📝 Multiple strong indicators: confidence = {result2['confidence']}")
    
    assert result2['confidence'] > result1['confidence'], "Multiple indicators should have higher confidence"
    assert result2['confidence'] >= 0.90, f"Crisis with multiple indicators should be 0.90+, got {result2['confidence']}"
    print("✓ PASSED")

def test_output_structure():
    """Test that output structure is correct"""
    print("\n" + "="*60)
    print("TEST 6: OUTPUT STRUCTURE VALIDATION")
    print("="*60)
    
    result = enhanced_triage_engine.analyze_distress_enhanced("I'm feeling stressed")
    
    required_keys = [
        'distress_level',
        'rationale',
        'confidence',
        'limitations',
        'suggested_actions',
        'detected_indicators',
        'voice_cues_used'
    ]
    
    print("\n🔍 Checking required keys...")
    for key in required_keys:
        assert key in result, f"Missing required key: {key}"
        print(f"  ✓ {key}")
    
    print("\n🔍 Checking value types...")
    assert result['distress_level'] in ['low', 'medium', 'high'], "Invalid distress level"
    print(f"  ✓ distress_level is valid: {result['distress_level']}")
    
    assert isinstance(result['confidence'], float), "Confidence must be float"
    assert 0.0 <= result['confidence'] <= 1.0, "Confidence must be 0.0-1.0"
    print(f"  ✓ confidence is valid float: {result['confidence']}")
    
    assert isinstance(result['suggested_actions'], list), "Suggested actions must be list"
    assert len(result['suggested_actions']) > 0, "Suggested actions cannot be empty"
    print(f"  ✓ suggested_actions is non-empty list: {len(result['suggested_actions'])} items")
    
    assert result['limitations'] == enhanced_triage_engine.disclaimer, "Disclaimer must be present"
    print(f"  ✓ limitations/disclaimer present")
    
    print("\n✓ ALL STRUCTURE CHECKS PASSED")

def test_safety_validation():
    """Test safety validation requirements"""
    print("\n" + "="*60)
    print("TEST 7: SAFETY VALIDATION")
    print("="*60)
    
    # High distress must include helplines
    result = enhanced_triage_engine.analyze_distress_enhanced("I want to kill myself")
    
    actions_str = ' '.join(result['suggested_actions'])
    
    print("\n🔍 Checking HIGH distress safety features...")
    assert '14416' in actions_str or 'Tele MANAS' in actions_str, "Missing Tele MANAS helpline"
    print("  ✓ Tele MANAS helpline present")
    
    assert '112' in actions_str or 'emergency' in actions_str.lower(), "Missing emergency number"
    print("  ✓ Emergency services present")
    
    assert result['limitations'] == enhanced_triage_engine.disclaimer, "Disclaimer missing"
    print("  ✓ Disclaimer present")
    
    assert result['distress_level'] == 'high', "Should detect as HIGH distress"
    print("  ✓ Correct distress level")
    
    print("\n✓ ALL SAFETY CHECKS PASSED")

def run_all_tests():
    """Run all tests"""
    print("\n" + "="*60)
    print("🚀 ENHANCED TRIAGE ENGINE TEST SUITE")
    print("="*60)
    
    try:
        test_low_distress()
        test_medium_distress()
        test_high_distress()
        test_voice_integration()
        test_confidence_scoring()
        test_output_structure()
        test_safety_validation()
        
        print("\n" + "="*60)
        print("✅ ALL TESTS PASSED!")
        print("="*60)
        print("\n🎉 Enhanced Triage Engine is ready for production.\n")
        
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}\n")
        raise
    except Exception as e:
        print(f"\n❌ ERROR: {e}\n")
        raise

if __name__ == "__main__":
    run_all_tests()
