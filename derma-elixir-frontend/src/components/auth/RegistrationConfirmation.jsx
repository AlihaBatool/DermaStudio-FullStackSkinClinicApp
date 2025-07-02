import React from 'react';

const RegistrationConfirmation = ({ userData, onContinue }) => {
    if (!userData) return null;

    const isSpecialist = userData.user_type === 'specialist';

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-400 flex items-center justify-center px-4 py-8">
            <div className={`bg-white p-8 rounded-xl shadow-md w-full max-w-lg ${isSpecialist ? 'border-t-4 border-purple-600' : 'border-t-4 border-blue-600'}`}>
                <div className="text-center mb-6">
                    <div className={`inline-flex items-center justify-center w-16 h-16 ${isSpecialist ? 'bg-purple-100' : 'bg-green-100'} rounded-full`}>
                        <svg className={`w-8 h-8 ${isSpecialist ? 'text-purple-600' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="mt-4 text-2xl font-bold text-gray-800">Registration Successful!</h2>
                    <p className="mt-2 text-gray-600">Your account has been created successfully. Here's your information:</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Name</h3>
                        <p className="mt-1">{userData.first_name} {userData.last_name}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Username</h3>
                        <p className="mt-1">{userData.username}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Email</h3>
                        <p className="mt-1">{userData.email}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Mobile</h3>
                        <p className="mt-1">{userData.mobile}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">CNIC</h3>
                        <p className="mt-1">{userData.cnic}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Location</h3>
                        <p className="mt-1">{userData.city}, {userData.state}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Account Type</h3>
                        <p className="mt-1 capitalize">{userData.user_type}</p>
                    </div>

                    {/* Only show specialty for specialists */}
                    {isSpecialist && userData.specialty && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Specialty</h3>
                            <p className="mt-1">{userData.specialty}</p>
                        </div>
                    )}
                </div>

                <div className="text-center">
                    <button
                        onClick={onContinue}
                        className={`inline-block cursor-pointer text-white px-6 py-3 rounded-md transition duration-300 ${isSpecialist ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        Proceed to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RegistrationConfirmation;