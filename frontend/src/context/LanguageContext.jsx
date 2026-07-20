import { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext(null);

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
};

const translations = {
    "hi-IN": {
        "Dashboard": "डैशबोर्ड",
        "Journal": "जर्नल",
        "Settings": "सेटिंग्स",
        "Chat": "चैट",
        "Home": "होम",
        "Profile": "प्रोफ़ाइल",
        "Sign Out": "साइन आउट",
        "Delete Account": "खाता हटाएं",
    },
    "ta-IN": {
        "Dashboard": "டாஷ்போர்டு",
        "Journal": "இதழ்",
        "Settings": "அமைப்புகள்",
        "Chat": "அரட்டை",
    }
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('language') || 'en-IN';
    });

    const changeLanguage = (lang) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
    };

    const t = (key) => {
        if (!translations[language]) return key;
        return translations[language][key] || key;
    };

    const value = {
        language,
        changeLanguage,
        t
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};
