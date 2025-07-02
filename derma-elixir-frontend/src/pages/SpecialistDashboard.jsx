// src/pages/SpecialistDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getUser, updateUser as updateUserInStorage } from '../utils/auth';
import { getAppointments, updateAppointmentStatus, updateUserProfile, getPatientHistory, addPatientHistory } from '../services/api';
import { useLocation } from 'react-router-dom';
import { generatePatientHistoryPDF } from '../components/utils';

const SpecialistDashboard = () => {
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('appointments');
    const [activeFilter, setActiveFilter] = useState('all');
    const [appointments, setAppointments] = useState([]);
    const [allAppointments, setAllAppointments] = useState([]);
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
        city: '',
        specialty: ''
    });

    // Patient History State
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientHistory, setPatientHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [historyForm, setHistoryForm] = useState({
        diagnosis: '',
        medications: '',
        notes: ''
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
        if (tabParam && ['profile', 'appointments', 'patient-history', 'medical-history'].includes(tabParam)) {
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
                    patient_id: apt.patient_id,
                    patientName: apt.patient ? `${apt.patient.first_name} ${apt.patient.last_name}` : 'Unknown Patient',
                    patientEmail: apt.patient?.email || '',
                    date: apt.appointment_date,
                    time: apt.appointment_time,
                    specialist: apt.specialist ? `Dr. ${apt.specialist.first_name} ${apt.specialist.last_name}` : 'Unknown Specialist',
                    treatmentName: apt.treatment?.name || 'Unknown Treatment',
                    treatmentCategory: apt.treatment?.category || 'Unknown Category',
                    status: apt.status.charAt(0).toUpperCase() + apt.status.slice(1)
                }));
                setAllAppointments(mappedAppointments); // Store full list
                setAppointments(mappedAppointments); // Set initial filtered list
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

    useEffect(() => {
        if (user) {
            setProfileData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                mobile: user.mobile || '',
                state: user.state || '',
                city: user.city || '',
                specialty: user.specialty || ''
            });
        }

        // Fetch appointments when on appointments tab
        if (activeTab === 'appointments') {
            fetchAppointments();
        }
    }, [user, activeTab, fetchAppointments]);


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


    const handleAppointmentAction = async (appointmentId, newStatus) => {
        if (!user) return;

        try {
            // Pass the user ID when updating status
            const response = await updateAppointmentStatus(appointmentId, newStatus, user.id);
            if (response.success) {
                fetchAppointments();
            }
        } catch (err) {
            console.error(`Error updating appointment to ${newStatus}:`, err);
            alert(`Failed to update appointment. Please try again.`);
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
                filteredAppointments = allAppointments; // Reset to full list
        }
        setAppointments(filteredAppointments); // Update displayed appointments
        setActiveFilter(filter); // Track the active filter
    };

    // Patient History Functions
    const fetchPatientHistory = async (patientId) => {
        setLoadingHistory(true);
        try {
            const response = await getPatientHistory(patientId);
            if (response.success) {
                setPatientHistory(response.history);
            } else {
                setError('Failed to load patient history.');
            }
        } catch (err) {
            console.error('Error fetching patient history:', err);
            setError('Failed to load patient history. Please try again.');
        } finally {
            setLoadingHistory(false);
        }
    };

    const handlePatientSelect = (patient) => {
        setSelectedPatient(patient);
        fetchPatientHistory(patient.id);
    };

    const handleHistoryFormChange = (e) => {
        const { name, value } = e.target;
        setHistoryForm({
            ...historyForm,
            [name]: value
        });
    };

    const handleHistoryFormSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPatient || !user) return;

        // Clear any previous error messages when attempting a new submission
        setError('');

        // Check if at least one field has data
        if (!historyForm.diagnosis.trim() && !historyForm.medications.trim() && !historyForm.notes.trim()) {
            setError('Please fill in at least one field (Diagnosis, Medications, or Notes)');
            return;
        }

        setLoading(true);
        try {
            const historyData = {
                patient_id: selectedPatient.id,
                specialist_id: user.id,
                diagnosis: historyForm.diagnosis,
                medications: historyForm.medications,
                notes: historyForm.notes
            };

            const response = await addPatientHistory(historyData);
            if (response.success) {
                // Reset form
                setHistoryForm({
                    diagnosis: '',
                    medications: '',
                    notes: ''
                });

                // Clear any error messages
                setError('');

                // Refresh history
                fetchPatientHistory(selectedPatient.id);
                setSuccessMessage('Patient history added successfully!');

                // Clear success message after 3 seconds
                setTimeout(() => {
                    setSuccessMessage('');
                }, 3000);
            } else {
                setError('Failed to add patient history.');
            }
        } catch (err) {
            console.error('Error adding patient history:', err);
            setError('Failed to add patient history. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    const generateHistoryPDF = () => {
        if (!selectedPatient) return;

        generatePatientHistoryPDF(
            selectedPatient,
            patientHistory,
            `${selectedPatient.name} - Medical History`
        );
    };

    return (
        <div className="bg-gradient-to-b from-blue-100 to-blue-300 py-10">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Specialist Dashboard</h1>

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
                            </div>

                            <div className="space-y-2">
                                <button
                                    onClick={() => setActiveTab('appointments')}
                                    className={`w-full text-left px-4 py-2 cursor-pointer rounded-md ${activeTab === 'appointments'
                                        ? 'bg-blue-50 text-blue-600 font-medium'
                                        : 'hover:bg-gray-100'
                                        }`}
                                >
                                    Appointments
                                </button>
                                <button
                                    onClick={() => setActiveTab('patient-history')}
                                    className={`w-full text-left cursor-pointer px-4 py-2 rounded-md ${activeTab === 'patient-history'
                                        ? 'bg-blue-50 text-blue-600 font-medium'
                                        : 'hover:bg-gray-100'
                                        }`}
                                >
                                    My Patients
                                </button>
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`w-full text-left cursor-pointer px-4 py-2 rounded-md ${activeTab === 'profile'
                                        ? 'bg-blue-50 text-blue-600 font-medium'
                                        : 'hover:bg-gray-100'
                                        }`}
                                >
                                    Profile Settings
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
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-semibold text-gray-800">Appointments</h2>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => {
                                                    setAppointments(allAppointments); // Reset to full list
                                                    setActiveFilter('all');
                                                }}
                                                className={`px-4 py-2 border cursor-pointer border-gray-300 rounded-md ${activeFilter === 'all' ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`}
                                            >
                                                All
                                            </button>
                                            <button
                                                onClick={() => filterAppointmentsByDate('today')}
                                                className={`px-4 py-2 cursor-pointer border border-gray-300 rounded-md ${activeFilter === 'today' ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`}
                                            >
                                                Today
                                            </button>
                                            <button
                                                onClick={() => filterAppointmentsByDate('tomorrow')}
                                                className={`px-4 py-2 cursor-pointer border border-gray-300 rounded-md ${activeFilter === 'tomorrow' ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`}
                                            >
                                                Tomorrow
                                            </button>
                                            <button
                                                onClick={() => filterAppointmentsByDate('week')}
                                                className={`px-4 py-2 cursor-pointer border border-gray-300 rounded-md ${activeFilter === 'week' ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`}
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

                                    {!loading && !error && appointments.length === 0 ? (
                                        <div className="text-center py-8">
                                            <p className="text-gray-600 mb-4">You don't have any appointments scheduled.</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto rounded-lg">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gradient-to-r from-blue-100 to-blue-400">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">
                                                            Patient
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">
                                                            Date & Time
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">
                                                            Treatment
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">
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
                                                                    {appointment.patientName}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {appointment.patientEmail}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {new Date(appointment.date).toLocaleDateString('en-US', {
                                                                        year: 'numeric',
                                                                        month: 'short',
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

                                                                        const details = `
                                                                                        Appointment Details:
                                                                                        - Treatment: ${appointment.treatmentName} (${appointment.treatmentCategory})
                                                                                        - Date: ${formattedDate}
                                                                                        - Time: ${appointment.time}
                                                                                        - Specialist: ${appointment.specialist}                                                                                       `.trim();

                                                                        alert(details);
                                                                    }}
                                                                >
                                                                    View
                                                                </button>

                                                                {appointment.status.toLowerCase() === 'pending' && (
                                                                    <button
                                                                        className="text-green-600 hover:text-green-900 mr-2 cursor-pointer"
                                                                        onClick={() => handleAppointmentAction(appointment.id, 'confirmed')}
                                                                    >
                                                                        Confirm
                                                                    </button>
                                                                )}

                                                                {appointment.status.toLowerCase() === 'confirmed' && (
                                                                    <button
                                                                        className="text-blue-600 hover:text-blue-900 mr-2 cursor-pointer"
                                                                        onClick={() => handleAppointmentAction(appointment.id, 'completed')}
                                                                    >
                                                                        Complete
                                                                    </button>
                                                                )}

                                                                {appointment.status.toLowerCase() !== 'cancelled' && appointment.status.toLowerCase() !== 'completed' && (
                                                                    <button
                                                                        className="text-red-600 hover:text-red-900 cursor-pointer"
                                                                        onClick={() => handleAppointmentAction(appointment.id, 'cancelled')}
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

                            {/* Patient History Tab */}
                            {activeTab === 'patient-history' && (
                                <div>
                                    <div className="flex justify-between items-center mb-6 py-15">
                                        <h2 className="text-2xl font-semibold text-gray-800">My Patients</h2>
                                    </div>

                                    {successMessage && (
                                        <div className="bg-green-100 text-green-700 p-4 rounded-md mb-4">
                                            {successMessage}
                                        </div>
                                    )}

                                    {error && (
                                        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
                                            {error}
                                        </div>
                                    )}

                                    <div className="grid md:grid-cols-3 gap-6">
                                        {/* Patient List */}
                                        <div className="md:col-span-1 bg-gradient-to-r from-blue-50 to-blue-400 p-4 rounded-lg">
                                            <h3 className="text-lg font-medium mb-4">Select Patient</h3>

                                            {/* Display unique patients from appointments */}
                                            <div className="space-y-2">
                                                {allAppointments
                                                    .filter((apt, index, self) =>
                                                        index === self.findIndex(a => a.patient_id === apt.patient_id)
                                                    )
                                                    .map((apt) => (
                                                        <div
                                                            key={apt.patient_id}
                                                            className={`p-3 rounded-md cursor-pointer ${selectedPatient && selectedPatient.id === apt.patient_id
                                                                ? 'bg-blue-100'
                                                                : 'hover:bg-gray-100'
                                                                }`}
                                                            onClick={() => handlePatientSelect({
                                                                id: apt.patient_id,
                                                                name: apt.patientName,
                                                                email: apt.patientEmail
                                                            })}
                                                        >
                                                            <div className="font-medium">{apt.patientName}</div>
                                                            <div className="text-sm text-gray-500">{apt.patientEmail}</div>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </div>

                                        {/* Patient History */}
                                        <div className="md:col-span-2">
                                            {!selectedPatient ? (
                                                <div className="text-center py-10 bg-gray-50 rounded-lg">
                                                    <p className="text-gray-500">Select a patient to view their history</p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className="flex justify-between items-center mb-4">
                                                        <div>
                                                            <h3 className="text-xl font-semibold capitalize">{selectedPatient.name}</h3>
                                                            <p className="text-gray-500">{selectedPatient.email}</p>
                                                        </div>
                                                        <button
                                                            onClick={generateHistoryPDF}
                                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center cursor-pointer"
                                                            disabled={loading}
                                                        >
                                                            {loading ? 'Generating...' : 'Generate PDF'}
                                                        </button>
                                                    </div>

                                                    {/* Add New History Form */}
                                                    <div className="bg-gradient-to-r from-blue-100 to-blue-400 p-4 rounded-lg mb-6">
                                                        <h4 className="text-lg font-medium mb-3">Add New Record</h4>
                                                        <form onSubmit={handleHistoryFormSubmit}>
                                                            <div className="mb-3">
                                                                <label className="block text-gray-700 font-medium mb-2">
                                                                    Diagnosis
                                                                </label>
                                                                <textarea
                                                                    name="diagnosis"
                                                                    value={historyForm.diagnosis}
                                                                    onChange={handleHistoryFormChange}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                    rows="2"
                                                                ></textarea>
                                                            </div>

                                                            <div className="mb-3">
                                                                <label className="block text-gray-700 font-medium mb-2">
                                                                    Medications
                                                                </label>
                                                                <textarea
                                                                    name="medications"
                                                                    value={historyForm.medications}
                                                                    onChange={handleHistoryFormChange}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                    rows="2"
                                                                ></textarea>
                                                            </div>

                                                            <div className="mb-3">
                                                                <label className="block text-gray-700 font-medium mb-2">
                                                                    Notes
                                                                </label>
                                                                <textarea
                                                                    name="notes"
                                                                    value={historyForm.notes}
                                                                    onChange={handleHistoryFormChange}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                    rows="2"
                                                                ></textarea>
                                                            </div>

                                                            <button
                                                                type="submit"
                                                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer"
                                                                disabled={loading}
                                                            >
                                                                {loading ? 'Saving...' : 'Save Record'}
                                                            </button>
                                                        </form>
                                                    </div>

                                                    {/* History Records */}
                                                    <div>
                                                        <h4 className="text-lg font-medium mb-3">History Records</h4>

                                                        {loadingHistory ? (
                                                            <div className="text-center py-4">
                                                                <p className="text-gray-500">Loading history...</p>
                                                            </div>
                                                        ) : patientHistory.length === 0 ? (
                                                            <div className="text-center py-4 bg-gray-50 rounded-lg">
                                                                <p className="text-gray-500">No history records found</p>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-4">
                                                                {patientHistory.map((record) => (
                                                                    <div key={record.id} className="border rounded-lg p-4">
                                                                        <div className="flex justify-between items-start mb-2">
                                                                            <div className="font-medium">
                                                                                {new Date(record.created_at).toLocaleDateString('en-US', {
                                                                                    year: 'numeric',
                                                                                    month: 'short',
                                                                                    day: 'numeric'
                                                                                })}
                                                                            </div>
                                                                            <div className="text-sm text-gray-500">
                                                                                Dr. {record.specialist.first_name} {record.specialist.last_name}
                                                                            </div>
                                                                        </div>

                                                                        {record.diagnosis && (
                                                                            <div className="mb-2">
                                                                                <span className="font-medium">Diagnosis:</span> {record.diagnosis}
                                                                            </div>
                                                                        )}

                                                                        {record.medications && (
                                                                            <div className="mb-2">
                                                                                <span className="font-medium">Medications:</span> {record.medications}
                                                                            </div>
                                                                        )}

                                                                        {record.notes && (
                                                                            <div>
                                                                                <span className="font-medium">Notes:</span> {record.notes}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Profile Tab */}
                            {activeTab === 'profile' && (
                                <div>
                                    <div className="flex justify-between items-center mb-6 py-7">
                                        <h2 className="text-2xl font-semibold text-gray-800">Profile Settings</h2>
                                        {successMessage && (
                                            <div className="bg-green-100 text-green-700 p-4 rounded-md mb-4">
                                                {successMessage}
                                            </div>
                                        )}
                                        <button
                                            onClick={() => setEditMode(!editMode)}
                                            className="px-4 py-2 bg-blue-600 text-white cursor-pointer rounded-md hover:bg-blue-700 transition duration-300"
                                        >
                                            {editMode ? 'Cancel' : 'Edit Profile'}
                                        </button>
                                    </div>

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

                                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                                <div>
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
                                                <div>
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
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-4 mb-4">
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

                                            <div className="mb-6">
                                                <label className="block text-gray-700 font-medium mb-2">Specialty</label>
                                                <input
                                                    type="text"
                                                    name="specialty"
                                                    value={profileData.specialty}
                                                    onChange={handleProfileChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="e.g. Dermatologist, Cosmetalogist"
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 cursor-pointer"
                                            >
                                                Save Changes
                                            </button>
                                        </form>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-500">First Name</h3>
                                                    <p className="mt-1 text-lg">{profileData.first_name}</p>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-500">Last Name</h3>
                                                    <p className="mt-1 text-lg">{profileData.last_name}</p>
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                                                    <p className="mt-1 text-lg">{profileData.email}</p>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-500">Mobile Number</h3>
                                                    <p className="mt-1 text-lg">{profileData.mobile}</p>
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-500">State</h3>
                                                    <p className="mt-1 text-lg">{profileData.state}</p>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-500">City</h3>
                                                    <p className="mt-1 text-lg">{profileData.city}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-sm font-medium text-gray-500">Specialty</h3>
                                                <p className="mt-1 text-lg">{profileData.specialty || "Not specified"}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpecialistDashboard;