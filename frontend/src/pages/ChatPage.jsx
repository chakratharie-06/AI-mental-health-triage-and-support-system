import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import Navbar from '../components/Navbar';

/* ═══════════════════════════════════════════════════════════════════
   1.  DISTRESS RULES  —  English + all 12 Indian regional languages
       + romanised mixed-script (Tanglish, Hinglish, Tenglish …)
═══════════════════════════════════════════════════════════════════ */
const DISTRESS_RULES = {
    critical: [
        "suicide", "kill myself", "end my life", "want to die", "self harm",
        "self-harm", "cutting myself", "overdose", "no reason to live", "better off dead",
        "marna chahta", "marna chahti", "mar jaana chahta", "jeena nahi chahta",
        "khud ko khatam", "zindagi khatam", "मरना चाहता", "मरना चाहती", "जीना नहीं चाहता",
        "खुद को खत्म करना", "ज़िंदगी खत्म कर लूं",
        "vaazhave vendam", "uyirai maayththukolvean", "சாக விரும்புகிறேன்",
        "உயிரை மாய்த்துக்கொள்கிறேன்", "வாழவே வேண்டாம்",
        "chanapovalaani", "naaku jeevitam vaddhu", "చనిపోవాలని ఉంది", "జీవితం వద్దు",
        "saayabeku", "nanage baalyabekilla", "ಸಾಯಬೇಕು", "ನನಗೆ ಬದುಕು ಬೇಡ",
        "marikkanam", "jeevitham venda", "മരിക്കണം", "ജീവിതം വേണ്ട",
        "morte chai", "bhaachte chai na", "মরতে চাই", "বাঁচতে চাই না",
        "marayche aahe", "jeenyachi iccha nahi", "मरायचे आहे", "जगायची इच्छा नाही",
        "mari javanu man thay", "jeevvu nathi", "મરી જવાનું મન થાય", "જીવવું નથી",
        "marna chahunda", "zindagi nahi chahidi", "ਮਰਨਾ ਚਾਹੁੰਦਾ", "ਜ਼ਿੰਦਗੀ ਨਹੀਂ ਚਾਹੀਦੀ",
        "mariba chahu", "banchiba chhuena", "ମରିବ ଚାହୁଁ",
        "marna chahta hoon", "زندگی ختم کرنا", "مرنا چاہتا ہوں",
        "maribole man jay", "জীয়াই থকা নালাগে",
    ],
    high: [
        "hopeless", "worthless", "can't go on", "no point", "give up", "breaking down",
        "falling apart", "numb inside", "trapped", "nobody cares", "disappear",
        "koi nahi samjha", "koi nahi samjhega", "sab bekar hai", "sab khatam",
        "sharam aati hai", "mujhe koi nahi chahiye", "akela hoon", "akeli hoon",
        "कोई नहीं समझा", "शर्म आती है", "सब बेकार है", "अकेला हूँ",
        "vekkam", "thani", "யாரும் புரிந்துகொள்ளவில்லை", "வெட்கம்",
        "saram", "oduvatharkku vali illai", "ஒடுவதற்கு வழி இல்லை",
        "ekla", "nirash", "hataash", "थक गया", "थक गई", "হতাশ", "একা", "নিরাশ",
        "निराश", "अकेला", "అకేలా", "నిరాశ", "ನಿರಾಶ", "ഒറ്റപ്പെട്ട", "نا امید",
        "failed exam", "exams fail", "neet fail", "jee fail", "board fail",
        "parents disappointed", "parents shame", "family shame", "log kya kahenge",
        "log hasenge", "society me face nahi kar sakta", "izzat gayi",
        "மார்க் வரவில்லை", "அம்மா அப்பா கோபமாக இருக்கிறார்கள்",
        "exam fail aayithe", "parents gurinchi sochchukuntunna",
    ],
    medium: [
        "anxious", "depressed", "overwhelmed", "stressed", "lonely", "scared",
        "panic", "crying", "hurt", "miserable", "angry", "heartbroken", "lost", "empty",
        "ghabra raha", "ghabra rahi", "pareshaan", "udaas", "chinta", "dukh", "dard",
        "घबरा रहा", "परेशान", "उदास", "चिंता", "दुख", "दर्द", "रो रहा", "रो रही",
        "kavalai", "vali", "azhukirein", "பயம்", "கவலை", "வலி", "அழுகிறேன்",
        "bhayam", "vedana", "ఏడుపు వస్తోంది", "భయం", "వేదన",
        "bhaya", "novu", "ಅಳು", "ಭಯ", "ನೋವು",
        "vedana", "കരച്ചിൽ", "ഭയം", "വേദന",
        "bhoy", "kanna", "কান্না", "ভয়", "ব্যথা",
        "bheeti", "dukh", "रडतोय", "भीती", "दुःख",
        "dar", "dard", "રડે છું", "ડર", "દર્દ",
        "ਰੋ ਰਿਹਾ", "ਡਰ", "ਦੁੱਖ",
        "arranged marriage stress", "rishta pressure", "shaadi pressure",
        "career pressure", "parental pressure", "comparison with siblings",
        "bhai se compare", "behen se compare", "neighbour ka beta", "neighbour ki beti",
        "topper pressure", "rank pressure", "neet pressure", "jee pressure",
    ],
    low: [
        "tired", "unmotivated", "frustrated", "worried", "nervous", "down", "bad day", "upset",
        "thaka hua", "thaki hui", "bore ho gaya", "bore ho gayi", "थका हुआ", "ऊब गया",
        "kadhal", "thanimai", "dull ah irukku", "bore aaguthu", "டல்லா இருக்கு",
        "bore ayindi", "tired ga", "అలసటగా", "ಬೋರ್", "ബോർ", "বিরক্ত", "कंटाळा", "કંટાળ્યો",
    ],
    none: [],
};

