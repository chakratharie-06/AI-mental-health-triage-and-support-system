"""
Enhanced Distress Detection Engine

Provides comprehensive mental health triage with:
- Auditable 3-level distress rubric (LOW/MEDIUM/HIGH)
- Confidence scoring (0.0-1.0)
- Voice input metadata support
- Structured JSON output
- Safety escalation protocols
- Privacy-first design
"""

import re
from typing import Dict, List, Optional, Tuple
import json


class EnhancedTriageEngine:
    """
    Enhanced distress detection engine with auditable indicators,
    confidence scoring, and structured output.
    """
    
    def __init__(self):
        # Indian helpline configuration
        self.helplines = {
            'mental_health': {
                'name': 'Tele MANAS',
                'number': '14416',
                'availability': '24/7',
                'description': "Government's Mental Health Helpline"
            },
            'kiran': {
                'name': 'Kiran Mental Health Helpline',
                'number': '1800-599-0019',
                'availability': '24/7',
                'description': 'Mental Health Rehabilitation Helpline'
            },
            'sneha': {
                'name': 'Sneha Foundation',
                'number': '044-24640050',
                'availability': '24/7',
                'description': 'Suicide Prevention and Crisis Support'
            },
            'icall': {
                'name': 'iCall',
                'number': '9152987821',
                'availability': 'Mon-Sat, 10 AM-8 PM',
                'description': 'Psychosocial Helpline'
            },
            'emergency': {
                'name': 'Emergency Services',
                'number': '112',
                'availability': '24/7',
                'description': 'Police/Ambulance/Fire'
            }
        }
        
        # LOW distress indicators
        self.low_indicators = {
            'mild_stress': [
                r'\btired\b', r'\bbusy\b', r'\bstressed\b', r'\ba bit\b',
                r'\bslightly\b', r'\bsomewhat\b', r'\bfrustr', r'\bbored\b'
            ],
            'situational': [
                r'\bwork\b', r'\bdeadline\b', r'\bexam\b', r'\btraffic\b',
                r'\bmeeting\b', r'\btask\b'
            ],
            'manageable': [
                r'\bok\b', r'\bokay\b', r'\bmanage\b', r'\bfine\b',
                r'\balright\b', r'\bhandle\b'
            ]
        }
        
        # MEDIUM distress indicators
        self.medium_indicators = {
            'overwhelm': [
                r"can'?t handle", r'\btoo much\b', r'\boverwhelm',
                r'\bswamp', r'\bdrown', r'\bfall.*apart\b',
                r'\bbreaking.*down\b', r'\bfalling.*apart\b'
            ],
            'withdrawal': [
                r"don'?t want", r'\bavoid', r'\bisolat', r'\balone\b',
                r'\bhide\b', r'\bwithdraw', r'\bshut.*down\b'
            ],
            'negative_shift': [
                r'\bgetting worse\b', r'\bspiral', r'\bdarker\b',
                r'\bslipping\b', r'\blosin.*it\b', r'\bcan\'?t cope\b'
            ],
            'distress_emotions': [
                r'\bdepress', r'\banxious\b', r'\bpanic', r'\bworthless\b',
                r'\bhopeless\b', r'\bscared\b', r'\bterrified\b'
            ]
        }
        
        # HIGH distress indicators (crisis signals)
        self.high_indicators = {
            'self_harm_intent': [
                r'\bkill.*myself\b', r'\bhurt.*myself\b', r'\bend.*my.*life\b',
                r'\bsuicide\b', r'\bcut.*myself\b', r'\bburn.*myself\b',
                r'\bdie\b', r'\bdying\b', r'\bend.*it.*all\b'
            ],
            'hopelessness_finality': [
                r'\bno point\b', r'\bno reason.*live\b', r'\bgive up\b',
                r'\bcan\'?t go on\b', r'\bbetter.*off.*dead\b',
                r'\blast.*time\b', r'\bgoodbye\b', r'\bfarewell\b'
            ],
            'trapped_feelings': [
                r'\bno.*way.*out\b', r'\bcan\'?t escape\b', r'\btrapped\b',
                r'\bstuck forever\b', r'\bno hope\b', r'\bhelpless\b'
            ],
            'cultural_crisis': [
                r'\bmarne.*ka.*mann\b', r'\bijjaat\b', r'\bshame\b',
                r'\bhonor.*kill', r'\bdowry\b'
            ]
        }
        
        # Mandatory disclaimer
        self.disclaimer = "This is not a medical diagnosis. It is an automated assessment based only on the provided input."
    
    def analyze_distress_enhanced(
        self, 
        text: str, 
        voice_metadata: Optional[Dict] = None
    ) -> Dict:
        """
        Main entry point for enhanced distress analysis.
        
        Args:
            text: User input text
            voice_metadata: Optional dict with keys:
                - tone: 'flat' | 'crying' | 'agitated' | 'slowed'
                - pace: 'slow' | 'rapid' | 'normal'
                - pauses: 'frequent' | 'long' | 'normal'
                - intensity: 0.0-1.0
        
        Returns:
            Dict with structured output:
            {
                "distress_level": "low|medium|high",
                "rationale": str,
                "confidence": float,
                "limitations": str,
                "suggested_actions": List[str],
                "detected_indicators": Dict (for debugging),
                "voice_cues_used": bool
            }
        """
        # Step 1: Detect indicators from text
        indicators = self.detect_indicators(text)
        
        # Step 2: Determine base distress level
        distress_level = self._classify_distress_level(indicators)
        
        # Step 3: Process voice cues if available
        voice_score = 0.0
        if voice_metadata:
            voice_score = self._process_voice_cues(voice_metadata, distress_level)
        
        # Step 4: Calculate confidence
        confidence = self._calculate_confidence(indicators, voice_metadata, voice_score)
        
        # Step 5: Generate rationale
        rationale = self._generate_rationale(indicators, distress_level, voice_metadata)
        
        # Step 6: Get suggested actions
        suggested_actions = self._get_suggested_actions(distress_level)
        
        # Step 7: Format output
        return {
            "distress_level": distress_level,
            "rationale": rationale,
            "confidence": round(confidence, 2),
            "limitations": self.disclaimer,
            "suggested_actions": suggested_actions,
            "detected_indicators": indicators,
            "voice_cues_used": bool(voice_metadata)
        }
    
    def detect_indicators(self, text: str) -> Dict:
        """
        Detect all indicators from text.
        
        Returns dict with structure:
        {
            "low": {"category": ["matched_phrase", ...], ...},
            "medium": {...},
            "high": {...}
        }
        """
        text_lower = text.lower()
        detected = {
            "low": {},
            "medium": {},
            "high": {}
        }
        
        # Check LOW indicators
        for category, patterns in self.low_indicators.items():
            matches = []
            for pattern in patterns:
                if re.search(pattern, text_lower):
                    matches.append(pattern)
            if matches:
                detected["low"][category] = matches
        
        # Check MEDIUM indicators
        for category, patterns in self.medium_indicators.items():
            matches = []
            for pattern in patterns:
                if re.search(pattern, text_lower):
                    matches.append(pattern)
            if matches:
                detected["medium"][category] = matches
        
        # Check HIGH indicators
        for category, patterns in self.high_indicators.items():
            matches = []
            for pattern in patterns:
                if re.search(pattern, text_lower):
                    matches.append(pattern)
            if matches:
                detected["high"][category] = matches
        
        return detected
    
    def _classify_distress_level(self, indicators: Dict) -> str:
        """Classify distress level based on detected indicators."""
        # HIGH takes absolute priority
        if indicators["high"]:
            return "high"
        
        # MEDIUM if multiple medium indicators or strong medium signals
        medium_count = sum(len(matches) for matches in indicators["medium"].values())
        if medium_count >= 2:
            return "medium"
        elif indicators["medium"]:
            return "medium"
        
        # LOW if only low indicators or no clear signals
        if indicators["low"]:
            return "low"
        
        # Default to low for general support
        return "low"
    
    def _process_voice_cues(self, voice_metadata: Dict, distress_level: str) -> float:
        """
        Process voice cues and return a voice confidence adjustment score.
        
        Returns float 0.0-0.3 to add to confidence
        """
        if not voice_metadata:
            return 0.0
        
        score = 0.0
        tone = voice_metadata.get('tone', '').lower()
        pace = voice_metadata.get('pace', '').lower()
        pauses = voice_metadata.get('pauses', '').lower()
        
        # High distress voice patterns
        if distress_level == "high":
            if tone == 'crying':
                score += 0.2
            elif tone in ['agitated', 'slowed']:
                score += 0.15
            
            if pace == 'slow' and pauses in ['frequent', 'long']:
                score += 0.1
        
        # Medium distress voice patterns
        elif distress_level == "medium":
            if tone in ['flat', 'slowed']:
                score += 0.1
            if pace == 'slow':
                score += 0.05
            if pauses == 'frequent':
                score += 0.05
        
        # Cap at 0.3
        return min(score, 0.3)
    
    def _calculate_confidence(
        self, 
        indicators: Dict, 
        voice_metadata: Optional[Dict],
        voice_score: float
    ) -> float:
        """
        Calculate confidence score (0.0-1.0) based on:
        - Number of indicators
        - Clarity of signals
        - Voice alignment
        """
        base_confidence = 0.5  # Start at 50%
        
        # Count indicators by level
        high_count = sum(len(matches) for matches in indicators["high"].values())
        medium_count = sum(len(matches) for matches in indicators["medium"].values())
        low_count = sum(len(matches) for matches in indicators["low"].values())
        
        # HIGH indicators: very high confidence
        if high_count >= 1:
            base_confidence = 0.85
            if high_count >= 2:
                base_confidence = 0.95
        
        # MEDIUM indicators
        elif medium_count >= 1:
            base_confidence = 0.70
            if medium_count >= 3:
                base_confidence = 0.85
        
        # LOW indicators
        elif low_count >= 1:
            base_confidence = 0.65
            if low_count >= 2:
                base_confidence = 0.75
        
        # Add voice confidence boost
        confidence = base_confidence + voice_score
        
        # Cap at 0.99 (never 100% certain)
        return min(confidence, 0.99)
    
    def _generate_rationale(
        self, 
        indicators: Dict, 
        distress_level: str,
        voice_metadata: Optional[Dict]
    ) -> str:
        """Generate short, auditable explanation."""
        parts = []
        
        # Count indicators
        high_count = sum(len(matches) for matches in indicators["high"].values())
        medium_count = sum(len(matches) for matches in indicators["medium"].values())
        low_count = sum(len(matches) for matches in indicators["low"].values())
        
        if high_count > 0:
            categories = list(indicators["high"].keys())
            parts.append(f"Detected {high_count} crisis indicator(s): {', '.join(categories)}")
        
        if medium_count > 0:
            categories = list(indicators["medium"].keys())
            parts.append(f"Detected {medium_count} distress signal(s): {', '.join(categories)}")
        
        if low_count > 0 and distress_level == "low":
            parts.append(f"Detected {low_count} mild stress indicator(s)")
        
        if voice_metadata:
            tone = voice_metadata.get('tone')
            if tone:
                parts.append(f"Voice tone: {tone}")
        
        if not parts:
            parts.append("General support conversation")
        
        return ". ".join(parts) + "."
    
    def _get_suggested_actions(self, distress_level: str) -> List[str]:
        """Get level-specific suggested actions."""
        if distress_level == "high":
            return [
                "🚨 This is a crisis situation. Your safety is the priority.",
                f"📞 IMMEDIATE: Call Kiran Mental Health Helpline at {self.helplines['kiran']['number']} (24/7)",
                f"📞 Or call Sneha Foundation at {self.helplines['sneha']['number']} (24/7)",
                f"📞 Or call iCall at {self.helplines['icall']['number']} (Mon-Sat, 10 AM-8 PM)",
                f"🆘 In emergency: Call {self.helplines['emergency']['number']}",
                "👥 Reach out to a trusted person RIGHT NOW",
                "🏥 Consider visiting the nearest emergency room",
                "💙 You are not alone. Help is available immediately."
            ]
        
        elif distress_level == "medium":
            return [
                "💭 It sounds like you're going through a difficult time.",
                "👥 Reach out to a trusted friend or family member",
                f"📞 Consider calling Tele MANAS at {self.helplines['mental_health']['number']} for support",
                "🩺 A counselor or therapist can provide deeper support",
                "🧘 Try grounding exercises: Name 5 things you see, 4 you hear, 3 you feel",
                "✍️ Journaling your thoughts can help process emotions",
                "🌬️ Practice deep breathing: 4 seconds in, 7 hold, 8 out",
                "💙 You don't have to handle this alone."
            ]
        
        else:  # low
            return [
                "💙 It's okay to feel stressed sometimes.",
                "🧘 Try a 5-minute breathing exercise or short walk",
                "✍️ Consider journaling to process your thoughts",
                "☕ Take a short break - even 5 minutes helps",
                "👥 Connect with a friend for a quick chat",
                "🌿 Practice self-care: drink water, stretch, rest",
                f"📞 If things get harder, Tele MANAS is available 24/7 at {self.helplines['mental_health']['number']}"
            ]


