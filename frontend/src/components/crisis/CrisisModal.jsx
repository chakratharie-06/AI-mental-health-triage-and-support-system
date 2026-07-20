import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Phone, X, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const CrisisModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="relative w-full max-w-lg p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-red-500"
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                        <X size={24} />
                    </button>

                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-2">
                            <AlertTriangle size={32} />
                        </div>
                        
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            You are not alone.
                        </h2>
                        
                        <p className="text-gray-600 dark:text-gray-300">
                            It sounds like you are going through a very difficult time right now. We want to make sure you get the support you need immediately.
                        </p>

                        <div className="w-full bg-red-50 dark:bg-red-900/20 rounded-lg p-4 my-6 text-left">
                            <h3 className="text-red-800 dark:text-red-300 font-semibold mb-3 flex items-center gap-2">
                                <Phone size={20} />
                                Immediate Support Helplines (24/7)
                            </h3>
                            <ul className="space-y-3">
                                <li className="flex items-start justify-between">
                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                        <strong>Tele MANAS</strong> (Govt. of India)
                                    </div>
                                    <a href="tel:14416" className="font-bold text-red-600 dark:text-red-400 hover:underline">
                                        14416
                                    </a>
                                </li>
                                <li className="flex items-start justify-between">
                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                        <strong>AASRA</strong> (Suicide Prevention)
                                    </div>
                                    <a href="tel:912227546669" className="font-bold text-red-600 dark:text-red-400 hover:underline">
                                        91-22-27546669
                                    </a>
                                </li>
                                <li className="flex items-start justify-between">
                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                        <strong>Vandrevala Foundation</strong>
                                    </div>
                                    <a href="tel:9999666555" className="font-bold text-red-600 dark:text-red-400 hover:underline">
                                        9999 666 555
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div className="flex flex-col sm:flex-row w-full gap-3 mt-4">
                            <a
                                href="tel:14416"
                                className="flex-1 flex justify-center items-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                            >
                                <Phone size={18} /> Call Helpline Now
                            </a>
                            <Link
                                to="/resources"
                                onClick={onClose}
                                className="flex-1 flex justify-center items-center gap-2 py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
                            >
                                <Heart size={18} /> View All Resources
                            </Link>
                        </div>
                        
                        <p className="text-xs text-gray-500 mt-4">
                            If this is a medical emergency, please go to the nearest hospital or call 112 immediately.
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CrisisModal;