const INDIAN_CULTURAL_CUES = {
    familyPressure: [
        "log kya kahenge", "family pressure", "izzat", "sharam", "maa baap", "parents ke liye",
        "ghar wale", "family ki expectation", "bade log", "society",
        "kudumbam", "kutumbam", "veettu aazhchai", "பெற்றோர் எதிர்பார்ப்பு",
        "intinti pani", "family gurinchi", "kutumba gauravam", "ಕುಟುಂಬದ ಒತ್ತಡ",
        "kudumba bayam", "kuttykku vendi", "পরিবারের জন্য", "घर की इज्जत",
    ],
    academicPressure: [
        "neet", "jee", "board exam", "12th exam", "10th exam", "upsc", "ca exam",
        "engineering", "medical entrance", "rank", "topper", "marks", "percentage",
        "percentile", "cut off", "counselling", "seat nahi mila", "admission",
        "neet fail", "jee fail", "exams fail", "exam result", "result aaya",
        "marks varala", "rank raala", "நீட்", "கட்-ஆஃப்", "தேர்வு", "மதிப்பெண்",
    ],
    marriagePressure: [
        "arranged marriage", "rishta", "shaadi", "vivah", "kalyanam", "thirumaanam",
        "kalyanam panra pressure", "30 aachu kalyanam aagala", "shadi nahi hui",
        "parents rishta dhundh rahe", "ಮದುವೆ ಒತ್ತಡ", "vivaaham", "বিয়ের চাপ", "लग्न",
    ],
    griefLoss: [
        "death in family", "passed away", "died", "chale gaye", "guzar gaye",
        "maa nahi rahi", "baap nahi raha", "athai pona", "appa pona", "amma pona",
        "theerndhu ponal", "போய்விட்டார்கள்", "காலமாகிவிட்டார்", "vellipoyaru",
        "చనిపోయారు", "ತೀರಿಕೊಂಡರು", "മരിച്ചുപോയി", "মারা গেছেন", "गुजर गए",
    ],
};

function detectCulturalContext(text) {
    const lower = text.toLowerCase();
    const flags = {};
    for (const [ctx, words] of Object.entries(INDIAN_CULTURAL_CUES)) {
        flags[ctx] = words.some(w => lower.includes(w));
    }
    return flags;
}

const TIER_W = { critical: 4, high: 3, medium: 2, low: 1, none: 0 };
const NEGATIONS = ["not", "n't", "never", "no", "nahi", "nahin", "illa", "illaatha", "ledu", "illai", "venda"];

function scoreText(text) {
    const lower = text.toLowerCase();
    const words = lower.split(/\s+/);
    let score = 0, level = "none";
    const matched = [];
    for (const tier of ["critical", "high", "medium", "low"]) {
        for (const kw of DISTRESS_RULES[tier]) {
            if (!lower.includes(kw)) continue;
            const kwW = kw.split(" ");
            const idx = words.findIndex((_, i) => words.slice(i, i + kwW.length).join(" ") === kw);
            const ctx = words.slice(Math.max(0, idx - 3), idx);
            if (ctx.some(w => NEGATIONS.includes(w))) continue;
            matched.push(kw);
            score += TIER_W[tier];
            if (TIER_W[tier] > TIER_W[level]) level = tier;
        }
    }
    const amps = (lower.match(/\b(always|never|everything|nothing|everyone|nobody|sab|koi|hamesha)\b/g) || []).length;
    return { score: Math.min(10, score + Math.min(amps, 2)), level, matchedKeywords: matched };
}

function useDistressDetector({ onDistressAlert } = {}) {
    const sessionRef = useRef(0);
    const prevRef = useRef("none");
    const alertRef = useRef(onDistressAlert);
    useEffect(() => { alertRef.current = onDistressAlert; }, [onDistressAlert]);
    const analyze = useCallback((text) => {
        const { score, level, matchedKeywords } = scoreText(text);
        sessionRef.current = Math.min(10, Math.round(sessionRef.current * 0.6 + score * 0.4));
        const result = { score, sessionScore: sessionRef.current, level, matchedKeywords };
        if (level !== prevRef.current && level !== "none") {
            prevRef.current = level;
            alertRef.current?.({ ...result, text, timestamp: Date.now() });
        }
        return result;
    }, []);
    return { analyze };
}

