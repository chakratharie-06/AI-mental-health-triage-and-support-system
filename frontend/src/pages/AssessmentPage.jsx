import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, ClipboardList, AlertCircle, CheckCircle2, Info } from 'lucide-react';

/**
 * AssessmentPage - Standalone Mental Health Screening Interface
 * 
 * A professional, ethical PHQ-9 depression screening tool.
 * Provides results with clear disclaimers and next steps.
 */
function AssessmentPage() {
    const navigate = useNavigate();
    const { token } = useAuth();

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    // PHQ-9 questions
    const questions = [
        "Little interest or pleasure in doing things",
        "Feeling down, depressed, or hopeless",
        "Trouble falling or staying asleep, or sleeping too much",
        "Feeling tired or having little energy",
        "Poor appetite or overeating",
        "Feeling bad about yourself - or that you are a failure or have let yourself or your family down",
        "Trouble concentrating on things, such as reading the newspaper or watching television",
        "Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual",
        "Thoughts that you would be better off dead, or of hurting yourself in some way"
    ];

    const options = [
        { value: 0, label: "Not at all" },
        { value: 1, label: "Several days" },
        { value: 2, label: "More than half the days" },
        { value: 3, label: "Nearly every day" }
    ];

    const handleAnswer = (value) => {
        setAnswers({ ...answers, [currentQuestion]: value });

        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            submitAssessment({ ...answers, [currentQuestion]: value });
        }
    };

    const submitAssessment = async (finalAnswers) => {
        setLoading(true);

        try {
            const score = Object.values(finalAnswers).reduce((sum, val) => sum + val, 0);

            let severity, recommendation;
            if (score <= 4) {
                severity = "Minimal";
                recommendation = "Your responses suggest minimal depression symptoms. Continue practicing self-care.";
            } else if (score <= 9) {
                severity = "Mild";
                recommendation = "Your responses suggest mild depression. Consider speaking with a mental health professional.";
            } else if (score <= 14) {
                severity = "Moderate";
                recommendation = "Your responses suggest moderate depression. We recommend consulting a mental health professional.";
            } else if (score <= 19) {
                severity = "Moderately Severe";
                recommendation = "Your responses suggest moderately severe depression. Please seek professional help soon.";
            } else {
                severity = "Severe";
                recommendation = "Your responses suggest severe depression. Please contact a mental health professional or crisis helpline immediately.";
            }

            setResult({ score, severity, recommendation });

            // Optionally save to backend
            await axios.post(
                '/api/assessment',
                { score, severity },
                { headers: { Authorization: `Bearer ${token}` } }
            ).catch(() => { });

        } catch (error) {
            console.error('Assessment error:', error);
        } finally {
            setLoading(false);
        }
    };

    const restart = () => {
        setCurrentQuestion(0);
        setAnswers({});
        setResult(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/chat')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-xl flex items-center justify-center">
                            <ClipboardList className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-800">Mental Health Assessment</h1>
                            <p className="text-xs text-gray-600">PHQ-9 Depression Screening</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 py-8">
                {!result ? (
                    <>
                        {/* Introduction */}
                        {currentQuestion === 0 && Object.keys(answers).length === 0 && (
                            <div className="mb-8 p-6 bg-sky-50 rounded-xl border border-sky-200">
                                <div className="flex items-start gap-3">
                                    <Info className="w-6 h-6 text-sky-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-sky-800">
                                        <p className="font-medium mb-2">About this assessment:</p>
                                        <ul className="space-y-1 text-sky-700">
                                            <li>• This is a standardized screening tool (PHQ-9)</li>
                                            <li>• It takes about 2-3 minutes to complete</li>
                                            <li>• Your responses are confidential</li>
                                            <li>• This is NOT a diagnosis - only a licensed professional can diagnose</li>
                                            <li>• Results will help you understand if you should seek professional support</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Progress */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-600">
                                    Question {currentQuestion + 1} of {questions.length}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
                                </p>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                                    className="bg-gradient-to-r from-sky-600 to-indigo-600 h-2 rounded-full"
                                ></motion.div>
                            </div>
                        </div>

                        {/* Question */}
                        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg mb-6">
                            <p className="text-lg text-gray-800 mb-2">
                                Over the last 2 weeks, how often have you been bothered by:
                            </p>
                            <h2 className="text-2xl font-bold text-gray-900 mb-8">
                                {questions[currentQuestion]}
                            </h2>

                            <div className="space-y-3">
                                {options.map((option) => (
                                    <motion.button
                                        key={option.value}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleAnswer(option.value)}
                                        className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl hover:border-sky-500 hover:bg-sky-50 transition-all text-left font-medium text-gray-700"
                                    >
                                        {option.label}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Back button */}
                        {currentQuestion > 0 && (
                            <button
                                onClick={() => setCurrentQuestion(currentQuestion - 1)}
                                className="text-gray-600 hover:text-gray-800 font-medium"
                            >
                                ← Previous Question
                            </button>
                        )}
                    </>
                ) : (
                    /* Results */
                    <div>
                        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg mb-6">
                            <div className="text-center mb-6">
                                <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${result.score <= 9 ? 'bg-green-100' : result.score <= 14 ? 'bg-yellow-100' : 'bg-red-100'
                                    }`}>
                                    {result.score <= 9 ? (
                                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                                    ) : (
                                        <AlertCircle className="w-10 h-10 text-red-600" />
                                    )}
                                </div>
                                <h2 className="text-3xl font-bold text-gray-800 mb-2">Assessment Complete</h2>
                                <p className="text-gray-600">Your PHQ-9 Score: <span className="font-bold text-2xl">{result.score}</span> / 27</p>
                            </div>

                            <div className={`p-6 rounded-xl mb-6 ${result.score <= 9 ? 'bg-green-50 border border-green-200' :
                                    result.score <= 14 ? 'bg-yellow-50 border border-yellow-200' :
                                        'bg-red-50 border border-red-200'
                                }`}>
                                <p className="font-semibold text-gray-800 mb-2">Severity: {result.severity}</p>
                                <p className="text-gray-700">{result.recommendation}</p>
                            </div>

                            <div className="p-6 bg-blue-50 rounded-xl border border-blue-200 mb-6">
                                <p className="text-sm text-blue-800 font-medium mb-2">⚠️ Important Disclaimer</p>
                                <p className="text-sm text-blue-700 leading-relaxed">
                                    This assessment is a screening tool, not a diagnosis. Only a qualified mental health professional
                                    can provide an accurate diagnosis and treatment plan. If you're experiencing distress, please
                                    reach out to a professional or crisis helpline.
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => navigate('/resources')}
                                    className="flex-1 py-3 bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-sky-700 hover:to-indigo-700 transition-all"
                                >
                                    Find Resources
                                </button>
                                <button
                                    onClick={restart}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all"
                                >
                                    Retake Assessment
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AssessmentPage;
