import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Mic, MicOff, Languages } from 'lucide-react';
import Navbar from '../components/Navbar';

const ChatPage = () => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('en-IN');
    const [showLanguageMenu, setShowLanguageMenu] = useState(false);
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);

    // Supported languages for Care Nest
    const languages = [
        { code: 'en-IN', name: 'English', native: 'English' },
        { code: 'hi-IN', name: 'Hindi', native: 'हिंदी' },
        { code: 'ta-IN', name: 'Tamil', native: 'தமிழ்' },
        { code: 'te-IN', name: 'Telugu', native: 'తెలుగు' },
        { code: 'kn-IN', name: 'Kannada', native: 'ಕನ್ನಡ' },
        { code: 'ml-IN', name: 'Malayalam', native: 'മലയാളം' },
        { code: 'bn-IN', name: 'Bengali', native: 'বাংলা' },
        { code: 'mr-IN', name: 'Marathi', native: 'मराठी' },
    ];

    useEffect(() => {
        // Load or initialize conversation
        const savedConversationId = localStorage.getItem('currentConversationId');
        const savedMessages = localStorage.getItem('chatMessages');

        if (savedConversationId && savedMessages) {
            // Restore existing conversation
            setConversationId(savedConversationId);
            try {
                const parsedMessages = JSON.parse(savedMessages);
                setMessages(parsedMessages.map(msg => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                })));
            } catch (error) {
                console.error('Error parsing saved messages:', error);
                initializeNewConversation();
            }
        } else {
            // Initialize new conversation
            initializeNewConversation();
        }
    }, []);

    const initializeNewConversation = () => {
        const newConversationId = `conv_${Date.now()}`;
        const welcomeMessage = {
            role: 'ai',
            content: "Hi there! I'm Care Nest, your AI mental health companion. I'm here to listen and support you. How are you feeling today? 💙",
            timestamp: new Date()
        };

        setConversationId(newConversationId);
        setMessages([welcomeMessage]);

        // Save to localStorage
        localStorage.setItem('currentConversationId', newConversationId);
        localStorage.setItem('chatMessages', JSON.stringify([welcomeMessage]));
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Initialize speech recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = selectedLanguage;

            recognitionRef.current.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0])
                    .map(result => result.transcript)
                    .join('');

                setInputMessage(transcript);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [selectedLanguage]);

    // Start voice recognition
    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            setInputMessage('');
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    // Stop voice recognition
    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    // Change language
    const changeLanguage = (langCode) => {
        setSelectedLanguage(langCode);
        setShowLanguageMenu(false);
        if (recognitionRef.current) {
            recognitionRef.current.lang = langCode;
        }
    };

    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = {
            role: 'user',
            content: inputMessage,
            timestamp: new Date()
        };

        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInputMessage('');
        setIsLoading(true);

        // Save user message to localStorage
        localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:5000/api/chat',
                {
                    message: inputMessage,
                    conversationId: conversationId,
                    language: selectedLanguage // Send selected language
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            const aiMessage = {
                role: 'ai',
                content: response.data.response,
                timestamp: new Date()
            };

            const finalMessages = [...updatedMessages, aiMessage];
            setMessages(finalMessages);

            // Save AI response to localStorage
            localStorage.setItem('chatMessages', JSON.stringify(finalMessages));
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = {
                role: 'ai',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date()
            };
            const errorMessages = [...updatedMessages, errorMessage];
            setMessages(errorMessages);
            localStorage.setItem('chatMessages', JSON.stringify(errorMessages));
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        if (window.confirm('Are you sure you want to start a new conversation? This will clear all messages.')) {
            localStorage.removeItem('currentConversationId');
            localStorage.removeItem('chatMessages');
            initializeNewConversation();
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl flex flex-col">
                {/* Safety Banner */}
                <div className="mb-4 bg-info-light border-l-4 border-info-base rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <div className="text-2xl">🛡️</div>
                        <div>
                            <p className="font-semibold text-gray-900 mb-1">You're safe here</p>
                            <p className="text-sm text-gray-700">
                                This is a confidential space. If you're in crisis, please call <strong>988</strong> for immediate support.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 bg-white rounded-lg shadow-base border border-gray-200 overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex items-end gap-2 max-w-[70%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {/* Avatar */}
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user' ? 'bg-primary-500' : 'bg-secondary-500'
                                        }`}>
                                        <span className="text-white text-sm font-semibold">
                                            {message.role === 'user' ? 'You' : 'AI'}
                                        </span>
                                    </div>

                                    {/* Message Bubble */}
                                    <div>
                                        <div className={`px-4 py-3 rounded-2xl ${message.role === 'user'
                                            ? 'bg-primary-500 text-white rounded-br-sm'
                                            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                                            }`}>
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                {message.content}
                                            </p>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 px-1">
                                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="flex items-end gap-2 max-w-[70%]">
                                    <div className="w-8 h-8 rounded-full bg-secondary-500 flex items-center justify-center">
                                        <span className="text-white text-sm font-semibold">AI</span>
                                    </div>
                                    <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                        {/* Language Selector */}
                        <div className="mb-3 flex items-center justify-between">
                            <div className="relative">
                                <button
                                    onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <Languages className="w-4 h-4 text-primary-600" />
                                    <span className="text-gray-700">
                                        {languages.find(l => l.code === selectedLanguage)?.native}
                                    </span>
                                </button>

                                {/* Language Dropdown */}
                                {showLanguageMenu && (
                                    <div className="absolute bottom-full left-0 mb-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                                        {languages.map((lang) => (
                                            <button
                                                key={lang.code}
                                                onClick={() => changeLanguage(lang.code)}
                                                className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${selectedLanguage === lang.code ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-700'
                                                    }`}
                                            >
                                                <div className="font-medium">{lang.native}</div>
                                                <div className="text-xs text-gray-500">{lang.name}</div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {isListening && (
                                <div className="flex items-center gap-2 text-sm text-danger-base">
                                    <div className="w-2 h-2 bg-danger-base rounded-full animate-pulse"></div>
                                    <span className="font-medium">Listening...</span>
                                </div>
                            )}
                        </div>

                        {/* Input Controls */}
                        <div className="flex items-end gap-2">
                            <textarea
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={`Type your message in ${languages.find(l => l.code === selectedLanguage)?.name}...`}
                                rows="1"
                                className="flex-1 resize-none px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                style={{ minHeight: '48px', maxHeight: '120px' }}
                                disabled={isListening}
                            />

                            {/* Voice Button */}
                            <button
                                onClick={isListening ? stopListening : startListening}
                                disabled={isLoading}
                                className={`h-12 w-12 flex-shrink-0 rounded-lg flex items-center justify-center transition-all ${isListening
                                    ? 'bg-danger-base hover:bg-danger-dark text-white'
                                    : 'bg-secondary-500 hover:bg-secondary-600 text-white'
                                    }`}
                                aria-label={isListening ? 'Stop recording' : 'Start voice input'}
                                title={isListening ? 'Stop recording' : 'Start voice input'}
                            >
                                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </button>

                            {/* Send Button */}
                            <button
                                onClick={sendMessage}
                                disabled={!inputMessage.trim() || isLoading}
                                className="btn btn-primary h-12 w-12 p-0 flex-shrink-0"
                                aria-label="Send message"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Voice Input Hint */}
                        {!isListening && recognitionRef.current && (
                            <p className="mt-2 text-xs text-gray-500 text-center">
                                💡 Click the microphone to speak in {languages.find(l => l.code === selectedLanguage)?.name}
                            </p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ChatPage;