/* ═══════════════════════════════════════════════════════════════════
   2.  LANGUAGE CONFIG
═══════════════════════════════════════════════════════════════════ */
const INDIAN_LANGS = [
    { code: "en-IN", label: "EN", name: "English (India)", flag: "🇮🇳" },
    { code: "hi-IN", label: "हि", name: "Hindi / Hinglish", flag: "🇮🇳" },
    { code: "ta-IN", label: "த", name: "Tamil / Tanglish", flag: "🇮🇳" },
    { code: "te-IN", label: "తె", name: "Telugu / Tenglish", flag: "🇮🇳" },
    { code: "kn-IN", label: "ಕ", name: "Kannada / Kanglish", flag: "🇮🇳" },
    { code: "ml-IN", label: "മ", name: "Malayalam / Manglish", flag: "🇮🇳" },
    { code: "bn-IN", label: "ব", name: "Bengali / Benglish", flag: "🇮🇳" },
    { code: "mr-IN", label: "म", name: "Marathi", flag: "🇮🇳" },
    { code: "gu-IN", label: "ગ", name: "Gujarati", flag: "🇮🇳" },
    { code: "pa-IN", label: "ਪ", name: "Punjabi / Punglish", flag: "🇮🇳" },
    { code: "or-IN", label: "ଓ", name: "Odia", flag: "🇮🇳" },
    { code: "ur-IN", label: "اُ", name: "Urdu", flag: "🇮🇳" },
    { code: "as-IN", label: "অ", name: "Assamese", flag: "🇮🇳" },
];
const OTHER_LANGS = [
    { code: "en-US", label: "EN", name: "English (US)", flag: "🇺🇸" },
    { code: "fr-FR", label: "FR", name: "French", flag: "🇫🇷" },
    { code: "de-DE", label: "DE", name: "German", flag: "🇩🇪" },
    { code: "es-ES", label: "ES", name: "Spanish", flag: "🇪🇸" },
    { code: "ja-JP", label: "JA", name: "Japanese", flag: "🇯🇵" },
    { code: "zh-CN", label: "ZH", name: "Chinese", flag: "🇨🇳" },
];
const ALL_LANGS = [...INDIAN_LANGS, ...OTHER_LANGS];

const SPEECH_LANG_MAP = {
    "en-IN": "en-IN", "hi-IN": "hi-IN", "ta-IN": "ta-IN", "te-IN": "te-IN",
    "kn-IN": "kn-IN", "ml-IN": "ml-IN", "bn-IN": "bn-IN", "mr-IN": "mr-IN",
    "gu-IN": "gu-IN", "pa-IN": "pa-IN", "or-IN": "or-IN", "ur-IN": "ur-IN",
    "as-IN": "as-IN", "en-US": "en-US", "fr-FR": "fr-FR", "de-DE": "de-DE",
    "es-ES": "es-ES", "ja-JP": "ja-JP", "zh-CN": "zh-CN",
};

const LANG_NAMES = {
    "en-IN": "English (India)", "hi-IN": "Hindi", "ta-IN": "Tamil", "te-IN": "Telugu",
    "kn-IN": "Kannada", "ml-IN": "Malayalam", "bn-IN": "Bengali", "mr-IN": "Marathi",
    "gu-IN": "Gujarati", "pa-IN": "Punjabi", "or-IN": "Odia", "ur-IN": "Urdu",
    "as-IN": "Assamese", "en-US": "English", "fr-FR": "French", "de-DE": "German",
    "es-ES": "Spanish", "ja-JP": "Japanese", "zh-CN": "Chinese",
};

