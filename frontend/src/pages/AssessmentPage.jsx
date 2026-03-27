import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, ArrowLeft, ClipboardList, ChevronRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const questions = [
  {
    id: "mood",
    question: "How have you been feeling emotionally over the past 2 weeks?",
    options: [
      { value: "0", label: "Good - feeling positive most of the time", score: 0 },
      { value: "1", label: "Okay - some ups and downs, but manageable", score: 1 },
      { value: "2", label: "Not great - frequently feeling down or anxious", score: 2 },
      { value: "3", label: "Very difficult - constant sadness, hopelessness, or anxiety", score: 3 },
    ],
  },
  {
    id: "sleep",
    question: "How has your sleep been?",
    options: [
      { value: "0", label: "Normal - sleeping well most nights", score: 0 },
      { value: "1", label: "Slightly affected - occasional difficulty", score: 1 },
      { value: "2", label: "Quite disturbed - regular insomnia or oversleeping", score: 2 },
      { value: "3", label: "Severely affected - barely sleeping or sleeping too much", score: 3 },
    ],
  },
  {
    id: "social",
    question: "How do you feel about interacting with family and friends?",
    options: [
      { value: "0", label: "Normal - enjoying social connections", score: 0 },
      { value: "1", label: "Slightly withdrawn - but still managing", score: 1 },
      { value: "2", label: "Very withdrawn - avoiding most interactions", score: 2 },
      { value: "3", label: "Completely isolated - can't face anyone", score: 3 },
    ],
  },
  {
    id: "functioning",
    question: "How are you managing daily activities (work, studies, household tasks)?",
    options: [
      { value: "0", label: "Managing well - keeping up with responsibilities", score: 0 },
      { value: "1", label: "Struggling a bit - but getting things done", score: 1 },
      { value: "2", label: "Very difficult - falling behind significantly", score: 2 },
      { value: "3", label: "Unable to function - can't complete basic tasks", score: 3 },
    ],
  },
  {
    id: "thoughts",
    question: "Have you experienced thoughts of harming yourself or that life isn't worth living?",
    options: [
      { value: "0", label: "No, not at all", score: 0 },
      { value: "1", label: "Rare fleeting thoughts, but no intent", score: 1 },
      { value: "2", label: "Sometimes - these thoughts worry me", score: 2 },
      { value: "3", label: "Frequently - or I have a plan", score: 3 },
    ],
  },
  {
    id: "support",
    question: "Do you have people you can talk to about your feelings?",
    options: [
      { value: "0", label: "Yes - I have good support from family/friends", score: 0 },
      { value: "1", label: "Somewhat - but I don't feel comfortable sharing", score: 1 },
      { value: "2", label: "Very limited - stigma prevents me from opening up", score: 2 },
      { value: "3", label: "No one - I feel completely alone", score: 3 },
    ],
  },
];

