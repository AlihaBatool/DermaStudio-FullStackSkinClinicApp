// src/pages/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getUser } from '../utils/auth';
import {
    getAppointments, getTreatments, createTreatment, deleteTreatment, updateTreatment, getUsers, getCertificate, getLicense, getLabTests,
    createLabTest,
    deleteLabTest,
    updateLabTest
} from '../services/api';
import { useLocation } from 'react-router-dom';

const AdminDashboard = () => {
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('users');
    const [activeFilter, setActiveFilter] = useState('all'); // Track selected filter
    const [allAppointments, setAllAppointments] = useState([]); // New state
    const [users, setUsers] = useState([]);
    const [treatments, setTreatments] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showAddTreatmentModal, setShowAddTreatmentModal] = useState(false);
    const [newTreatment, setNewTreatment] = useState({
        name: '',
        description: '',
        category: '',
        price: ''
    });
    const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, id: null });
    const [showEditTreatmentModal, setShowEditTreatmentModal] = useState(false);
    const [editingTreatment, setEditingTreatment] = useState({
        id: null,
        name: '',
        description: '',
        category: '',
        price: ''
    });
    // Lab Test state
    const [labTests, setLabTests] = useState([]);
    const [showAddLabTestModal, setShowAddLabTestModal] = useState(false);
    const [newLabTest, setNewLabTest] = useState({
        name: '',
        description: '',
        preparation: '',
        price: ''
    });
    const [showEditLabTestModal, setShowEditLabTestModal] = useState(false);
    const [editingLabTest, setEditingLabTest] = useState({
        id: null,
        name: '',
        description: '',
        preparation: '',
        price: ''
    });

    // Get user data from localStorage on component mount
    useEffect(() => {
        const userData = getUser();
        setUser(userData);
    }, []);

    // Parse URL query parameters and set active tab
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const tabParam = searchParams.get('tab');
        if (tabParam && ['profile', 'appointments', 'medical-history'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [location.search]);

    const fetchAppointments = useCallback(async () => {
        if (!user) return;

        setLoading(true);
        setError('');
        try {
            const response = await getAppointments(user.id);
            if (response.success) {
                const mappedAppointments = response.appointments.map(apt => ({
                    id: apt.id,
                    patient: apt.patient ? `${apt.patient.first_name} ${apt.patient.last_name}` : 'Unknown Patient',
                    specialist: apt.specialist ? `Dr. ${apt.specialist.first_name} ${apt.specialist.last_name}` : 'Unknown Specialist',
                    date: apt.appointment_date,
                    time: apt.appointment_time,
                    treatment: apt.treatment?.name || 'Unknown Treatment',
                    status: apt.status.charAt(0).toUpperCase() + apt.status.slice(1)
                }));
                setAllAppointments(mappedAppointments);
                setAppointments(mappedAppointments);
            } else {
                setError('Failed to load appointments.');
                setAllAppointments([]);
                setAppointments([]);
            }
        } catch (err) {
            console.error('Error fetching appointments:', err);
            setError('Failed to load appointments. Please try again.');
            setAllAppointments([]);
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const fetchLabTests = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getLabTests();
            setLabTests(response);
        } catch (error) {
            console.error('Error fetching lab tests:', error);
            setLabTests([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getUsers();
            if (response.success) {
                // Map the API response to the format your component expects
                const mappedUsers = response.users.map(user => ({
                    id: user.id,
                    name: `${user.first_name} ${user.last_name}`,
                    email: user.email,
                    user_type: user.user_type,
                    has_certificate: user.has_certificate || false,
                    has_license: user.has_license || false,
                    specialty: user.specialty || ''
                }));
                setUsers(mappedUsers);
            } else {
                setError('Failed to load users.');
                setUsers([]);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to load users. Please try again.');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchTreatments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getTreatments();
            setTreatments(response);
        } catch (error) {
            console.error('Error fetching treatments:', error);
            setTreatments([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        } else if (activeTab === 'treatments') {
            fetchTreatments();
        } else if (activeTab === 'lab-tests') {
            fetchLabTests();
        } else if (activeTab === 'appointments') {
            fetchAppointments();
        }
    }, [activeTab, fetchAppointments, fetchUsers, fetchTreatments, fetchLabTests]);

    // Lab Test handlers
    const handleAddLabTest = async (e) => {
        e.preventDefault();
        try {
            await createLabTest(newLabTest);
            // Reset form and close modal
            setNewLabTest({ name: '', description: '', preparation: '', price: '' });
            setShowAddLabTestModal(false);
            // Refresh lab tests list
            fetchLabTests();
        } catch (error) {
            console.error('Error creating lab test:', error);
            alert('Failed to create lab test. Please try again.');
        }
    };

    const handleDeleteLabTest = async (id) => {
        try {
            await deleteLabTest(id);
            // Refresh lab tests list
            fetchLabTests();
            // Close confirmation dialog
            setDeleteConfirmation({ show: false, id: null, type: '' });
        } catch (error) {
            console.error('Error deleting lab test:', error);
            alert('Failed to delete lab test. Please try again.');
        }
    };

    const handleEditLabTest = async (e) => {
        e.preventDefault();
        try {
            await updateLabTest(editingLabTest.id, {
                name: editingLabTest.name,
                description: editingLabTest.description,
                preparation: editingLabTest.preparation,
                price: editingLabTest.price
            });
            // Close modal
            setShowEditLabTestModal(false);
            // Refresh lab tests list
            fetchLabTests();
        } catch (error) {
            console.error('Error updating lab test:', error);
            alert('Failed to update lab test. Please try again.');
        }
    };

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        } else if (activeTab === 'treatments') {
            fetchTreatments();
        } else if (activeTab === 'appointments') {
            fetchAppointments();
        }
    }, [activeTab, fetchAppointments, fetchUsers, fetchTreatments]);

    const handleViewCertificate = async (userId) => {
        try {
            const response = await getCertificate(userId);

            // Create a blob URL and open in new tab
            const url = window.URL.createObjectURL(new Blob([response], { type: 'application/pdf' }));
            window.open(url, '_blank');
        } catch (error) {
            console.error('Error fetching certificate:', error);
            alert('Failed to view certificate. Please try again.');
        }
    };

    const handleViewLicense = async (userId) => {
        try {
            const response = await getLicense(userId);

            // Create a blob URL and open in new tab
            const url = window.URL.createObjectURL(new Blob([response], { type: 'application/pdf' }));
            window.open(url, '_blank');
        } catch (error) {
            console.error('Error fetching license:', error);
            alert('Failed to view license. Please try again.');
        }
    };


    const handleAddTreatment = async (e) => {
        e.preventDefault();
        try {
            await createTreatment(newTreatment);
            // Reset form and close modal
            setNewTreatment({ name: '', description: '', category: '', price: '' });
            setShowAddTreatmentModal(false);
            // Refresh treatments list
            fetchTreatments();
        } catch (error) {
            console.error('Error creating treatment:', error);
            alert('Failed to create treatment. Please try again.');
        }
    };

    const handleDeleteTreatment = async (id) => {
        try {
            await deleteTreatment(id);
            // Refresh treatments list
            fetchTreatments();
            // Close confirmation dialog
            setDeleteConfirmation({ show: false, id: null });
        } catch (error) {
            console.error('Error deleting treatment:', error);
            alert('Failed to delete treatment. Please try again.');
        }
    };

    const handleEditTreatment = async (e) => {
        e.preventDefault();
        try {
            await updateTreatment(editingTreatment.id, {
                name: editingTreatment.name,
                description: editingTreatment.description,
                category: editingTreatment.category,
                price: editingTreatment.price
            });
            // Close modal
            setShowEditTreatmentModal(false);
            // Refresh treatments list
            fetchTreatments();
        } catch (error) {
            console.error('Error updating treatment:', error);
            alert('Failed to update treatment. Please try again.');
        }
    };


    // Function to get status color class
    const getAppointmentStatusColorClass = (status) => {
        switch (status.toLowerCase()) {
            case 'confirmed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            case 'pending':
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    // Filter appointments by date
    const filterAppointmentsByDate = (filter) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);

        let filteredAppointments;
        switch (filter) {
            case 'today':
                filteredAppointments = allAppointments.filter(apt => new Date(apt.date).toDateString() === today.toDateString());
                break;
            case 'tomorrow':
                filteredAppointments = allAppointments.filter(apt => new Date(apt.date).toDateString() === tomorrow.toDateString());
                break;
            case 'week':
                filteredAppointments = allAppointments.filter(apt => {
                    const aptDate = new Date(apt.date);
                    return aptDate >= today && aptDate < weekEnd;
                });
                break;
            default:
                filteredAppointments = allAppointments;
        }
        setAppointments(filteredAppointments);
        setActiveFilter(filter);
    };
    return (
        <div className="bg-gradient-to-r from-blue-100 to-blue-400 py-8">
            <div className="container mx-auto px-4">

                <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>
                <p className="text-gray-600 mb-6">Logged in as: {user?.email || 'Admin'}</p>


                <div className="mb-6">
                    <div className="flex flex-wrap border-b">
                        <button
                            className={`px-4 py-2 font-medium cursor-pointer ${activeTab === 'users'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                            onClick={() => setActiveTab('users')}
                        >
                            Users
                        </button>
                        <button
                            className={`px-4 py-2 font-medium cursor-pointer ${activeTab === 'treatments'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                            onClick={() => setActiveTab('treatments')}
                        >
                            Treatments
                        </button>
                        <button
                            className={`px-4 py-2 font-medium cursor-pointer ${activeTab === 'lab-tests'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                            onClick={() => setActiveTab('lab-tests')}
                        >
                            Lab Tests
                        </button>
                        <button
                            className={`px-4 py-2 font-medium cursor-pointer ${activeTab === 'appointments'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                            onClick={() => setActiveTab('appointments')}
                        >
                            Appointments
                        </button>
                    </div>
                </div>

                <div className="bg-gradient-to-b from-blue-100 to-blue-400 rounded-lg shadow-md p-6">
                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-800">Users</h2>
                            </div>

                            {loading && users.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-600">Loading users...</p>
                                </div>
                            ) : error ? (
                                <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
                                    {error}
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full border-2 border-black divide-y divide-gray-200">
                                        <thead className="bg-blue-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    Name
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    Email
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    Role
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    Files
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-blue-100 border-black border-2 divide-y divide-gray-200">
                                            {users.length > 0 ? (
                                                users.map((user) => (
                                                    <tr key={user.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-700">{user.email}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {user.user_type === 'patient' ? (
                                                                <div className="flex items-center">
                                                                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 capitalize">
                                                                        {user.user_type}
                                                                    </span>
                                                                </div>
                                                            ) : user.user_type === 'specialist' ? (
                                                                <div className="flex items-center">
                                                                    <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 capitalize">
                                                                        {user.user_type}
                                                                    </span>
                                                                    {user.specialty && (
                                                                        <span className="ml-2 text-xs text-gray-700">({user.specialty})</span>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className="text-sm text-gray-900 capitalize">{user.user_type}</div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            {user.user_type === 'patient' && user.has_certificate && (
                                                                <button
                                                                    className="text-blue-600 hover:text-blue-700 cursor-pointer"
                                                                    onClick={() => handleViewCertificate(user.id)}
                                                                >
                                                                    View Certificate
                                                                </button>
                                                            )}
                                                            {user.user_type === 'specialist' && user.has_license && (
                                                                <button
                                                                    className="text-purple-600 hover:text-purple-700 ml-4 cursor-pointer"
                                                                    onClick={() => handleViewLicense(user.id)}
                                                                >
                                                                    View License
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                                        No users found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Treatments Tab  */}
                    {activeTab === 'treatments' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-800">Treatments</h2>
                                <button
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300  cursor-pointer"
                                    onClick={() => setShowAddTreatmentModal(true)}
                                >
                                    Add New Treatment
                                </button>
                            </div>

                            {loading && treatments.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-600">Loading treatments...</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gradient-to-r from-blue-100 to-blue-300">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Name
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Category
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Price
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-gradient-to-l from-blue-100 to-blue-300 divide-y divide-gray-200">
                                            {treatments.map((treatment) => (
                                                <tr key={treatment.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{treatment.name}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-700">{treatment.category}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">PKR {treatment.price.toLocaleString()}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <button
                                                            className="text-blue-600 hover:text-blue-900 mr-4 cursor-pointer"
                                                            onClick={() => {
                                                                setEditingTreatment({
                                                                    id: treatment.id,
                                                                    name: treatment.name,
                                                                    description: treatment.description || '',
                                                                    category: treatment.category,
                                                                    price: treatment.price
                                                                });
                                                                setShowEditTreatmentModal(true);
                                                            }}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="text-red-600 hover:text-red-900 cursor-pointer"
                                                            onClick={() => setDeleteConfirmation({ show: true, id: treatment.id, type: 'treatment' })}
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Lab Tests Tab */}
                    {activeTab === 'lab-tests' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-800">Lab Tests</h2>
                                <button
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 cursor-pointer"
                                    onClick={() => setShowAddLabTestModal(true)}
                                >
                                    Add New Lab Test
                                </button>
                            </div>

                            {loading && labTests.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-600">Loading lab tests...</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gradient-to-l from-blue-100 to-blue-300 ">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    Name
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    Preparation
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    Price
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-gradient-to-l from-blue-100 to-blue-300 divide-y divide-gray-200">
                                            {labTests.length > 0 ? (
                                                labTests.map((labTest) => (
                                                    <tr key={labTest.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">{labTest.name}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-700">{labTest.preparation}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">PKR {labTest.price.toLocaleString()}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <button
                                                                className="text-blue-600 hover:text-blue-900 mr-4 cursor-pointer"
                                                                onClick={() => {
                                                                    setEditingLabTest({
                                                                        id: labTest.id,
                                                                        name: labTest.name,
                                                                        description: labTest.description || '',
                                                                        preparation: labTest.preparation || '',
                                                                        price: labTest.price
                                                                    });
                                                                    setShowEditLabTestModal(true);
                                                                }}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                className="text-red-600 hover:text-red-900 cursor-pointer"
                                                                onClick={() => setDeleteConfirmation({ show: true, id: labTest.id, type: 'labTest' })}
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                                        No lab tests found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Appointments Tab */}
                    {activeTab === 'appointments' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-800">Appointments</h2>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => {
                                            fetchAppointments(); // Reset to full list
                                            setActiveFilter('all');
                                        }}
                                        className={`px-4 py-2 border cursor-pointer border-gray-300 rounded-md ${activeFilter === 'all' ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        All
                                    </button>
                                    <button
                                        onClick={() => filterAppointmentsByDate('today')}
                                        className={`px-4 py-2 cursor-pointer border border-gray-300 rounded-md ${activeFilter === 'today' ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        Today
                                    </button>
                                    <button
                                        onClick={() => filterAppointmentsByDate('tomorrow')}
                                        className={`px-4 py-2 cursor-pointer border border-gray-300 rounded-md ${activeFilter === 'tomorrow' ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        Tomorrow
                                    </button>
                                    <button
                                        onClick={() => filterAppointmentsByDate('week')}
                                        className={`px-4 py-2 cursor-pointer border border-gray-300 rounded-md ${activeFilter === 'week' ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        This Week
                                    </button>
                                </div>
                            </div>

                            {loading && (
                                <div className="text-center py-8">
                                    <p className="text-gray-600">Loading appointments...</p>
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
                                    {error}
                                </div>
                            )}

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gradient-to-l from-blue-100 to-blue-300">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Patient
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Specialist
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Date & Time
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Treatment
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-gradient-to-l from-blue-100 to-blue-300 divide-y divide-gray-200">
                                        {appointments.map((appointment) => (
                                            <tr key={appointment.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{appointment.patient}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{appointment.specialist}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {new Date(appointment.date).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </div>
                                                    <div className="text-sm text-gray-700">{appointment.time}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{appointment.treatment}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getAppointmentStatusColorClass(appointment.status)}`}>
                                                        {appointment.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        className="text-blue-600 hover:text-blue-900 mr-4 cursor-pointer"
                                                        onClick={() => {
                                                            // Create a formatted modal with appointment details
                                                            const formattedDate = new Date(appointment.date).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                                weekday: 'long'
                                                            });

                                                            const details = `
                                                                                        Appointment Details:
                                                                                        - Treatment: ${appointment.treatment} 
                                                                                        - Date: ${formattedDate}
                                                                                        - Time: ${appointment.time}
                                                                                        - Specialist: ${appointment.specialist}                                                                                       `.trim();

                                                            alert(details);
                                                        }}
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Add Treatment Modal - Enhanced Professional Design */}
            {showAddTreatmentModal && (
                <div className="fixed inset-0 bg-gray-500/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-800">Add New Treatment</h3>
                            <button
                                onClick={() => setShowAddTreatmentModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition duration-150"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleAddTreatment}>
                            <div className="mb-5">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Treatment Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                                    value={newTreatment.name}
                                    onChange={(e) => setNewTreatment({ ...newTreatment, name: e.target.value })}
                                    placeholder="Enter treatment name"
                                    required
                                />
                            </div>

                            <div className="mb-5">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Description
                                </label>
                                <textarea
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                                    value={newTreatment.description}
                                    onChange={(e) => setNewTreatment({ ...newTreatment, description: e.target.value })}
                                    placeholder="Enter treatment description"
                                    rows="3"
                                    required
                                />
                            </div>

                            <div className="mb-5">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Category
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                                    value={newTreatment.category}
                                    onChange={(e) => setNewTreatment({ ...newTreatment, category: e.target.value })}
                                    placeholder="Enter category"
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Price (PKR)
                                </label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                                    value={newTreatment.price}
                                    onChange={(e) => setNewTreatment({ ...newTreatment, price: e.target.value })}
                                    placeholder="Enter price"
                                    required
                                />
                            </div>

                            <div className="flex justify-end mt-8">
                                <button
                                    type="button"
                                    className="px-4 py-2 mr-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
                                    onClick={() => setShowAddTreatmentModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
                                >
                                    Add Treatment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Treatment Modal - Enhanced Professional Design */}
            {showEditTreatmentModal && (
                <div className="fixed inset-0 bg-gray-500/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-800">Edit Treatment</h3>
                            <button
                                onClick={() => setShowEditTreatmentModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition duration-150"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleEditTreatment}>
                            <div className="mb-5">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Treatment Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                                    value={editingTreatment.name}
                                    onChange={(e) => setEditingTreatment({ ...editingTreatment, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="mb-5">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Description
                                </label>
                                <textarea
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                                    value={editingTreatment.description}
                                    onChange={(e) => setEditingTreatment({ ...editingTreatment, description: e.target.value })}
                                    rows="3"
                                    required
                                />
                            </div>

                            <div className="mb-5">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Category
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                                    value={editingTreatment.category}
                                    onChange={(e) => setEditingTreatment({ ...editingTreatment, category: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Price (PKR)
                                </label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                                    value={editingTreatment.price}
                                    onChange={(e) => setEditingTreatment({ ...editingTreatment, price: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="flex justify-end mt-8">
                                <button
                                    type="button"
                                    className="px-4 py-2 mr-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
                                    onClick={() => setShowEditTreatmentModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmation.show && (
                <div className="fixed inset-0 bg-gray-500/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-sm">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Delete {deleteConfirmation.type === 'treatment' ? 'Treatment' : 'Lab Test'}</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Are you sure you want to delete this {deleteConfirmation.type === 'treatment' ? 'treatment' : 'lab test'}? This action cannot be undone.
                            </p>
                        </div>

                        <div className="flex justify-center space-x-4">
                            <button
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
                                onClick={() => setDeleteConfirmation({ show: false, id: null, type: '' })}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150"
                                onClick={() => deleteConfirmation.type === 'treatment'
                                    ? handleDeleteTreatment(deleteConfirmation.id)
                                    : handleDeleteLabTest(deleteConfirmation.id)
                                }
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Lab Test Modal */}
            {showAddLabTestModal && (
                <div className="fixed inset-0 bg-gray-500/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-800">Add New Lab Test</h3>
                            <button
                                onClick={() => setShowAddLabTestModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition duration-150"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleAddLabTest}>
                            <div className="mb-5">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Lab Test Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                                    value={newLabTest.name}
                                    onChange={(e) => setNewLabTest({ ...newLabTest, name: e.target.value })}
                                    placeholder="Enter lab test name"
                                    required
                                />
                            </div>

                            <div className="mb-5">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Description
                                </label>
                                <textarea
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                                    value={newLabTest.description}
                                    onChange={(e) => setNewLabTest({ ...newLabTest, description: e.target.value })}
                                    placeholder="Enter lab test description"
                                    rows="3"
                                    required
                                />
                            </div>

                            <div className="mb-5">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Preparation
                                </label>
                                <textarea
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                                    value={newLabTest.preparation}
                                    onChange={(e) => setNewLabTest({ ...newLabTest, preparation: e.target.value })}
                                    placeholder="Enter preparation instructions"
                                    rows="2"
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Price (PKR)
                                </label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                                    value={newLabTest.price}
                                    onChange={(e) => setNewLabTest({ ...newLabTest, price: e.target.value })}
                                    placeholder="Enter price"
                                    required
                                />
                            </div>

                            <div className="flex justify-end mt-8">
                                <button
                                    type="button"
                                    className="px-4 py-2 mr-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
                                    onClick={() => setShowAddLabTestModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
                                >
                                    Add Lab Test
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Lab Test Modal */}
            {showEditLabTestModal && (
                <div className="fixed inset-0 bg-gray-500/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-800">Edit Lab Test</h3>
                            <button
                                onClick={() => setShowEditLabTestModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition duration-150"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleEditLabTest}>
                            <div className="mb-5">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Lab Test Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                                    value={editingLabTest.name}
                                    onChange={(e) => setEditingLabTest({ ...editingLabTest, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="mb-5">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Description
                                </label>
                                <textarea
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                                    value={editingLabTest.description}
                                    onChange={(e) => setEditingLabTest({ ...editingLabTest, description: e.target.value })}
                                    rows="3"
                                    required
                                />
                            </div>

                            <div className="mb-5">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Preparation
                                </label>
                                <textarea
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                                    value={editingLabTest.preparation}
                                    onChange={(e) => setEditingLabTest({ ...editingLabTest, preparation: e.target.value })}
                                    rows="2"
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Price (PKR)
                                </label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                                    value={editingLabTest.price}
                                    onChange={(e) => setEditingLabTest({ ...editingLabTest, price: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="flex justify-end mt-8">
                                <button
                                    type="button"
                                    className="px-4 py-2 mr-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
                                    onClick={() => setShowEditLabTestModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150  cursor-pointer"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
