// src/pages/TreatmentCategories.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { getTreatments } from '../services/api';
import skinTreatment from "../assets/skinTreatment.jpg";

const TreatmentCategories = () => {
    const [allTreatments, setAllTreatments] = useState([]);
    const [filteredData, setFilteredData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
    }, [location, filteredData]);

    useEffect(() => {
        const fetchTreatments = async () => {
            try {
                const treatments = await getTreatments();
                setAllTreatments(treatments);

                // Group treatments by category
                const grouped = groupByCategory(treatments);
                setFilteredData(grouped);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch treatments');
                setLoading(false);
                console.error(err);
            }
        };

        fetchTreatments();
    }, []);

    // Group treatments by category helper
    const groupByCategory = (treatments) => {
        // Create an empty object to store categorized treatments
        const categorized = {};
        // Loop through each treatment
        for (const treatment of treatments) {
            const category = treatment.category;
            // If this category doesn't exist yet in our object, create an empty array for it
            if (!categorized[category]) {
                categorized[category] = [];
            }
            // Add the current treatment to its category array
            categorized[category].push(treatment);
        }
        // Return the categorized treatments
        return categorized;
    };

    // Handle search with minimal code
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredData(groupByCategory(allTreatments));
            return;
        }

        const term = searchTerm.toLowerCase();
        const filtered = allTreatments.filter(treatment =>
            treatment.name.toLowerCase().includes(term) ||
            treatment.description.toLowerCase().includes(term) ||
            treatment.category.toLowerCase().includes(term) ||
            treatment.price.toString().includes(term)
        );

        setFilteredData(groupByCategory(filtered));
    }, [searchTerm, allTreatments]);

    if (loading) {
        return (
            <div className="bg-gray-100 py-8 min-h-screen flex items-center justify-center">
                <div className="text-xl text-gray-600">Loading treatments...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-100 py-8 min-h-screen flex items-center justify-center">
                <div className="text-xl text-red-600">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-fixed"
            style={{
                backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), url(${skinTreatment})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }}>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-center mb-6 text-gray-800 pt-6">Our Treatment Categories</h1>

                {/* Search Box */}
                <div className="mb-8 max-w-md mx-auto">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search treatments..."
                        className="w-full p-2 border rounded-md bg-white bg-opacity-70 backdrop-blur-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {Object.keys(filteredData).length === 0 && (
                    <div className="text-center py-8 bg-white bg-opacity-50 backdrop-blur-sm rounded-lg shadow-md">
                        <p className="text-gray-800">No treatments match your search criteria.</p>
                    </div>
                )}

                {Object.entries(filteredData).map(([category, treatments]) => (
                    <div key={category} className="mb-10">
                        <h2 className="text-2xl font-semibold mb-4 text-blue-700 border-b pb-2">{category}</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {treatments.map((treatment, index) => (
                                <div
                                    key={treatment.id || index}
                                    className="rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
                                    style={{
                                        background: `linear-gradient(to right bottom, rgba(255, 255, 255, 0.6), rgba(219, 234, 254, 0.6))`,
                                        backdropFilter: "blur(8px)"
                                    }}
                                    ref={el => highlightRef.current[treatment.id] = el}
                                >
                                    <div className="p-6 flex-grow flex flex-col">
                                        <h3 className="text-xl font-semibold mb-2 text-gray-800">{treatment.name}</h3>
                                        <p className="text-gray-700 mb-4 flex-grow">{treatment.description}</p>
                                        <div className="flex justify-between items-center mt-4">
                                            <span className="text-blue-700 font-bold">
                                                PKR {treatment.price.toLocaleString()}
                                            </span>
                                            <Link
                                                to="/appointments"
                                                className="bg-blue-600 bg-opacity-90 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-duration-300"
                                            >
                                                Book Now
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TreatmentCategories;