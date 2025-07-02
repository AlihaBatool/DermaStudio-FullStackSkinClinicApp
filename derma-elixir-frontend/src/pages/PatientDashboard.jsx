// src/pages/PatientDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getUser, updateUser as updateUserInStorage } from '../utils/auth';
import { getAppointments, updateAppointmentStatus, updateUserProfile, getPatientHistory } from '../services/api';
import ReviewModal from '../components/reviews/ReviewModal';
import { generatePatientHistoryPDF } from '../components/utils';

const PatientDashboard = () => {
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('appointments');
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [profileData, setProfileData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        mobile: '',
        state: '',
        city: ''
    });
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [currentAppointment, setCurrentAppointment] = useState(null);
    const [patientHistory, setPatientHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [historyError, setHistoryError] = useState('');

    // Get user data from localStorage on component mount
    useEffect(() => {
        const userData = getUser();
        setUser(userData);
        if (userData) {
            // Initialize profile data when user data is available
            setProfileData({
                first_name: userData.first_name || '',
                last_name: userData.last_name || '',
                email: userData.email || '',
                mobile: userData.mobile || '',
                state: userData.state || '',
                city: userData.city || ''
            });
        }
    }, []);

    // Parse URL query parameters and set active tab
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const tabParam = searchParams.get('tab');
        if (tabParam && ['profile', 'appointments', 'medical-history'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [location.search]);

    // Fetch appointments when on appointments tab
    useEffect(() => {
        if (user && activeTab === 'appointments') {
            const fetchAppointments = async () => {
                setLoading(true);
                setError('');
                try {
                    // Pass the user ID to the API function
                    const response = await getAppointments(user.id);
                    if (response.success) {
                        setAppointments(response.appointments.map(apt => ({
                            id: apt.id,
                            date: apt.appointment_date,
                            time: apt.appointment_time,
                            treatmentName: apt.treatment?.name || 'Unknown Treatment',
                            treatmentCategory: apt.treatment?.category || 'Unknown Category',
                            specialistName: apt.specialist ? `Dr. ${apt.specialist.first_name} ${apt.specialist.last_name}` : 'Unknown Specialist',
                            specialistId: apt.specialist_id,
                            treatmentId: apt.treatment_id,
                            status: apt.status.charAt(0).toUpperCase() + apt.status.slice(1) // Capitalize first letter
                        })));
                    } else {
                        setError('Failed to load appointments.');
                    }
                } catch (err) {
                    console.error('Error fetching appointments:', err);
                    setError('Failed to load appointments. Please try again.');
                } finally {
                    setLoading(false);
                }
            };

            fetchAppointments();
        }
    }, [user, activeTab]);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData({
            ...profileData,
            [name]: value
        });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const response = await updateUserProfile(user.id, profileData);

            if (response.success) {
                // Update user in localStorage
                updateUserInStorage(profileData);

                // Update local state
                setUser({ ...user, ...profileData });

                setEditMode(false);
                setSuccessMessage('Profile updated successfully!');

                // Clear success message after 3 seconds
                setTimeout(() => {
                    setSuccessMessage('');
                }, 3000);
            } else {
                setError('Failed to update profile. Please try again.');
            }
        } catch (err) {
            console.error('Error updating profile:', err);
            setError('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelAppointment = async (appointmentId) => {
        if (!user) return;

        if (window.confirm('Are you sure you want to cancel this appointment?')) {
            try {
                // Pass the user ID when updating status
                const response = await updateAppointmentStatus(appointmentId, 'cancelled', user.id);
                if (response.success) {
                    // Update the local state to reflect the change
                    setAppointments(appointments.map(apt =>
                        apt.id === appointmentId ? { ...apt, status: 'Cancelled' } : apt
                    ));
                }
            } catch (err) {
                console.error('Error cancelling appointment:', err);
                alert('Failed to cancel appointment. Please try again.');
            }
        }
    };

    // Function to get status color class
    const getStatusColorClass = (status) => {
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

    const openReviewModal = (appointment) => {
        setCurrentAppointment(appointment);
        setShowReviewModal(true);
    };

    const closeReviewModal = () => {
        setShowReviewModal(false);
        setCurrentAppointment(null);
    };

    const handleReviewSubmitted = () => {
        // Refresh appointments data to show any updated status
        if (user && activeTab === 'appointments') {
            const fetchAppointments = async () => {
                setLoading(true);
                setError('');
                try {
                    const response = await getAppointments(user.id);
                    if (response.success) {
                        setAppointments(response.appointments.map(apt => ({
                            id: apt.id,
                            date: apt.appointment_date,
                            time: apt.appointment_time,
                            treatmentName: apt.treatment?.name || 'Unknown Treatment',
                            treatmentCategory: apt.treatment?.category || 'Unknown Category',
                            specialistName: apt.specialist ? `Dr. ${apt.specialist.first_name} ${apt.specialist.last_name}` : 'Unknown Specialist',
                            specialistId: apt.specialist_id,
                            treatmentId: apt.treatment_id,
                            status: apt.status.charAt(0).toUpperCase() + apt.status.slice(1)
                        })));
                    }
                } catch (err) {
                    console.error('Error fetching appointments:', err);
                    setError('Failed to refresh appointments data.');
                } finally {
                    setLoading(false);
                }
            };

            fetchAppointments();
        }
    };

    // Effect to fetch patient history
    useEffect(() => {
        if (user && activeTab === 'medical-history') {
            const fetchPatientHistory = async () => {
                setLoadingHistory(true);
                setHistoryError('');
                try {
                    const response = await getPatientHistory(user.id);
                    if (response.success) {
                        setPatientHistory(response.history);
                    } else {
                        setHistoryError('Failed to load medical history.');
                    }
                } catch (err) {
                    console.error('Error fetching patient history:', err);
                    setHistoryError('Failed to load medical history. Please try again.');
                } finally {
                    setLoadingHistory(false);
                }
            };

            fetchPatientHistory();
        }
    }, [user, activeTab]);

    // Function to generate PDF
    const generateHistoryPDF = () => {
        if (!user) return;

        generatePatientHistoryPDF(
            user,
            patientHistory,
            'My Medical History'
        );
    };


    return (
        <div className="bg-gradient-to-b from-blue-100 to-blue-300 py-26">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Patient Dashboard</h1>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Sidebar */}
                    <div className="md:w-1/4">
                        <div className="bg-blue-300 rounded-lg shadow-md p-4">
                            <div className="text-center mb-6">
                                <div className="w-24 h-24 rounded-full bg-blue-100 mx-auto flex items-center justify-center capitalize">
                                    <span className="text-3xl font-bold text-blue-600">
                                        {user?.first_name?.charAt(0) || ''}{user?.last_name?.charAt(0) || ''}
                                    </span>
                                </div>
                                <h2 className="text-xl font-semibold mt-3 capitalize">{user?.first_name} {user?.last_name}</h2>
                                <p className="text-gray-800">{user?.email}</p>
                            </div>

                            <div className="space-y-2">
                                <button
                                    onClick={() => setActiveTab('appointments')}
                                    className={`w-full text-left px-4 py-2 rounded-md cursor-pointer ${activeTab === 'appointments'
                                        ? 'bg-blue-50 text-blue-600 font-medium'
                                        : 'hover:bg-gray-100'
                                        }`}
                                >
                                    My Appointments
                                </button>
                                <button
                                    onClick={() => setActiveTab('medical-history')}
                                    className={`w-full text-left px-4 py-2 rounded-md cursor-pointer ${activeTab === 'medical-history'
                                        ? 'bg-blue-50 text-blue-600 font-medium'
                                        : 'hover:bg-gray-100'
                                        }`}
                                >
                                    Medical History
                                </button>
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`w-full text-left px-4 py-2 rounded-md cursor-pointer ${activeTab === 'profile'
                                        ? 'bg-blue-50 text-blue-600 font-medium'
                                        : 'hover:bg-gray-100'
                                        }`}
                                >
                                    My Profile
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="md:w-3/4">
                        <div className="bg-blue-300 rounded-lg shadow-md p-6">

                            {/* Appointments Tab */}
                            {activeTab === 'appointments' && (
                                <div>
                                    <div className="flex flex-wrap justify-between items-center mb-6">
                                        <h2 className="text-2xl font-semibold text-gray-800 font-bold">My Appointments</h2>
                                        <Link
                                            to="/appointments"
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
                                        >
                                            Book New Appointment
                                        </Link>
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

                                    {!loading && !error && appointments.length === 0 ? (
                                        <div className="text-center py-8">
                                            <p className="text-gray-600 mb-4">You don't have any appointments yet.</p>
                                            <Link
                                                to="/appointments"
                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
                                            >
                                                Book Your First Appointment
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto rounded-lg">
                                            <table className="min-w-full divide-y divide-gray-400">
                                                <thead className="bg-blue-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">
                                                            Date & Time
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">
                                                            Treatment
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">
                                                            Specialist
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-block-500 uppercase tracking-wider">
                                                            Status
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-blue-200 divide-y divide-gray-200">
                                                    {appointments.map((appointment) => (
                                                        <tr key={appointment.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {new Date(appointment.date).toLocaleDateString('en-US', {
                                                                        year: 'numeric',
                                                                        month: 'long',
                                                                        day: 'numeric'
                                                                    })}
                                                                </div>
                                                                <div className="text-sm text-gray-500">{appointment.time}</div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-900">{appointment.treatmentName}</div>
                                                                <div className="text-sm text-gray-500">{appointment.treatmentCategory}</div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-900">{appointment.specialistName}</div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(appointment.status)}`}>
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

                                                                        const details = `Appointment Details:
                                                                                        - Treatment: ${appointment.treatmentName} (${appointment.treatmentCategory})
                                                                                        - Date: ${formattedDate}
                                                                                        - Time: ${appointment.time}
                                                                                        - Specialist: ${appointment.specialistName}
                                                                                        - Status: ${appointment.status}`.trim();

                                                                        alert(details);
                                                                    }}
                                                                >
                                                                    View
                                                                </button>

                                                                {appointment.status.toLowerCase() === 'completed' && (
                                                                    <button
                                                                        className="text-green-600 hover:text-green-900 mr-4 cursor-pointer"
                                                                        onClick={() => openReviewModal(appointment)}
                                                                    >
                                                                        Review
                                                                    </button>
                                                                )}

                                                                {appointment.status.toLowerCase() !== 'cancelled' &&
                                                                    appointment.status.toLowerCase() !== 'completed' && (
                                                                        <button
                                                                            className="text-red-600 hover:text-red-900 cursor-pointer"
                                                                            onClick={() => handleCancelAppointment(appointment.id)}
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                    )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}
                            {/* Medical History Tab */}
                            {activeTab === 'medical-history' && (
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-semibold text-gray-800">Medical History</h2>
                                        <button
                                            onClick={generateHistoryPDF}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 cursor-pointer"
                                            disabled={loadingHistory || patientHistory.length === 0}
                                        >
                                            Generate PDF
                                        </button>
                                    </div>

                                    {loadingHistory && (
                                        <div className="text-center py-8">
                                            <p className="text-gray-600">Loading medical history...</p>
                                        </div>
                                    )}

                                    {historyError && (
                                        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
                                            {historyError}
                                        </div>
                                    )}

                                    {!loadingHistory && !historyError && patientHistory.length === 0 ? (
                                        <div className="text-center py-8">
                                            <p className="text-gray-600">No medical history records found.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {patientHistory.map((record) => (
                                                <div key={record.id} className="border rounded-lg p-4 hover:bg-gray-50 transition duration-150">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h3 className="text-lg font-medium">
                                                                {new Date(record.created_at).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric'
                                                                })}
                                                            </h3>
                                                            <p className="text-sm text-gray-800 font-bold">Dr. {record.specialist.first_name} {record.specialist.last_name}</p>
                                                        </div>
                                                    </div>

                                                    {record.diagnosis && (
                                                        <div className="mb-2">
                                                            <span className="font-semibold text-gray-700">Diagnosis:</span>
                                                            <p className="mt-1 text-gray-800">{record.diagnosis}</p>
                                                        </div>
                                                    )}

                                                    {record.medications && (
                                                        <div className="mb-2">
                                                            <span className="font-semibold text-gray-700">Medications:</span>
                                                            <p className="mt-1 text-gray-800">{record.medications}</p>
                                                        </div>
                                                    )}

                                                    {record.notes && (
                                                        <div>
                                                            <span className="font-semibold text-gray-700">Notes:</span>
                                                            <p className="mt-1 text-gray-800">{record.notes}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Profile Tab */}
                            {activeTab === 'profile' && (
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-semibold text-gray-800">My Profile</h2>
                                        {successMessage && (
                                            <div className="bg-green-100 text-green-700 p-4 rounded-md mb-4">
                                                {successMessage}
                                            </div>
                                        )}
                                        <button
                                            onClick={() => setEditMode(!editMode)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 cursor-pointer"
                                        >
                                            {editMode ? 'Cancel' : 'Edit Profile'}
                                        </button>
                                    </div>

                                    {error && (
                                        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
                                            {error}
                                        </div>
                                    )}

                                    {editMode ? (
                                        <form onSubmit={handleProfileSubmit}>
                                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <label className="block text-gray-700 font-medium mb-2">First Name</label>
                                                    <input
                                                        type="text"
                                                        name="first_name"
                                                        value={profileData.first_name}
                                                        onChange={handleProfileChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-gray-700 font-medium mb-2">Last Name</label>
                                                    <input
                                                        type="text"
                                                        name="last_name"
                                                        value={profileData.last_name}
                                                        onChange={handleProfileChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <label className="block text-gray-700 font-medium mb-2">Email</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={profileData.email}
                                                    onChange={handleProfileChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    required
                                                />
                                            </div>

                                            <div className="mb-4">
                                                <label className="block text-gray-700 font-medium mb-2">Mobile Number</label>
                                                <input
                                                    type="tel"
                                                    name="mobile"
                                                    value={profileData.mobile}
                                                    onChange={handleProfileChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    required
                                                />
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-4 mb-6">
                                                <div>
                                                    <label className="block text-gray-700 font-medium mb-2">State</label>
                                                    <input
                                                        type="text"
                                                        name="state"
                                                        value={profileData.state}
                                                        onChange={handleProfileChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-gray-700 font-medium mb-2">City</label>
                                                    <input
                                                        type="text"
                                                        name="city"
                                                        value={profileData.city}
                                                        onChange={handleProfileChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                                                disabled={loading}
                                            >
                                                {loading ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </form>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-500">First Name</h3>
                                                    <p className="mt-1 text-lg">{profileData.first_name || 'Not provided'}</p>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-500">Last Name</h3>
                                                    <p className="mt-1 text-lg">{profileData.last_name || 'Not provided'}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                                                <p className="mt-1 text-lg">{profileData.email || 'Not provided'}</p>
                                            </div>

                                            <div>
                                                <h3 className="text-sm font-medium text-gray-500">Mobile Number</h3>
                                                <p className="mt-1 text-lg">{profileData.mobile || 'Not provided'}</p>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-500">State</h3>
                                                    <p className="mt-1 text-lg">{profileData.state || 'Not provided'}</p>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-500">City</h3>
                                                    <p className="mt-1 text-lg">{profileData.city || 'Not provided'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <ReviewModal
                show={showReviewModal}
                appointment={currentAppointment}
                userId={user?.id}
                onClose={closeReviewModal}
                onSubmitted={handleReviewSubmitted}
            />
        </div>
    );
};

export default PatientDashboard;