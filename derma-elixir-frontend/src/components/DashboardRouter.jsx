// src/components/DashboardRouter.jsx
import React, { useState, useEffect } from 'react';
import { getUser } from '../utils/auth';
import PatientDashboard from '../pages/PatientDashboard';
import SpecialistDashboard from '../pages/SpecialistDashboard';
import AdminDashboard from '../pages/AdminDashboard';

const DashboardRouter = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get user data from localStorage
        const userData = getUser();
        setUser(userData);
        setLoading(false);
    }, []);

    // Show loading state while user data is being retrieved
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Handle case when user is null
    if (!user) {
        return <div className="min-h-screen flex items-center justify-center text-xl text-red-600">
            User data not found. Please log in again.
        </div>;
    }

    switch (user.user_type) {
        case 'admin':
            return <AdminDashboard />;
        case 'specialist':
            return <SpecialistDashboard />;
        case 'patient':
        default:
            return <PatientDashboard />;
    }
};

export default DashboardRouter;