function baseLang(bcp47) { return (bcp47 || "en").split("-")[0].toLowerCase(); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function makeId() { return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

/* ═══════════════════════════════════════════════════════════════════
   3.  CRISIS HELPLINES
═══════════════════════════════════════════════════════════════════ */
const CRISIS_LINES = {
    "en-IN": { line: "iCall: 9152987821  |  Vandrevala: 1860-2662-345", note: "Free · Confidential · 24×7" },
    "hi-IN": { line: "iCall: 9152987821  |  Vandrevala: 1860-2662-345", note: "निःशुल्क · गोपनीय · 24×7" },
    "ta-IN": { line: "iCall: 9152987821  |  Snehi: 044-24640050", note: "இலவசம் · ரகசியம் · 24×7" },
    "te-IN": { line: "iCall: 9152987821  |  Vandrevala: 1860-2662-345", note: "ఉచిత · రహస్య · 24×7" },
    "kn-IN": { line: "iCall: 9152987821  |  Sahai: 080-25497777", note: "ಉಚಿತ · ರಹಸ್ಯ · 24×7" },
    "ml-IN": { line: "iCall: 9152987821  |  DISHA: 1056", note: "സൗജന്യം · രഹസ്യം · 24×7" },
    "bn-IN": { line: "iCall: 9152987821  |  Vandrevala: 1860-2662-345", note: "বিনামূল্যে · গোপনীয় · 24×7" },
    "mr-IN": { line: "iCall: 9152987821  |  iCall Pune: 9152987821", note: "मोफत · गोपनीय · 24×7" },
    "gu-IN": { line: "iCall: 9152987821  |  Vandrevala: 1860-2662-345", note: "મફત · ગુપ્ત · 24×7" },
    "pa-IN": { line: "iCall: 9152987821  |  Vandrevala: 1860-2662-345", note: "ਮੁਫ਼ਤ · ਗੁਪਤ · 24×7" },
    "or-IN": { line: "iCall: 9152987821  |  Vandrevala: 1860-2662-345", note: "ବିନାମୂଲ୍ୟ · ଗୋପନୀୟ · 24×7" },
    "ur-IN": { line: "iCall: 9152987821  |  Vandrevala: 1860-2662-345", note: "مفت · خفیہ · 24×7" },
    "as-IN": { line: "iCall: 9152987821  |  Vandrevala: 1860-2662-345", note: "বিনামূলীয়া · গোপনীয় · 24×7" },
    "en-US": { line: "988 Suicide & Crisis Lifeline", note: "Call or text 988 · 24/7" },
    "fr-FR": { line: "3114", note: "Numéro national prévention suicide" },
    "de-DE": { line: "0800 111 0 111", note: "Telefonseelsorge · kostenlos" },
    "es-ES": { line: "024", note: "Línea de crisis" },
    "ja-JP": { line: "0120-783-556", note: "いのちの電話" },
    "zh-CN": { line: "400-161-9995", note: "心理援助热线" },
};

/* ═══════════════════════════════════════════════════════════════════
   4.  ECHO RESPONDER  (stub — used when AI toggle is off)
═══════════════════════════════════════════════════════════════════ */
const ACK = {
    en: ["I hear you. Can you tell me more about how you're feeling?",
        "Thank you for sharing that. What's been weighing on you most?",
        "I'm right here. What would feel most supportive right now?"],
    hi: ["मैं आपकी बात सुन रहा हूँ। क्या आप थोड़ा और बता सकते हैं?",
        "आपने जो साझा किया उसके लिए शुक्रिया। आप अभी कैसा महसूस कर रहे हैं?",
        "आप अकेले नहीं हैं। मुझे बताइए, सबसे ज़्यादा क्या तकलीफ दे रहा है?"],
    ta: ["நான் உங்களைப் புரிந்துகொள்கிறேன். இன்னும் சொல்ல முடியுமா?",
        "நீங்கள் இதைப் பகிர்ந்தமைக்கு நன்றி. உங்களுக்கு எப்படி உதவலாம்?",
        "நீங்கள் தனியாக இல்லீர்கள். என்ன மிகவும் கஷ்டமாக இருக்கிறது?"],
    te: ["నేను మీ మాట వింటున్నాను. ఇంకా చెప్పగలరా?",
        "మీరు ఇది share చేసినందుకు ధన్యవాదాలు. ఏది మిమ్మల్ని ఎక్కువగా బాధిస్తోంది?"],
    kn: ["ನಾನು ನಿಮ್ಮ ಮಾತು ಕೇಳುತ್ತಿದ್ದೇನೆ. ಇನ್ನಷ್ಟು ಹೇಳಬಲ್ಲಿರಾ?",
        "ನೀವು ಒಂಟಿಯಾಗಿಲ್ಲ. ಯಾವುದು ಹೆಚ್ಚು ಕಷ್ಟ ಕೊಡುತ್ತಿದೆ?"],
    ml: ["ഞാൻ നിങ്ങളെ ശ്രദ്ധിക്കുന്നു. കൂടുതൽ പറയാൻ കഴിയുമോ?",
        "നിങ്ങൾ ഒറ്റക്കല്ല. ഏതാണ് ഏറ്റവും ബുദ്ധിമുട്ടുള്ളത്?"],
    bn: ["আমি আপনার কথা শুনছি। আরও কিছু বলতে পারবেন?",
        "আপনি একা নন। কোন বিষয়টা সবচেয়ে কষ্টের?"],
    mr: ["मी तुमचं ऐकतोय. आणखी सांगता येईल का?",
        "तुम्ही एकटे नाही. सर्वात जड काय वाटतंय?"],
    gu: ["હું તમારી વાત સાંભળી રહ્યો છું. વધુ કહી શકો?",
        "તમે એકલા નથી. સૌથી વધુ શું ભારે લાગે છે?"],
    pa: ["ਮੈਂ ਤੁਹਾਡੀ ਗੱਲ ਸੁਣ ਰਿਹਾ ਹਾਂ। ਹੋਰ ਦੱਸ ਸਕਦੇ ਹੋ?",
        "ਤੁਸੀਂ ਇਕੱਲੇ ਨਹੀਂ। ਕੀ ਸਭ ਤੋਂ ਵੱਧ ਔਖਾ ਲੱਗਦਾ ਹੈ?"],
    or: ["ମୁଁ ଆପଣଙ୍କ କଥା ଶୁଣୁଛି। ଆଉ ଟିକେ କହି ପାରିବେ?"],
    ur: ["میں آپ کی بات سن رہا ہوں۔ کیا آپ مزید بتا سکتے ہیں؟",
        "آپ اکیلے نہیں ہیں۔ سب سے زیادہ کیا تکلیف دے رہا ہے؟"],
    as: ["মই আপোনাৰ কথা শুনি আছোঁ। আৰু কব পাৰিবনে?"],
};

async function echoResponder({ detectedLanguage, distressLevel }) {
    await new Promise(r => setTimeout(r, 450 + Math.random() * 250));
    const lang = baseLang(detectedLanguage);
    let reply = pick(ACK[lang] ?? ACK.en);
    const cl = CRISIS_LINES[detectedLanguage] ?? CRISIS_LINES["en-IN"];
    if (distressLevel === "critical" || distressLevel === "high")
        reply += `\n\n🛡️ ${cl.line}\n${cl.note}`;
    return { text: reply, language: detectedLanguage };
}

/* ═══════════════════════════════════════════════════════════════════
   5.  BACKEND RESPONDER  —  calls your Flask /api/chat endpoint
       Falls back to echoResponder on network error.
═══════════════════════════════════════════════════════════════════ */
const CULTURAL_CONTEXT_PROMPT = `
INDIAN CULTURAL CONTEXT — respond with deep sensitivity to:

1. JOINT FAMILY SYSTEM: Pressure from parents, in-laws, grandparents, extended family. Acknowledge collective family dynamics without judgment.

2. ACADEMIC PRESSURE: NEET, JEE, Board Exams, UPSC, CA exams create extreme stress. "Parental sacrifice" narratives amplify shame around failure. Validate this by name when detected.

3. ARRANGED MARRIAGE: Age-related matrimonial pressure, rishta rejections, family timelines. Treat as legitimate stressor.

4. "LOG KYA KAHENGE" (what will people say): Social reputation is deeply tied to self-worth. Acknowledge as real burden.

5. MENTAL HEALTH STIGMA: Many users cannot tell family/friends. Honor this trust. Do NOT casually say "talk to your family" — for many that is impossible or unsafe.

6. MIXED LANGUAGE: Mirror Tanglish, Hinglish, Tenglish, Manglish exactly — never correct or standardize.

7. FINANCIAL STRESS: Being sole earner, supporting entire family, debt — don't minimize.

8. GENDER ROLES: Women face career-vs-marriage pressure, dowry issues. Men may feel unable to show vulnerability. Validate both.

9. CASTE & DISCRIMINATION: Approach with zero judgment.

10. GRIEF: Be aware of Indian mourning rituals (shraddh, 40-day periods) that may compound grief.`;

async function backendResponder({ text, detectedLanguage, distressLevel, history, culturalContext }) {
    const langName = LANG_NAMES[detectedLanguage] ?? "the same language as the user";
    const cl = CRISIS_LINES[detectedLanguage] ?? CRISIS_LINES["en-IN"];
    const culturalFlags = Object.entries(culturalContext || {}).filter(([, v]) => v).map(([k]) => k).join(", ");

    const systemPrompt = `You are Care Nest, a warm, empathetic AI mental-health companion.

LANGUAGE: Always reply in ${langName} (BCP-47: ${detectedLanguage}). Mirror the user's language mix exactly.
DISTRESS LEVEL: ${distressLevel}
CULTURAL CONTEXT DETECTED: ${culturalFlags || "general"}

${CULTURAL_CONTEXT_PROMPT}

RESPONSE GUIDELINES:
- 2–4 sentences + one gentle question
- Never repeat the same opening phrase twice
- Acknowledge specific cultural stressor by name if detected
- Do NOT say "talk to your parents/family" without understanding the situation
- Do NOT diagnose or prescribe
- Not a replacement for professional care
${(distressLevel === "critical" || distressLevel === "high") ? `\nSAFETY: Mention — ${cl.line} (${cl.note})\n` : ""}`;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
                message: text,
                language: detectedLanguage,
                distressLevel,
                culturalContext: culturalFlags,
                systemPrompt,
                conversationHistory: (history || [])
                    .filter(m => m.role !== "system")
                    .map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
            }),
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const reply = data.response || data.text || data.message || "";
        if (!reply) throw new Error("Empty response");
        return { text: reply, language: detectedLanguage };
    } catch (err) {
        console.warn("Backend unavailable, using echo fallback:", err.message);
        return echoResponder({ detectedLanguage, distressLevel });
    }
}

