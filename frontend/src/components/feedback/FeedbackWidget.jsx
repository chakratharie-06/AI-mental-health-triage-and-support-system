import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FeedbackWidget = ({ onSubmit }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [rating, setRating] = useState(null); // 'up', 'down'
    const [comment, setComment] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit({ rating, comment });
        }
        setSubmitted(true);
        setTimeout(() => {
            setIsOpen(false);
            // Reset after closing
            setTimeout(() => {
                setSubmitted(false);
                setRating(null);
                setComment('');
            }, 300);
        }, 2000);
    };

    return (
        <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                        {submitted ? (
                            <div className="p-6 flex flex-col items-center justify-center text-center">
                                <CheckCircle className="text-green-500 mb-2" size={32} />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Thank You!</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Your feedback helps us improve Care Nest.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="p-4">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                    How is your experience so far?
                                </h3>
                                
                                <div className="flex gap-2 mb-4">
                                    <button
                                        type="button"
                                        onClick={() => setRating('up')}
                                        className={`flex-1 flex justify-center p-2 rounded-lg border transition-colors ${
                                            rating === 'up' 
                                                ? 'bg-green-50 border-green-200 text-green-600 dark:bg-green-900/20 dark:border-green-800/50' 
                                                : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-750'
                                        }`}
                                    >
                                        <ThumbsUp size={20} className={rating === 'up' ? 'fill-current' : ''} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRating('down')}
                                        className={`flex-1 flex justify-center p-2 rounded-lg border transition-colors ${
                                            rating === 'down' 
                                                ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800/50' 
                                                : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-750'
                                        }`}
                                    >
                                        <ThumbsDown size={20} className={rating === 'down' ? 'fill-current' : ''} />
                                    </button>
                                </div>
                                
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Tell us more (optional)..."
                                    className="w-full text-sm p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 text-gray-900 dark:text-white mb-3 focus:outline-none focus:border-primary-500 resize-none h-20"
                                />
                                
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsOpen(false)}
                                        className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!rating && !comment.trim()}
                                        className="px-3 py-1.5 text-xs font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Submit
                                    </button>
                                </div>
                            </form>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
            
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
            >
                <MessageSquare size={18} />
                <span className="text-sm font-medium">Feedback</span>
            </button>
        </div>
    );
};

export default FeedbackWidget;
