import React, { useState, useEffect } from 'react';
import { getSpecialists } from '../services/api';
import specialistsBg from "../assets/specialistsBg.jpg";

const Specialists = () => {
    const [specialists, setSpecialists] = useState([]);
    const [filteredSpecialists, setFilteredSpecialists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchSpecialists = async () => {
            try {
                setLoading(true);
                const response = await getSpecialists();
                if (response.success) {
                    const data = response.specialists || [];
                    setSpecialists(data);
                    setFilteredSpecialists(data);
                } else {
                    setError('Failed to fetch specialists');
                }
            } catch (err) {
                setError('Error fetching specialists: ' + (err.message || 'Unknown error'));
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSpecialists();
    }, []);

    // Filter specialists based on search term
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredSpecialists(specialists);
            return;
        }

        const term = searchTerm.toLowerCase();
        const filtered = specialists.filter(specialist =>
            `${specialist.first_name} ${specialist.last_name}`.toLowerCase().includes(term) ||
            (specialist.specialty && specialist.specialty.toLowerCase().includes(term))
        );

        setFilteredSpecialists(filtered);
    }, [searchTerm, specialists]);

    // Function to generate initials from name
    const getInitials = (firstName, lastName) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading specialists...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12 text-red-600">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="relative py-16 p-2">
            {/* Background Image */}
            <div className="absolute inset-0 z-0 rounded-lg">
                <img
                    src={specialistsBg}
                    alt=""
                    className="w-full h-full object-cover opacity-50 rounded-lg"
                />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Meet Our Experts</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
                    Our team of world-class dermatologists and skin health professionals are dedicated to providing exceptional, personalized care.
                </p>

                {/* Search Box */}
                <div className="mb-8 max-w-md mx-auto">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name or specialty..."
                        className="w-full p-3 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {filteredSpecialists.length === 0 && (
                    <div className="text-center py-8 bg-white rounded-lg shadow-md max-w-md mx-auto">
                        <p className="text-gray-600">No specialists match your search criteria.</p>
                    </div>
                )}

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {filteredSpecialists.map((specialist) => (
                        <div
                            key={specialist.id}
                            className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl"
                        >
                            <div className="relative h-64 overflow-hidden">
                                {/* Enhanced gradient background for initials */}
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-400">
                                    <span className="text-6xl font-bold text-white drop-shadow-md">
                                        {getInitials(specialist.first_name, specialist.last_name)}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 text-center">
                                <h3 className="text-xl font-bold text-gray-800 mb-1">
                                    Dr. {specialist.first_name} {specialist.last_name}
                                </h3>
                                <p className="text-blue-600 font-medium mb-2">
                                    {specialist.specialty || "-"}
                                </p>
                                <p className="text-gray-500 italic text-sm">
                                    Licensed Professional
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Specialists;