/* ═══════════════════════════════════════════════════════════════════
   6.  VOICE NOTE BUTTON
═══════════════════════════════════════════════════════════════════ */
function VoiceNoteButton({ onTranscript, preferredLang = "en-IN", disabled = false }) {
    const [listening, setListening] = useState(false);
    const [supported, setSupported] = useState(true);
    const [interim, setInterim] = useState("");
    const recRef = useRef(null);

    useEffect(() => {
        const SRC = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SRC) { setSupported(false); return; }
        const rec = new SRC();
        rec.continuous = true; rec.interimResults = true; rec.maxAlternatives = 1;
        rec.lang = SPEECH_LANG_MAP[preferredLang] ?? preferredLang;
        rec.onresult = (e) => {
            let it = "";
            for (let i = e.resultIndex; i < e.results.length; i++) {
                const r = e.results[i];
                if (r.isFinal) { onTranscript(r[0].transcript.trim()); setInterim(""); }
                else it += r[0].transcript;
            }
            setInterim(it);
        };
        rec.onend = () => { setListening(false); setInterim(""); };
        rec.onerror = () => { setListening(false); setInterim(""); };
        recRef.current = rec;
        return () => rec.abort();
    }, [preferredLang]);

    const toggle = () => {
        const rec = recRef.current;
        if (!rec || disabled) return;
        if (listening) { rec.stop(); setListening(false); }
        else { rec.lang = SPEECH_LANG_MAP[preferredLang] ?? preferredLang; rec.start(); setListening(true); }
    };

    if (!supported) return null;
    return (
        <div style={{ position: "relative", flexShrink: 0 }}>
            <button type="button" onClick={toggle} disabled={disabled}
                aria-label={listening ? "Stop" : "Voice input"} aria-pressed={listening}
                style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    border: `1.5px solid ${listening ? "var(--primary-500)" : "var(--primary-200)"}`,
                    background: listening ? "linear-gradient(135deg,var(--primary-500),var(--primary-700))" : "var(--surface-primary)",
                    color: listening ? "#fff" : "var(--primary-500)",
                    cursor: disabled ? "default" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.18s", opacity: disabled ? 0.45 : 1, position: "relative",
                }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="2" width="6" height="12" rx="3" />
                    <path d="M5 10a7 7 0 0 0 14 0" />
                    <line x1="12" y1="19" x2="12" y2="22" /><line x1="8" y1="22" x2="16" y2="22" />
                </svg>
                {listening && <span style={{
                    position: "absolute", inset: -4, borderRadius: 16,
                    border: "2px solid var(--primary-500)", animation: "cn-pulse 1.4s ease-out infinite", pointerEvents: "none"
                }} />}
            </button>
            {interim && (
                <div style={{
                    position: "absolute", bottom: 50, left: "50%", transform: "translateX(-50%)",
                    background: "rgba(30,58,58,0.9)", color: "#fff", fontSize: 11, padding: "5px 10px",
                    borderRadius: 8, whiteSpace: "nowrap", maxWidth: 220, overflow: "hidden",
                    textOverflow: "ellipsis", zIndex: 10, fontFamily: "system-ui,sans-serif"
                }}>
                    {interim}
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════
   7.  LANGUAGE SELECTOR  —  grouped dropdown
═══════════════════════════════════════════════════════════════════ */
function LangSelector({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const cur = ALL_LANGS.find(l => l.code === value) ?? INDIAN_LANGS[0];

    useEffect(() => {
        if (!open) return;
        const h = e => { if (!ref.current?.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, [open]);

    const Section = ({ title, langs }) => (
        <>
            <div style={{
                padding: "7px 12px 4px", fontSize: 10, fontWeight: 700,
                color: "var(--primary-500)", letterSpacing: "0.8px", fontFamily: "system-ui,sans-serif",
                textTransform: "uppercase", background: "var(--surface-primary)", borderBottom: "1px solid #F0F5F5"
            }}>
                {title}
            </div>
            {langs.map(l => (
                <button key={l.code} type="button"
                    onClick={() => { onChange(l.code); setOpen(false); }}
                    style={{
                        display: "flex", alignItems: "center", gap: 10, width: "100%",
                        padding: "9px 14px", border: "none", textAlign: "left", cursor: "pointer",
                        background: l.code === value ? "var(--primary-50)" : "transparent",
                        color: l.code === value ? "var(--primary-700)" : "var(--text-primary)",
                        fontFamily: "system-ui,sans-serif", fontSize: 13, transition: "background 0.12s",
                    }}
                    onMouseEnter={e => { if (l.code !== value) e.currentTarget.style.background = "var(--primary-50)"; }}
                    onMouseLeave={e => { if (l.code !== value) e.currentTarget.style.background = l.code === value ? "var(--primary-50)" : "transparent"; }}
                >
                    <span style={{ fontSize: 14, minWidth: 22 }}>{l.flag}</span>
                    <span style={{ fontWeight: 600, minWidth: 26, color: "var(--primary-500)", fontSize: 12 }}>{l.label}</span>
                    <span style={{ flex: 1 }}>{l.name}</span>
                    {l.code === value && <span style={{ color: "var(--primary-500)", fontSize: 12 }}>✓</span>}
                </button>
            ))}
        </>
    );

    return (
        <div ref={ref} style={{ position: "relative", flexShrink: 0, alignSelf: "center" }}>
            <button type="button" onClick={() => setOpen(o => !o)} title={`Language: ${cur.name}`}
                style={{
                    display: "flex", alignItems: "center", gap: 5, padding: "6px 9px",
                    borderRadius: 10, border: "1.5px solid var(--primary-200)", background: "var(--surface-secondary)",
                    cursor: "pointer", fontFamily: "system-ui,sans-serif", color: "var(--primary-700)",
                    fontSize: 12, whiteSpace: "nowrap", transition: "all 0.18s",
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "var(--primary-500)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--primary-200)"}
            >
                <span style={{ fontSize: 15 }}>{cur.flag}</span>
                <span style={{ fontWeight: 700, fontSize: 13, minWidth: 20, textAlign: "center" }}>{cur.label}</span>
                <svg width="9" height="9" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M1 1l4 4 4-4" />
                </svg>
            </button>

            {open && (
                <div style={{
                    position: "absolute", bottom: "calc(100% + 8px)", left: 0,
                    background: "#fff", borderRadius: 14,
                    boxShadow: "0 8px 36px rgba(0,0,0,0.15)",
                    zIndex: 200, width: 240,
                    border: "1px solid var(--primary-100)", animation: "cn-fade-up 0.15s ease",
                    maxHeight: 400, overflowY: "auto",
                }}>
                    <Section title="🇮🇳 Indian Regional" langs={INDIAN_LANGS} />
                    <div style={{ height: 1, background: "var(--border-light)", margin: "4px 0" }} />
                    <Section title="🌍 Other Languages" langs={OTHER_LANGS} />
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════
   8.  UI MICRO-COMPONENTS
═══════════════════════════════════════════════════════════════════ */
function TypingDots() {
    return (
        <div style={{
            display: "flex", gap: 5, padding: "13px 16px", background: "var(--surface-secondary)",
            borderRadius: "18px 18px 18px 4px", alignSelf: "flex-start",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)", animation: "cn-fade-up 0.25s ease"
        }}>
            {[0, 1, 2].map(i => (
                <span key={i} style={{
                    width: 7, height: 7, borderRadius: "50%", background: "var(--primary-500)",
                    display: "inline-block", opacity: 0.7,
                    animation: "cn-bounce 1.2s ease-in-out infinite", animationDelay: `${i * 0.2}s`
                }} />
            ))}
        </div>
    );
}

function renderBold(text) {
    return text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : p
    );
}

function MessageBubble({ msg }) {
    const isUser = msg.role === "user";
    const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return (
        <div style={{
            display: "flex", flexDirection: "column", maxWidth: "76%",
            alignSelf: isUser ? "flex-end" : "flex-start",
            alignItems: isUser ? "flex-end" : "flex-start",
            gap: 4, animation: "cn-fade-up 0.25s ease",
        }}>
            <div style={{
                padding: "11px 15px", lineHeight: 1.65,
                whiteSpace: "pre-wrap", wordBreak: "break-word",
                background: isUser ? "linear-gradient(135deg,var(--primary-500),var(--primary-700))"
                    : msg.role === "system" ? "var(--warning-light)" : "var(--surface-secondary)",
                color: isUser ? "#fff" : "var(--text-primary)",
                borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                boxShadow: isUser ? "0 2px 8px var(--shadow-md)" : "0 1px 4px rgba(0,0,0,0.06)",
                fontStyle: msg.role === "system" ? "italic" : "normal",
                fontSize: msg.role === "system" ? 13 : 14,
            }}>
                {renderBold(msg.content)}
            </div>
            <span style={{ fontSize: 10, color: "var(--text-tertiary)", padding: "0 4px", fontFamily: "system-ui,sans-serif" }}>{time}</span>
        </div>
    );
}

function CrisisBanner({ lang, onDismiss }) {
    const cl = CRISIS_LINES[lang] ?? CRISIS_LINES["en-IN"];
    return (
        <div role="alert" style={{
            display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 16px",
            background: "var(--danger-light)", borderBottom: "1px solid var(--danger-base)",
            fontSize: 13, fontFamily: "system-ui,sans-serif", color: "var(--danger-dark)",
            animation: "cn-slide-down 0.3s ease", flexShrink: 0,
        }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>🛡️</span>
            <div style={{ flex: 1, lineHeight: 1.7 }}>
                <strong>You're not alone.</strong><br />
                <span style={{ fontSize: 12, fontWeight: 600 }}>{cl.line}</span><br />
                <span style={{ fontSize: 11, opacity: 0.7 }}>{cl.note}</span>
            </div>
            <button onClick={onDismiss} style={{
                background: "none", border: "none",
                fontSize: 18, cursor: "pointer", color: "inherit", opacity: 0.6, flexShrink: 0
            }}>×</button>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════
   9.  ROOT COMPONENT  (exported as ChatPage)
═══════════════════════════════════════════════════════════════════ */
const WELCOME = {
    id: "sys_welcome", role: "assistant", language: "en-IN", timestamp: Date.now(),
    content: "Hi! I'm Care Nest — your AI mental-health companion. 💙\n\nI'm here to listen without judgment, in your language. Use the language selector (bottom-left) to switch to any Indian regional language — I'll understand and respond in the same language and style.\n\nHow has your day been?",
};

export default function ChatPage() {
    const location = useLocation();
    const [messages, setMessages] = useState([WELCOME]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [lang, setLang] = useState("en-IN");
    const [distressLevel, setDistressLevel] = useState("none");
    const [showCrisis, setShowCrisis] = useState(false);

    const bottomRef = useRef(null);
    const textareaRef = useRef(null);
    const messagesRef = useRef(messages);
    const moodTriggerFired = useRef(false);
    useEffect(() => { messagesRef.current = messages; }, [messages]);

    const { analyze } = useDistressDetector({
        onDistressAlert: useCallback((evt) => {
            setDistressLevel(evt.level);
            if (evt.level === "critical" || evt.level === "high") setShowCrisis(true);
        }, []),
    });

    const handleLangChange = useCallback((newLang) => {
        setLang(newLang);
        const lName = LANG_NAMES[newLang] ?? newLang;
        const lObj = ALL_LANGS.find(l => l.code === newLang);
        setMessages(prev => [...prev, {
            id: makeId(), role: "system",
            content: `${lObj?.flag || "🌐"} Language switched to ${lName}. I'll now respond in this language and understand cultural context accordingly.`,
            language: newLang, timestamp: Date.now(),
        }]);
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    // ── Auto-trigger from Mood Tracking page ──────────────────────────────
    useEffect(() => {
        const state = location.state;
        if (!state?.fromMood || moodTriggerFired.current) return;
        moodTriggerFired.current = true;

        const { moodEmoji, moodLabel, intensity, notes } = state;

        // Build a natural message that represents what the user logged
        let autoMessage = `I just logged my mood as ${moodEmoji} ${moodLabel} with an intensity of ${intensity}/10.`;
        if (notes) autoMessage += ` Here's what's on my mind: ${notes}`;

        // Small delay so the welcome message renders first
        const timer = setTimeout(() => {
            handleSend(autoMessage);
        }, 800);

        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state]);

    const handleSend = useCallback(async (text) => {
        const trimmed = text.trim();
        if (!trimmed || loading) return;
        const { level } = analyze(trimmed);
        const ctx = detectCulturalContext(trimmed);
        const userMsg = {
            id: makeId(), role: "user", content: trimmed,
            language: lang, timestamp: Date.now(), distressLevel: level,
        };
        const histSnap = messagesRef.current;
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);
        if (textareaRef.current) textareaRef.current.style.height = "auto";
        try {
            const reply = await backendResponder({
                text: trimmed, detectedLanguage: lang,
                distressLevel: level, history: histSnap, culturalContext: ctx,
            });
            setMessages(prev => [...prev, {
                id: makeId(), role: "assistant",
                content: reply.text, language: reply.language, timestamp: Date.now(),
            }]);
        } catch {
            const cl = CRISIS_LINES[lang] ?? CRISIS_LINES["en-IN"];
            setMessages(prev => [...prev, {
                id: makeId(), role: "system",
                content: `Connection issue. If you're in crisis: ${cl.line}`,
                language: lang, timestamp: Date.now(),
            }]);
        } finally {
            setLoading(false);
            textareaRef.current?.focus();
        }
    }, [loading, lang, analyze]);

    const handleKeyDown = e => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(input); }
    };

    const handleVoiceTranscript = useCallback((text) => {
        setInput(prev => prev ? `${prev} ${text}` : text);
        requestAnimationFrame(() => {
            if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
                textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
                textareaRef.current.focus();
            }
        });
    }, []);

    const crisisLine = CRISIS_LINES[lang] ?? CRISIS_LINES["en-IN"];

    return (
        <div style={{
            display: "flex", flexDirection: "column", height: "100vh",
            background: "var(--bg-page)", fontFamily: "Georgia,'Times New Roman',serif", overflow: "hidden"
        }}>

            <style>{`
        @keyframes cn-fade-up    { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes cn-bounce     { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }
        @keyframes cn-pulse      { 0%{opacity:.8;transform:scale(1)} 100%{opacity:0;transform:scale(1.55)} }
        @keyframes cn-slide-down { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes cn-spin       { to{transform:rotate(360deg)} }
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:#C8E0E0;border-radius:4px}
        button:focus-visible{outline:2px solid var(--primary-500);outline-offset:2px}
        textarea:focus{outline:none}
      `}</style>

            {/* NAVBAR — shared navigation across all pages */}
            <Navbar />

            {/* SAFETY STRIP */}
            <div style={{
                background: "linear-gradient(135deg,var(--primary-50),#F0F8F0)",
                borderBottom: "1px solid var(--primary-200)", padding: "7px 16px",
                display: "flex", alignItems: "center", gap: 8, flexShrink: 0
            }}>
                <span>🛡️</span>
                <span style={{ fontSize: 12, color: "var(--primary-800)", fontFamily: "system-ui,sans-serif" }}>
                    <strong>You're safe here.</strong>{" "}
                    Crisis? <strong style={{ color: "var(--primary-500)" }}>{crisisLine.line.split("|")[0].trim()}</strong>
                    <span style={{ opacity: 0.6, marginLeft: 6 }}>· {crisisLine.note}</span>
                </span>
            </div>

            {/* CHAT AREA */}
            <div style={{ flex: 1, display: "flex", justifyContent: "center", padding: "12px 12px 0", minHeight: 0 }}>
                <div style={{
                    width: "100%", maxWidth: 720, background: "#fff",
                    borderRadius: "20px 20px 0 0",
                    boxShadow: "0 -4px 40px rgba(0,0,0,0.06)",
                    display: "flex", flexDirection: "column", overflow: "hidden"
                }}>

                    {showCrisis && <CrisisBanner lang={lang} onDismiss={() => setShowCrisis(false)} />}

                    {/* Messages */}
                    <div style={{
                        flex: 1, overflowY: "auto", padding: "18px 18px 10px",
                        display: "flex", flexDirection: "column", gap: 12, minHeight: 0
                    }}>
                        {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
                        {loading && <TypingDots />}
                        <div ref={bottomRef} />
                    </div>

                    {/* INPUT BAR */}
                    <div style={{
                        padding: "10px 12px 6px", borderTop: "1px solid var(--border-light)",
                        background: "#fff", display: "flex", alignItems: "flex-end", gap: 7
                    }}>

                        <LangSelector value={lang} onChange={handleLangChange} />

                        <textarea ref={textareaRef} value={input}
                            onChange={e => {
                                setInput(e.target.value);
                                e.target.style.height = "auto";
                                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Share what's on your mind… (Enter to send)"
                            rows={1} disabled={loading} aria-label="Message input"
                            style={{
                                flex: 1, padding: "11px 13px", borderRadius: 14,
                                border: "1.5px solid var(--primary-200)", fontSize: 14, fontFamily: "Georgia,serif",
                                background: "var(--surface-primary)", color: "var(--text-primary)", resize: "none", lineHeight: 1.55,
                                minHeight: 44, maxHeight: 120, boxSizing: "border-box", transition: "border-color 0.18s"
                            }}
                            onFocus={e => e.target.style.borderColor = "var(--primary-500)"}
                            onBlur={e => e.target.style.borderColor = "var(--primary-200)"}
                        />

                        <VoiceNoteButton onTranscript={handleVoiceTranscript} preferredLang={lang} disabled={loading} />

                        <button type="button" onClick={() => handleSend(input)}
                            disabled={!input.trim() || loading} aria-label="Send"
                            style={{
                                width: 44, height: 44, borderRadius: 12, border: "none", flexShrink: 0,
                                background: input.trim() && !loading ? "linear-gradient(135deg,var(--primary-500),var(--primary-700))" : "var(--primary-100)",
                                color: input.trim() && !loading ? "#fff" : "var(--text-tertiary)",
                                cursor: input.trim() && !loading ? "pointer" : "default",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                boxShadow: input.trim() && !loading ? "0 3px 10px var(--shadow-lg)" : "none",
                                transition: "all 0.18s",
                            }}>
                            {loading
                                ? <div style={{ width: 15, height: 15, border: "2px solid var(--text-tertiary)", borderTopColor: "transparent", borderRadius: "50%", animation: "cn-spin 0.8s linear infinite" }} />
                                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                            }
                        </button>
                    </div>

                    <p style={{
                        fontSize: 10, color: "var(--text-secondary)", textAlign: "center",
                        margin: 0, padding: "5px 0 10px", fontFamily: "system-ui,sans-serif", background: "#fff"
                    }}>
                        Not a substitute for professional care · Crisis? {crisisLine.line.split("|")[0].trim()}
                    </p>
                </div>
            </div>
        </div>
    );
}
