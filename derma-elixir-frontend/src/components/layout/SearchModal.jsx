import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getTreatments, getLabTests } from '../../services/api';
import Specialists from '../Specialists';

const SearchModal = ({ isOpen, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState({ treatments: [], labTests: [] });
    const [isLoading, setIsLoading] = useState(false);
    const searchRef = useRef(null);
    const searchInputRef = useRef(null);

    // Load data and handle search
    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
            return;
        }

        // Focus input when modal opens
        setTimeout(() => searchInputRef.current?.focus(), 100);

        // Only fetch data when modal opens and search term changes
        const fetchAndFilter = async () => {
            try {
                setIsLoading(true);
                const [treatments, labTests] = await Promise.all([
                    getTreatments(),
                    getLabTests()
                ]);

                // Filter results if search term exists
                const term = searchTerm.toLowerCase();
                if (term) {
                    setResults({
                        treatments: treatments
                            .filter(t => t.name.toLowerCase().includes(term) ||
                                t.description.toLowerCase().includes(term))
                            .slice(0, 5),
                        labTests: labTests
                            .filter(t => t.name.toLowerCase().includes(term) ||
                                t.description.toLowerCase().includes(term))
                            .slice(0, 5)
                    });
                } else {
                    setResults({ treatments: [], labTests: [] });
                }
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching search data:', error);
                setIsLoading(false);
            }
        };

        fetchAndFilter();
    }, [isOpen, searchTerm]);

    // Handle clicks outside and ESC key
    useEffect(() => {
        if (!isOpen) return;

        const handleOutsideClick = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) onClose();
        };

        const handleEscKey = (e) => {
            if (e.key === 'Escape') onClose();
        };

        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('keydown', handleEscKey);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Helper function to render search result items
    const renderResultItem = (item, type) => (
        <Link
            key={item.id}
            to={`/${type}?highlight=${item.id}`}  // Add the highlight parameter
            className="block p-3 rounded-lg hover:bg-blue-50"
            onClick={onClose}
        >
            <div className="font-medium text-blue-600 flex items-center">
                {item.name}
                <svg className="w-3 h-3 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
            </div>
            <p className="text-sm text-gray-600 line-clamp-1">{item.description}</p>
            <div className="text-sm font-medium text-gray-700 mt-1">
                PKR {item.price.toLocaleString()}
            </div>
        </Link>
    );


    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 px-4">
            <div
                ref={searchRef}
                className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[80vh] flex flex-col"
            >
                {/* Search Input */}
                <div className="p-4 border-b">
                    <div className="relative">
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search for treatments, lab tests..."
                            className="w-full p-3 pl-10 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <svg className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {searchTerm && (
                            <button
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                onClick={() => setSearchTerm('')}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Results or Quick Links */}
                <div className="overflow-y-auto flex-grow">
                    {/* Loading state */}
                    {isLoading && (
                        <div className="p-8 text-center text-gray-500">
                            <svg className="animate-spin h-8 w-8 mx-auto mb-2 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Loading...
                        </div>
                    )}

                    {/* No results message */}
                    {!isLoading && searchTerm && results.treatments.length === 0 && results.labTests.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            No results found for "{searchTerm}"
                        </div>
                    )}

                    {/* Quick links when no search term */}
                    {!isLoading && !searchTerm && (
                        <div className="p-3">
                            <div className="flex justify-start space-x-2 ml-1">
                                {['treatments', 'lab-tests', 'about'].map((item, index) => (
                                    <Link
                                        key={item}
                                        to={`/${item}${item === 'about' ? '#bottom' : ''}`}
                                        rel="noopener noreferrer"
                                        className={`px-4 py-2 ${index === 0 ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : 'bg-green-50 text-green-700 hover:bg-green-100'} rounded-full flex items-center space-x-1 text-sm font-medium`}
                                        onClick={onClose}
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={index === 0
                                                ? "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                                                : "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"} />
                                        </svg>
                                        <span>{index === 0 ? 'Treatments' : index == 1 ? 'Lab Tests': 'Specialists'}</span>
                                        <svg className="w-3 h-3 text-black" fill="none" stroke="black" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Treatment Results */}
                    {!isLoading && results.treatments.length > 0 && (
                        <div className="p-4">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Treatments</h3>
                            <div className="space-y-2">
                                {results.treatments.map(treatment => renderResultItem(treatment, 'treatments'))}

                                <Link
                                    to="/treatments"
                                    rel="noopener noreferrer"
                                    className="block text-center text-blue-600 hover:text-blue-800 font-medium py-2"
                                    onClick={onClose}
                                >
                                    View all treatments
                                    <svg className="w-3 h-3 ml-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Lab Test Results */}
                    {!isLoading && results.labTests.length > 0 && (
                        <div className="p-4 border-t">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Lab Tests</h3>
                            <div className="space-y-2">
                                {results.labTests.map(test => renderResultItem(test, 'lab-tests'))}

                                <Link
                                    to="/lab-tests"
                                    rel="noopener noreferrer"
                                    className="block text-center text-blue-600 hover:text-blue-800 font-medium py-2"
                                    onClick={onClose}
                                >
                                    View all lab tests
                                    <svg className="w-3 h-3 ml-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Close button */}
                <div className="p-4 border-t text-right">
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 font-medium cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SearchModal;