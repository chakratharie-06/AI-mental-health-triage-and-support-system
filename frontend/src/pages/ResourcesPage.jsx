import { useState, useEffect } from 'react';
import { Phone, MapPin, AlertCircle, Heart, Building2, User, Clock, Globe, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const ResourcesPage = () => {
    const [distressStatus, setDistressStatus] = useState(null);
    const [selectedState, setSelectedState] = useState('National');
    const [loading, setLoading] = useState(true);
    const [expandedSections, setExpandedSections] = useState({
        emergency: true,
        counselors: false,
        psychiatrists: false,
        selfHelp: false
    });

    const states = ['National', 'Karnataka', 'Maharashtra', 'Tamil Nadu', 'Delhi', 'West Bengal'];

    useEffect(() => {
        fetchDistressStatus();
    }, []);

    const fetchDistressStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/user-distress-status', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDistressStatus(response.data);
        } catch (error) {
            console.error('Error fetching distress status:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Emergency Helplines
    const emergencyHelplines = [
        {
            name: 'Tele MANAS',
            number: '14416',
            description: '24/7 Mental Health Support',
            availability: '24/7',
            languages: 'All Indian Languages',
            type: 'National'
        },
        {
            name: 'NIMHANS Helpline',
            number: '080-46110007',
            description: 'National Institute of Mental Health',
            availability: '24/7',
            location: 'Bangalore, Karnataka',
            type: 'Karnataka'
        },
        {
            name: 'NIMHANS Emergency',
            number: '080-26995000',
            description: 'Emergency Mental Health Services',
            availability: '24/7',
            location: 'Bangalore, Karnataka',
            type: 'Karnataka'
        },
        {
            name: 'Vandrevala Foundation',
            number: '1860-2662-345',
            description: 'Mental Health Support & Crisis Intervention',
            availability: '24/7',
            languages: 'English, Hindi',
            type: 'National'
        },
        {
            name: 'iCall',
            number: '9152987821',
            description: 'Psychosocial Helpline',
            availability: 'Mon-Sat, 8 AM - 10 PM',
            languages: 'English, Hindi, Marathi',
            type: 'National'
        },
        {
            name: 'AASRA',
            number: '91-22-27546669',
            description: 'Suicide Prevention Helpline',
            availability: '24/7',
            location: 'Mumbai, Maharashtra',
            type: 'Maharashtra'
        }
    ];

    // Counselors by State
    const counselors = {
        'National': [
            {
                name: 'BetterHelp India',
                type: 'Online Counseling Platform',
                contact: 'www.betterhelp.com',
                services: 'Individual therapy, couples therapy',
                languages: 'English, Hindi'
            },
            {
                name: 'Practo Mental Health',
                type: 'Online Consultation',
                contact: 'www.practo.com',
                services: 'Psychiatrists, Psychologists, Counselors',
                languages: 'Multiple languages'
            }
        ],
        'Karnataka': [
            {
                name: 'NIMHANS Counseling Services',
                type: 'Government Hospital',
                contact: '080-26995000',
                address: 'Hosur Road, Bangalore - 560029',
                services: 'Individual counseling, family therapy, group therapy',
                languages: 'English, Kannada, Hindi'
            },
            {
                name: 'Mpower - The Centre',
                type: 'Mental Health Center',
                contact: '1800-120-820050',
                address: 'Bangalore',
                services: 'Counseling, therapy, wellness programs',
                languages: 'English, Kannada'
            }
        ],
        'Maharashtra': [
            {
                name: 'Mpower - Mumbai',
                type: 'Mental Health Center',
                contact: '1800-120-820050',
                address: 'Mumbai',
                services: 'Counseling, therapy, psychiatric services',
                languages: 'English, Hindi, Marathi'
            },
            {
                name: 'Tata Institute of Social Sciences',
                type: 'Counseling Center',
                contact: '022-25525000',
                address: 'Mumbai',
                services: 'Individual and group counseling',
                languages: 'English, Hindi, Marathi'
            }
        ],
        'Tamil Nadu': [
            {
                name: 'Schizophrenia Research Foundation (SCARF)',
                type: 'Mental Health Organization',
                contact: '044-26640353',
                address: 'Chennai',
                services: 'Counseling, rehabilitation, family support',
                languages: 'English, Tamil'
            }
        ],
        'Delhi': [
            {
                name: 'IHBAS (Institute of Human Behaviour & Allied Sciences)',
                type: 'Government Hospital',
                contact: '011-22112222',
                address: 'Dilshad Garden, Delhi',
                services: 'Psychiatric services, counseling',
                languages: 'English, Hindi'
            }
        ],
        'West Bengal': [
            {
                name: 'Calcutta Medical Research Institute',
                type: 'Hospital',
                contact: '033-23206525',
                address: 'Kolkata',
                services: 'Psychiatric consultation, counseling',
                languages: 'English, Bengali, Hindi'
            }
        ]
    };

    // Psychiatrists by State
    const psychiatrists = {
        'National': [
            {
                name: 'Practo Psychiatry',
                type: 'Online Platform',
                contact: 'www.practo.com',
                services: 'Online psychiatric consultation, medication management',
                languages: 'Multiple languages'
            }
        ],
        'Karnataka': [
            {
                name: 'NIMHANS Department of Psychiatry',
                type: 'Government Hospital',
                contact: '080-26995000',
                address: 'Hosur Road, Bangalore - 560029',
                services: 'Comprehensive psychiatric care, medication management, ECT',
                languages: 'English, Kannada, Hindi',
                specialties: 'Depression, Anxiety, Bipolar, Schizophrenia, OCD'
            },
            {
                name: 'Spandana Nursing Home',
                type: 'Private Hospital',
                contact: '080-26762886',
                address: 'Bangalore',
                services: 'Inpatient and outpatient psychiatric services',
                languages: 'English, Kannada'
            }
        ],
        'Maharashtra': [
            {
                name: 'Lokmanya Tilak Municipal General Hospital',
                type: 'Government Hospital',
                contact: '022-24076789',
                address: 'Sion, Mumbai',
                services: 'Psychiatric OPD, emergency services',
                languages: 'English, Hindi, Marathi'
            }
        ],
        'Tamil Nadu': [
            {
                name: 'Institute of Mental Health',
                type: 'Government Hospital',
                contact: '044-25281010',
                address: 'Chennai',
                services: 'Psychiatric treatment, rehabilitation',
                languages: 'English, Tamil'
            }
        ],
        'Delhi': [
            {
                name: 'AIIMS Psychiatry Department',
                type: 'Government Hospital',
                contact: '011-26588500',
                address: 'Ansari Nagar, New Delhi',
                services: 'Comprehensive psychiatric care',
                languages: 'English, Hindi'
            }
        ],
        'West Bengal': [
            {
                name: 'Pavlov Hospital',
                type: 'Private Hospital',
                contact: '033-24730001',
                address: 'Kolkata',
                services: 'Psychiatric treatment, de-addiction',
                languages: 'English, Bengali, Hindi'
            }
        ]
    };

    // Self-Help Resources
    const selfHelpResources = [
        {
            name: 'Mindfulness Meditation',
            description: 'Daily 10-minute guided meditation',
            type: 'Practice',
            link: '/relax'
        },
        {
            name: 'Journaling',
            description: 'Express your thoughts and feelings',
            type: 'Practice',
            link: '/journal'
        },
        {
            name: 'Mood Tracking',
            description: 'Monitor your emotional patterns',
            type: 'Tool',
            link: '/mood'
        },
        {
            name: 'Breathing Exercises',
            description: '4-7-8 breathing technique for anxiety',
            type: 'Practice',
            link: '/relax'
        }
    ];

    const getRecommendationColor = () => {
        if (!distressStatus) return 'bg-gray-100';
        switch (distressStatus.category) {
            case 'low': return 'bg-green-50 border-green-200';
            case 'medium': return 'bg-yellow-50 border-yellow-200';
            case 'high': return 'bg-orange-50 border-orange-200';
            case 'critical': return 'bg-red-50 border-red-200';
            default: return 'bg-gray-100';
        }
    };

    const getRecommendationIcon = () => {
        if (!distressStatus) return Heart;
        switch (distressStatus.recommendation) {
            case 'self-help': return Heart;
            case 'counselor': return User;
            case 'psychiatrist': return Building2;
            default: return Heart;
        }
    };

    const filteredEmergency = emergencyHelplines.filter(h =>
        selectedState === 'National' || h.type === 'National' || h.type === selectedState
    );

    const filteredCounselors = [
        ...(counselors['National'] || []),
        ...(counselors[selectedState] || [])
    ];

    const filteredPsychiatrists = [
        ...(psychiatrists['National'] || []),
        ...(psychiatrists[selectedState] || [])
    ];

    const RecommendationIcon = getRecommendationIcon();

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Mental Health Resources</h1>
                    <p className="text-gray-600">Find the support you need, when you need it</p>
                </div>

                {/* Personalized Recommendation Card */}
                {!loading && distressStatus && (
                    <div className={`mb-8 p-6 rounded-xl border-2 ${getRecommendationColor()}`}>
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white rounded-lg">
                                <RecommendationIcon className="w-6 h-6 text-primary-600" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                    Personalized Recommendation
                                </h2>
                                <p className="text-gray-700 mb-3">{distressStatus.message}</p>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                    <span>Distress Level: <strong>{distressStatus.distress_level}/10</strong></span>
                                    <span>Category: <strong className="capitalize">{distressStatus.category}</strong></span>
                                    <span>Based on {distressStatus.total_messages} recent messages</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* State Selector */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="inline w-4 h-4 mr-1" />
                        Select Your Location
                    </label>
                    <select
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        {states.map(state => (
                            <option key={state} value={state}>{state}</option>
                        ))}
                    </select>
                </div>

                {/* Emergency Helplines */}
                <div className="mb-6 bg-white rounded-xl shadow-sm overflow-hidden">
                    <button
                        onClick={() => toggleSection('emergency')}
                        className="w-full px-6 py-4 flex items-center justify-between bg-red-50 hover:bg-red-100 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                            <h2 className="text-xl font-semibold text-gray-900">Emergency Helplines (24/7)</h2>
                        </div>
                        {expandedSections.emergency ? <ChevronUp /> : <ChevronDown />}
                    </button>

                    {expandedSections.emergency && (
                        <div className="p-6 grid gap-4 md:grid-cols-2">
                            {filteredEmergency.map((helpline, idx) => (
                                <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                                    <h3 className="font-semibold text-lg text-gray-900 mb-2">{helpline.name}</h3>
                                    <a href={`tel:${helpline.number}`} className="text-2xl font-bold text-primary-600 mb-2 block hover:text-primary-700">
                                        <Phone className="inline w-5 h-5 mr-2" />
                                        {helpline.number}
                                    </a>
                                    <p className="text-gray-600 mb-2">{helpline.description}</p>
                                    <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                                        {helpline.availability && (
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {helpline.availability}
                                            </span>
                                        )}
                                        {helpline.languages && (
                                            <span className="flex items-center gap-1">
                                                <Globe className="w-4 h-4" />
                                                {helpline.languages}
                                            </span>
                                        )}
                                        {helpline.location && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {helpline.location}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Counselors Section */}
                {distressStatus && (distressStatus.recommendation === 'counselor' || distressStatus.category === 'high') && (
                    <div className="mb-6 bg-white rounded-xl shadow-sm overflow-hidden">
                        <button
                            onClick={() => toggleSection('counselors')}
                            className="w-full px-6 py-4 flex items-center justify-between bg-yellow-50 hover:bg-yellow-100 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <User className="w-6 h-6 text-yellow-600" />
                                <h2 className="text-xl font-semibold text-gray-900">Professional Counselors</h2>
                            </div>
                            {expandedSections.counselors ? <ChevronUp /> : <ChevronDown />}
                        </button>

                        {expandedSections.counselors && (
                            <div className="p-6 grid gap-4">
                                {filteredCounselors.map((counselor, idx) => (
                                    <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                                        <h3 className="font-semibold text-lg text-gray-900 mb-1">{counselor.name}</h3>
                                        <p className="text-sm text-gray-500 mb-2">{counselor.type}</p>
                                        <p className="text-gray-700 mb-2">{counselor.services}</p>
                                        <div className="flex flex-wrap gap-4 text-sm">
                                            <span className="text-primary-600 font-medium">
                                                <Phone className="inline w-4 h-4 mr-1" />
                                                {counselor.contact}
                                            </span>
                                            {counselor.address && (
                                                <span className="text-gray-600">
                                                    <MapPin className="inline w-4 h-4 mr-1" />
                                                    {counselor.address}
                                                </span>
                                            )}
                                            {counselor.languages && (
                                                <span className="text-gray-600">
                                                    <Globe className="inline w-4 h-4 mr-1" />
                                                    {counselor.languages}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Psychiatrists Section */}
                {distressStatus && distressStatus.recommendation === 'psychiatrist' && (
                    <div className="mb-6 bg-white rounded-xl shadow-sm overflow-hidden">
                        <button
                            onClick={() => toggleSection('psychiatrists')}
                            className="w-full px-6 py-4 flex items-center justify-between bg-orange-50 hover:bg-orange-100 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Building2 className="w-6 h-6 text-orange-600" />
                                <h2 className="text-xl font-semibold text-gray-900">Psychiatrists & Mental Health Hospitals</h2>
                            </div>
                            {expandedSections.psychiatrists ? <ChevronUp /> : <ChevronDown />}
                        </button>

                        {expandedSections.psychiatrists && (
                            <div className="p-6 grid gap-4">
                                {filteredPsychiatrists.map((psychiatrist, idx) => (
                                    <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                                        <h3 className="font-semibold text-lg text-gray-900 mb-1">{psychiatrist.name}</h3>
                                        <p className="text-sm text-gray-500 mb-2">{psychiatrist.type}</p>
                                        <p className="text-gray-700 mb-2">{psychiatrist.services}</p>
                                        {psychiatrist.specialties && (
                                            <p className="text-sm text-gray-600 mb-2">
                                                <strong>Specialties:</strong> {psychiatrist.specialties}
                                            </p>
                                        )}
                                        <div className="flex flex-wrap gap-4 text-sm">
                                            <span className="text-primary-600 font-medium">
                                                <Phone className="inline w-4 h-4 mr-1" />
                                                {psychiatrist.contact}
                                            </span>
                                            {psychiatrist.address && (
                                                <span className="text-gray-600">
                                                    <MapPin className="inline w-4 h-4 mr-1" />
                                                    {psychiatrist.address}
                                                </span>
                                            )}
                                            {psychiatrist.languages && (
                                                <span className="text-gray-600">
                                                    <Globe className="inline w-4 h-4 mr-1" />
                                                    {psychiatrist.languages}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Self-Help Resources */}
                {distressStatus && distressStatus.recommendation === 'self-help' && (
                    <div className="mb-6 bg-white rounded-xl shadow-sm overflow-hidden">
                        <button
                            onClick={() => toggleSection('selfHelp')}
                            className="w-full px-6 py-4 flex items-center justify-between bg-green-50 hover:bg-green-100 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Heart className="w-6 h-6 text-green-600" />
                                <h2 className="text-xl font-semibold text-gray-900">Self-Help Resources</h2>
                            </div>
                            {expandedSections.selfHelp ? <ChevronUp /> : <ChevronDown />}
                        </button>

                        {expandedSections.selfHelp && (
                            <div className="p-6 grid gap-4 md:grid-cols-2">
                                {selfHelpResources.map((resource, idx) => (
                                    <a
                                        key={idx}
                                        href={resource.link}
                                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                                    >
                                        <h3 className="font-semibold text-lg text-gray-900 mb-1">{resource.name}</h3>
                                        <p className="text-gray-600 mb-2">{resource.description}</p>
                                        <span className="text-sm text-primary-600 font-medium">{resource.type}</span>
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Important Notice */}
                <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-gray-700">
                        <strong>Important:</strong> If you're experiencing a mental health emergency, please call emergency services (112) or visit the nearest hospital immediately.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default ResourcesPage;