export default function AssessmentPage() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showEmergency, setShowEmergency] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentQuestion]);

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  const hasAnswer = answers[currentQ.id] !== undefined;

  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [currentQ.id]: value };
    setAnswers(newAnswers);

    if (currentQ.id === "thoughts" && parseInt(value, 10) >= 2) {
      setShowEmergency(true);
    }
    
    // Auto advance after a brief delay for a smoother experience
    setTimeout(() => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    }, 450);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const totalScore = Object.entries(answers).reduce((sum, [questionId, value]) => {
        const question = questions.find((q) => q.id === questionId);
        const option = question?.options.find((o) => o.value === value);
        return sum + (option?.score || 0);
      }, 0);

      localStorage.setItem("assessmentScore", totalScore.toString());
      localStorage.setItem("assessmentAnswers", JSON.stringify(answers));
      localStorage.setItem("assessmentDate", new Date().toISOString());
      navigate("/triage-results");
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  return (
    <div className="min-h-screen bg-surface-primary font-sans flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-sm">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Mental Wellness Assessment</h1>
            <p className="text-xs text-gray-500 font-medium">Confidential & Secure Feedback</p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center p-6 sm:p-8">
        <div className="w-full max-w-2xl space-y-8">
          
          {/* Emergency Alert Banner */}
          <AnimatePresence>
            {showEmergency && (
              <motion.div 
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                className="overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row items-start gap-4 p-5 border border-danger-base bg-danger-light rounded-2xl shadow-sm">
                  <AlertCircle className="w-8 h-8 text-danger-dark flex-shrink-0 mt-1" />
                  <div className="text-danger-dark flex-1">
                    <p className="font-bold text-lg mb-1">Immediate Help Available</p>
                    <p className="text-sm mb-4 leading-relaxed font-medium">
                      If you're in crisis, please contact these 24/7 helplines right away: <br className="hidden sm:block" />
                      <span className="font-bold underline text-danger-dark">NIMHANS: 080-46110007</span> | <span className="font-bold underline text-danger-dark">Vandrevala Foundation: 1860-2662-345</span>
                    </p>
                    <button
                      className="px-5 py-2.5 bg-danger-base hover:bg-danger-dark text-white rounded-xl font-semibold transition-all shadow-md active:scale-95 flex items-center gap-2"
                      onClick={() => window.open('/resources', '_self')}
                    >
                      🆘 Get Emergency Help Now
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress Indicator */}
          <div className="space-y-3">
            <div className="flex justify-between items-end text-sm">
              <span className="font-semibold text-gray-700 tracking-wide uppercase text-xs">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="font-medium text-primary-600 text-xs">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-100/80 rounded-full h-2 overflow-hidden ring-1 ring-inset ring-gray-200">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="bg-gradient-to-r from-primary-400 to-primary-600 h-2 rounded-full shadow-[0_0_10px_rgba(38,181,186,0.5)]"
              />
            </div>
          </div>

          {/* Question Interface */}
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="w-full"
              >
                <div className="px-8 pt-10 pb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-2">
                    {currentQ.question}
                  </h2>
                  <p className="text-gray-500 font-medium">Select the best matching option below.</p>
                </div>
                
                <div className="px-8 pb-10 space-y-3" role="radiogroup">
                  {currentQ.options.map((option, idx) => {
                    const isSelected = answers[currentQ.id] === option.value;
                    return (
                      <label
                        key={option.value}
                        className={`
                          block relative w-full p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer overflow-hidden
                          ${isSelected 
                            ? "border-primary-500 bg-primary-50/50 shadow-sm" 
                            : "border-gray-100 hover:border-gray-300 hover:bg-gray-50/50 bg-white"
                          }
                        `}
                      >
                        <input
                          type="radio"
                          name={currentQ.id}
                          value={option.value}
                          checked={isSelected}
                          onChange={() => handleAnswer(option.value)}
                          className="sr-only"
                        />
                        <div className="flex items-center gap-4">
                          <div className={`
                            flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                            ${isSelected ? "border-primary-500" : "border-gray-300"}
                          `}>
                            {isSelected && <div className="w-3 h-3 bg-primary-500 rounded-full" />}
                          </div>
                          
                          <div className={`flex-1 font-medium text-base sm:text-lg transition-colors ${isSelected ? "text-primary-900" : "text-gray-700"}`}>
                            {option.label}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-semibold transition-all duration-200 ${
                currentQuestion === 0
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-100 active:scale-95"
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <button
              onClick={handleNext}
              disabled={!hasAnswer}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold transition-all duration-200 shadow-lg ${
                !hasAnswer
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                  : "bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
              }`}
            >
              <span>{currentQuestion === questions.length - 1 ? "Submit Assessment" : "Continue"}</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Privacy Footnote */}
          <div className="pt-8 pb-4 text-center">
             <div className="inline-flex items-center gap-2 px-4 py-2 bg-info-light/50 border border-info-base/50 rounded-full text-xs font-semibold text-info-dark">
                <AlertCircle className="w-4 h-4" />
                <span>Your privacy matters. Responses are 100% confidential.</span>
             </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