# Legacy compatibility wrapper
class TriageEngine:
    """
    Legacy triage engine wrapper for backward compatibility.
    Maintains existing interface while using enhanced engine.
    """
    
    def __init__(self):
        self.enhanced_engine = EnhancedTriageEngine()
        # Keep existing attributes for backward compatibility
        self.crisis_keywords = self.enhanced_engine.high_indicators
        self.distress_keywords = self.enhanced_engine.medium_indicators
        
        # Legacy knowledge base for rule-based responses
        self.knowledge_base = {
            r"sleep|insomnia|awake|bed|tired|exhausted": [
                "Sleep is vital for mental health. Have you tried a 'digital detox' hour before bed? 📵",
                "Try the 4-7-8 breathing method. Inhale (4s), Hold (7s), Exhale (8s). 🌬️",
                "I know how draining insomnia is. Is your mind racing with thoughts?",
            ],
            r"anxious|panic|scared|worry|fear|nervous|ghabrahat": [
                "Let's ground ourselves. Can you name 5 things you can see around you? 👁️",
                "You are safe. This feeling is a wave, and you can ride it out.",
                "Try clenching your fists tight for 5 seconds, then releasing.",
            ],
            r"sad|cry|tears|depress|hopeless|down|udaas": [
                "It's okay to feel sad. I'm here to sit with you. 💙",
                "Crying is a natural release. You are not weak, you are human.",
                "When we feel low, even small steps matter. Have you eaten today?",
            ],
            r"lonely|alone|isolation|friend|akela": [
                "Loneliness can feel like physical pain. You aren't truly alone. 🤝",
                "I'm here. Tell me more about what's making you feel isolated.",
                "You are worthy of connection and love.",
            ],
            r"work|job|boss|career|exam|study|stress": [
                "Productivity is not your worth. Remember to take micro-breaks. ⏸️",
                "One task at a time. What is the smallest thing you can finish right now?",
                "Have you drunk water recently? Your brain needs fuel to focus.",
            ],
            r"family|parents|mom|dad|relative|marriage|rishta": [
                "Family expectations can be heavy. It's okay to have your own path. 🛤️",
                "Boundaries are healthy, even with elders. You matter too.",
                "You deserve to be heard in your own home.",
            ],
        }
    
    def analyze_severity(self, text: str, emoji_context: Optional[str] = None) -> Tuple[str, str, int]:
        """
        Legacy method - returns (severity, reason, intensity).
        Maps to new system: HIGH=RED, MEDIUM=YELLOW, LOW=GREEN
        """
        result = self.enhanced_engine.analyze_distress_enhanced(text)
        
        # Map distress levels
        severity_map = {
            "high": "RED",
            "medium": "YELLOW",
            "low": "GREEN"
        }
        severity = severity_map[result["distress_level"]]
        
        # Calculate intensity (1-10 scale)
        confidence = result["confidence"]
        if severity == "RED":
            intensity = int(9 + confidence)  # 9-10
        elif severity == "YELLOW":
            intensity = int(5 + confidence * 3)  # 5-8
        else:
            intensity = int(2 + confidence * 3)  # 2-5
        
        return severity, result["rationale"], intensity
    
    def extract_emojis(self, text: str) -> List[str]:
        """Extract emojis from text"""
        emoji_pattern = re.compile("["
            u"\U0001F600-\U0001F64F"  # emoticons
            u"\U0001F300-\U0001F5FF"  # symbols & pictographs
            u"\U0001F680-\U0001F6FF"  # transport & map symbols
            u"\U0001F1E0-\U0001F1FF"  # flags
            u"\U00002702-\U000027B0"
            u"\U000024C2-\U0001F251"
            "]+", flags=re.UNICODE)
        return emoji_pattern.findall(text)
    
    def detect_mood(self, text: str, emoji_context: Optional[str] = None) -> Tuple[Optional[str], int, str]:
        """
        Detect user's mood from text and emojis.
        Returns: (mood, confidence, reason)
        """
        text_lower = text.lower()
        
        mood_patterns = {
            'happy': [r'happy', r'great', r'good', r'wonderful', r'excited'],
            'sad': [r'sad', r'down', r'depressed', r'crying', r'tears', r'sadness', r'feeling low'],
            'anxious': [r'anxious', r'worried', r'nervous', r'panic', r'scared', r'anxiety', r'ghabrahat', r'tension', r'too much tension'],
            'angry': [r'angry', r'mad', r'furious', r'frustrated', r'frustration'],
            'stressed': [r'stressed', r'overwhelmed', r'pressure', r'burden', r'stress', r'mind is not okay', r'studies pressure', r'academic pressure', r'burnout', r'life feels overwhelming'],
            'lonely': [r'lonely', r'alone', r'isolation', r'loneliness', r'akela', r'no one to talk to'],
            'helpless': [r'helpless', r'trapped', r'no way out', r'helplessness', r'stuck'],
            'calm': [r'calm', r'peaceful', r'relaxed', r'content'],
            'confused': [r'confused', r'lost', r'don\'t know', r'uncertain']
        }
        
        detected_moods = {}
        for mood, patterns in mood_patterns.items():
            for pattern in patterns:
                if re.search(pattern, text_lower):
                    detected_moods[mood] = detected_moods.get(mood, 0) + 1
        
        if detected_moods:
            primary_mood = max(detected_moods, key=detected_moods.get)
            confidence = min(detected_moods[primary_mood] * 20, 100)
            reason = f"Detected from text patterns"
            return primary_mood, confidence, reason
        
        return None, 0, "No clear mood detected"
    
    def get_coping_strategy(self, mood: str, intensity: int) -> Optional[str]:
        """Returns a coping strategy based on mood and intensity"""
        if intensity < 3 or intensity > 8:
            return None
        
        strategies = {
            'anxious': [
                "🌿 **Coping Tip: 4-7-8 Breathing**\nInhale for 4s, Hold for 7s, Exhale for 8s.",
                "👁️ **Grounding Exercise**\nName 5 things you see, 4 you feel, 3 you hear.",
            ],
            'sad': [
                "✍️ **Mini-Journaling**\nWrite down one thing hurting you right now.",
                "🚶 **Gentle Movement**\nWalk to the window. A tiny change helps.",
            ],
            'stressed': [
                "☕ **The 'Chai Break' Metaphor**\nPause for 5 minutes. Just be.",
                "🧘 **Shoulder Drop**\nCheck your shoulders. Drop them. Relax your jaw.",
            ],
            'angry': [
                "🔥 **Cool Down Count**\nCount backwards from 20 to 1.",
                "📝 **Burn Letter**\nWrite what you're angry about, then delete it.",
            ],
        }
        
        import random
        mood_key = mood if mood in strategies else 'stressed'
        return random.choice(strategies.get(mood_key, strategies['stressed']))
    
    def generate_rule_based_response(
        self, 
        text: str, 
        severity: str, 
        history: List, 
        detected_mood: Optional[str] = None
    ) -> str:
        """
        Generate a rule-based response for backward compatibility.
        This is the critical method that app.py calls.
        """
        import random
        text_lower = text.lower()
        
        # Check knowledge base for pattern matches
        for pattern, responses in self.knowledge_base.items():
            if re.search(pattern, text_lower):
                return random.choice(responses)
        
        # Severity-based fallback
        if severity == "RED":
            return "I am deeply concerned about your safety. Please reach out to a professional immediately. 🚨 Tele MANAS: 14416 (24/7). You are not alone."
        elif severity == "YELLOW":
            return "It sounds like you're carrying a heavy burden. A professional can offer deeper support. 🩺 Consider calling Tele MANAS at 14416."
        
        # Mood-based responses
        if detected_mood:
            mood_fallbacks = {
                'happy': ["It sounds like things are going well! ✨", "I can sense the positivity in your message."],
                'sad': ["I hear the sadness in your words. It's okay. 💙", "Be gentle with yourself right now."],
                'angry': ["I can hear how frustrating this is. Your anger is valid. 😤"],
                'anxious': ["I sense some worry here. Let's slow down together. 🐢"],
                'stressed': ["You sound stretched. You don't have to carry the world today."],
                'confused': ["Feeling lost is part of finding the way. I'm with you."],
            }
            if detected_mood in mood_fallbacks:
                return random.choice(mood_fallbacks[detected_mood])
        
        # Generic fallback
        message_count = len(history)
        if message_count < 2:
            return "Hi there! I'm Care Nest. I'm here to support you. How are you feeling? 💙"
        else:
            fallbacks = [
                "I'm listening. Tell me more about what's on your mind? ",
                "It's okay to feel this way. I'm here for you.",
                "Thanks for sharing. I'm here to help.",
                "I hear you. What's bothering you the most right now?",
            ]
            return random.choice(fallbacks)


# Create singleton instances
enhanced_triage_engine = EnhancedTriageEngine()
triage_engine = TriageEngine()  # Backward compatible

