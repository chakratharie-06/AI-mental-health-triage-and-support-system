import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { MapPin, Phone, User, Building, Navigation, Star, ArrowLeft, ArrowRight } from 'lucide-react';

const STATES = ["Delhi", "Maharashtra", "Karnataka", "Tamil Nadu", "West Bengal", "National"];

const ResourcesPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('emergency');
    const [selectedState, setSelectedState] = useState('National');
    const [resources, setResources] = useState({ emergency: [], local: [], professionals: [] });
    const [loading, setLoading] = useState(false);
    const [locationStatus, setLocationStatus] = useState('idle'); // idle, locating, found, error

    // Fetch resources when state changes
    useEffect(() => {
        const fetchResources = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:5000/api/resources?state=${selectedState}`);
                setResources(response.data);
            } catch (error) {
                console.error("Error fetching resources:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchResources();
    }, [selectedState]);

    const handleGeolocation = () => {
        setLocationStatus('locating');
        if (!navigator.geolocation) {
            setLocationStatus('error');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    // Use BigDataCloud's Free Reverse Geocoding API (No Key Required)
                    const response = await axios.get(
                        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                    );

                    const updateState = (detectedState) => {
                        // Map API response to our supported states
                        const supported = STATES.find(s =>
                            detectedState.includes(s) || s.includes(detectedState)
                        );
                        if (supported) {
                            setSelectedState(supported);
                            setLocationStatus('found');
                        } else {
                            alert(`We detected you are in ${detectedState}, but we currently only have resources for: ${STATES.join(', ')}. Showing National resources.`);
                            setSelectedState('National');
                            setLocationStatus('found');
                        }
                    };

                    // The API returns 'principalSubdivision' as the state/region
                    if (response.data.principalSubdivision) {
                        updateState(response.data.principalSubdivision);
                    } else if (response.data.city) {
                        updateState(response.data.city); // Fallback to city matching
                    } else {
                        throw new Error("State not found in response");
                    }

                } catch (error) {
                    console.error("Geocoding error:", error);
                    setLocationStatus('error');
                    // Fallback to manual selection if API fails
                    alert("Could not detect exact location. Please select your state manually.");
                }
            },
            (error) => {
                console.error("Geo error:", error);
                setLocationStatus('error');
            }
        );
    };

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${activeTab === id
                ? 'bg-wysa-teal text-white shadow-lg scale-105'
                : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
        >
            <Icon size={18} />
            {label}
        </button>
    );

    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [bookingData, setBookingData] = useState({ name: '', time: '', contact: '' });
    const [bookingStatus, setBookingStatus] = useState('idle'); // idle, sending, success

    const handleBookClick = (doctor) => {
        setSelectedDoctor(doctor);
        setShowBookingModal(true);
        setBookingStatus('idle');
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        setBookingStatus('sending');
        try {
            await axios.post('http://localhost:5000/api/book_appointment', {
                doctor_name: selectedDoctor.name,
                ...bookingData
            });
            setTimeout(() => {
                setBookingStatus('success');
                setTimeout(() => {
                    setShowBookingModal(false);
                    setBookingData({ name: '', time: '', contact: '' });
                }, 2000);
            }, 1000);
        } catch (error) {
            console.error("Booking failed:", error);
            setBookingStatus('idle'); // Reset on error
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 pb-24 relative">
            <div className="max-w-4xl mx-auto">

                {/* Header with Navigation */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Resource Hub</h1>
                        <p className="text-gray-500 mt-2">Find trusted support near you</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-3 bg-white border border-gray-200 rounded-full hover:bg-gray-50 text-gray-600 transition-all shadow-sm"
                            title="Go Back"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <button
                            onClick={() => navigate(1)}
                            className="p-3 bg-white border border-gray-200 rounded-full hover:bg-gray-50 text-gray-600 transition-all shadow-sm"
                            title="Go Forward"
                        >
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Location Filter */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary-50 rounded-xl text-primary-600">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Current Location</p>
                            <select
                                value={selectedState}
                                onChange={(e) => setSelectedState(e.target.value)}
                                className="font-semibold bg-transparent outline-none cursor-pointer text-gray-800"
                            >
                                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={handleGeolocation}
                        disabled={locationStatus === 'locating'}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                    >
                        <Navigation size={16} className={locationStatus === 'locating' ? 'animate-spin' : ''} />
                        {locationStatus === 'locating' ? 'Locating...' : 'Use my Location'}
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-3 mb-8">
                    <TabButton id="emergency" label="Crisis Helplines" icon={Phone} />
                    <TabButton id="local" label="NGOs & Hospitals" icon={Building} />
                    <TabButton id="professionals" label="Find Doctors" icon={User} />
                </div>

                {/* Content Area */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {loading ? (
                        <div className="text-center py-12 text-gray-400">Loading resources...</div>
                    ) : (
                        <div className="grid gap-4">
                            {/* Emergency Tab */}
                            {activeTab === 'emergency' && (
                                <>
                                    {resources.emergency.map((res, idx) => (
                                        <div key={idx} className="bg-white p-6 rounded-2xl border-l-4 border-red-500 shadow-sm flex justify-between items-center group hover:shadow-md transition-all">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800">{res.name}</h3>
                                                <p className="text-sm text-gray-500 mt-1">{res.desc}</p>
                                                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-danger-light text-danger-base rounded-lg text-sm font-mono font-semibold">
                                                    {res.number}
                                                </div>
                                            </div>
                                            <a
                                                href={`tel:${res.number}`}
                                                className="w-12 h-12 bg-red-100 text-danger-base rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                                            >
                                                <Phone size={20} />
                                            </a>
                                        </div>
                                    ))}
                                    <div className="text-center text-sm text-gray-400 mt-4">
                                        These lines are available 24/7. Your call is confidential.
                                    </div>
                                </>
                            )}

                            {/* Local NGOs Tab */}
                            {activeTab === 'local' && (
                                <>
                                    {resources.local.length > 0 ? resources.local.map((res, idx) => (
                                        <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-wysa-teal transition-colors">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                                        {res.name}
                                                        {res.verified && <span className="text-xs bg-green-100 text-success-dark px-2 py-0.5 rounded-full">Verified</span>}
                                                    </h3>
                                                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                                        <MapPin size={14} />
                                                        {res.location || selectedState}
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-2">{res.desc}</p>
                                                </div>
                                                <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                                    <Building size={20} />
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-10 text-gray-400 bg-white rounded-2xl">
                                            No specific listed resources for {selectedState}. Try the National tab.
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Professionals Tab */}
                            {activeTab === 'professionals' && (
                                <>
                                    {resources.professionals.map((doc, idx) => (
                                        <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 items-center">
                                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                                                <User size={32} />
                                            </div>
                                            <div className="flex-1 text-center md:text-left">
                                                <h3 className="text-lg font-bold text-gray-800">{doc.name}</h3>
                                                <div className="flex items-center justify-center md:justify-start gap-1 text-warning-base my-1">
                                                    <Star size={14} fill="currentColor" />
                                                    <span className="text-sm font-semibold text-gray-700">{doc.rating}</span>
                                                    <span className="text-xs text-gray-400">(120+ reviews)</span>
                                                </div>
                                                <div className="flex gap-2 justify-center md:justify-start mt-3">
                                                    <button
                                                        onClick={() => handleBookClick(doc)}
                                                        className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
                                                    >
                                                        Book Appointment
                                                    </button>
                                                    <button className="px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                                                        View Profile
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="p-4 bg-secondary-50 text-secondary-700 text-sm rounded-xl text-center">
                                        Looking for specific specialists? <span className="font-bold underline cursor-pointer">Advanced Search</span>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Booking Modal */}
            {showBookingModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
                    >
                        {bookingStatus === 'success' ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-100 text-success-base rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Star size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">Request Sent!</h3>
                                <p className="text-gray-500 mt-2">Dr. {selectedDoctor?.name.split('(')[0]} 's team will contact you shortly.</p>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-xl font-bold text-gray-800 mb-1">Book Appointment</h3>
                                <p className="text-sm text-gray-500 mb-6">with {selectedDoctor?.name}</p>

                                <form onSubmit={handleBookingSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-wysa-teal outline-none"
                                            value={bookingData.name}
                                            onChange={e => setBookingData({ ...bookingData, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                                        <select
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-wysa-teal outline-none"
                                            value={bookingData.time}
                                            onChange={e => setBookingData({ ...bookingData, time: e.target.value })}
                                        >
                                            <option>Morning (9AM - 12PM)</option>
                                            <option>Afternoon (12PM - 4PM)</option>
                                            <option>Evening (4PM - 8PM)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                                        <input
                                            type="tel"
                                            required
                                            placeholder="+91 98765 43210"
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-wysa-teal outline-none"
                                            value={bookingData.contact}
                                            onChange={e => setBookingData({ ...bookingData, contact: e.target.value })}
                                        />
                                    </div>

                                    <div className="flex gap-3 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setShowBookingModal(false)}
                                            className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={bookingStatus === 'sending'}
                                            className="flex-1 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                                        >
                                            {bookingStatus === 'sending' ? 'Sending...' : 'Confirm Request'}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default ResourcesPage;
