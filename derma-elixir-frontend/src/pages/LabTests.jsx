// src/pages/LabTests.jsx
import { useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { getLabTests } from '../services/api';
import labBg from "../assets/labBg.jpg";

const LabTests = () => {
    const [labTests, setLabTests] = useState([]);
    const [filteredTests, setFilteredTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const location = useLocation();
    const highlightRef = useRef({});

    // useEffect for handling highlighting of a particular item when come though search from navbar
    useEffect(() => {
        // Get the highlight parameter from URL
        const params = new URLSearchParams(location.search);
        const highlightId = params.get('highlight');

        if (highlightId && highlightRef.current[highlightId]) {
            // Scroll to the element
            highlightRef.current[highlightId].scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Add highlight class
            highlightRef.current[highlightId].classList.add('bg-yellow-100', 'transition-all', 'duration-1000');

            // Remove highlight after 3 seconds
            setTimeout(() => {
                if (highlightRef.current[highlightId]) {
                    highlightRef.current[highlightId].classList.remove('bg-yellow-100');
                }
            }, 5000);
        }
    }, [location, filteredTests]);

    useEffect(() => {
        const fetchLabTests = async () => {
            try {
                setLoading(true);
                const response = await getLabTests();
                setLabTests(response);
                setFilteredTests(response);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching lab tests:', err);
                setError('Failed to load lab tests. Please try again later.');
                setLoading(false);
            }
        };

        fetchLabTests();
    }, []);

    // Simple search that covers all fields
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredTests(labTests);
            return;
        }

        const term = searchTerm.toLowerCase();
        const filtered = labTests.filter(test =>
            test.name.toLowerCase().includes(term) ||
            test.description.toLowerCase().includes(term) ||
            test.preparation.toLowerCase().includes(term) ||
            test.price.toString().includes(term)
        );

        setFilteredTests(filtered);
    }, [searchTerm, labTests]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center"
                style={{
                    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.4)), url(${labBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed'
                }}>
                <p className="text-gray-700">Loading lab tests...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center"
                style={{
                    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.4)), url(${labBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed'
                }}>
                <div className="bg-red-100 bg-opacity-60 text-red-700 p-4 rounded-md backdrop-blur-sm">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-fixed py-8 bg-white/50 backdrop-blur-sm"
            style={{
                backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), url(${labBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }}>
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold mb-6 text-center text-grey-100">Lab Tests</h1>
                <p className="text-grey-100 text-lg md:text-xl font-bold text-center max-w-3xl mx-auto mb-6">
                    Our comprehensive range of dermatological lab tests help identify underlying issues affecting your skin and hair health. All tests are performed by certified technicians and reviewed by our specialists.
                </p>

                {/* Search Box */}
                <div className="mb-6 max-w-md mx-auto">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search tests..."
                        className="w-full p-2 border rounded-md shadow-sm bg-white bg-opacity-70 backdrop-blur-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {filteredTests.length === 0 && (
                    <div className="text-center py-8 bg-white bg-opacity-50 backdrop-blur-sm rounded-lg shadow-md">
                        <p className="text-gray-700">No lab tests match your search criteria.</p>
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                    {filteredTests.map(test => (
                        <div
                            key={test.id}
                            className="rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                            style={{
                                background: `linear-gradient(to right bottom, rgba(255, 255, 255, 0.6), rgba(219, 234, 254, 0.6))`,
                                backdropFilter: "blur(6px)"
                            }}
                            ref={el => highlightRef.current[test.id] = el}
                        >
                            <div className="p-6">
                                <h2 className="text-xl font-semibold mb-2 text-blue-700">{test.name}</h2>
                                <p className="text-gray-700 mb-4">{test.description}</p>

                                <div className="bg-blue-50 bg-opacity-70 backdrop-blur-sm p-3 rounded-md mb-4">
                                    <h3 className="text-sm font-medium text-blue-800 mb-1">Preparation:</h3>
                                    <p className="text-sm text-blue-700">{test.preparation}</p>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-gray-800 font-bold">PKR {test.price.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LabTests;