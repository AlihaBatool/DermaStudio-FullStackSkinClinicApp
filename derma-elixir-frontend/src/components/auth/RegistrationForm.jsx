import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../../services/api';
import { validateRegistration } from '../../utils/validation';
import RegistrationConfirmation from './RegistrationConfirmation';
import ConsentCertificate from './ConsentCertificate';

const RegistrationForm = () => {
  const navigate = useNavigate();
  const certificateRef = useRef(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    mobile: '',
    cnic: '',
    state: '',
    city: '',
    user_type: 'patient',
    certificate_uploaded: false,
    specialty: '',
    license_uploaded: false
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [certificateError, setCertificateError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [certificateGenerated, setCertificateGenerated] = useState(false);
  const [certificatePdfData, setCertificatePdfData] = useState('');
  const [certificateUploaded, setCertificateUploaded] = useState(false);
  const [certificateFile, setCertificateFile] = useState(null);
  const [licenseFile, setLicenseFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear errors for this field when user makes changes
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Clear certificate error when user makes changes
    if (certificateError) {
      setCertificateError('');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if the file is a PDF
      if (file.type === 'application/pdf') {
        setCertificateUploaded(true);
        setCertificateFile(file);
        setFormData(prev => ({
          ...prev,
          certificate_uploaded: true
        }));
      } else {
        setSubmitError('Please upload a valid PDF certificate.');
        setCertificateUploaded(false);
        setCertificateFile(null);
      }
    }
  };

  const handleLicenseUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if the file is a PDF
      if (file.type === 'application/pdf') {
        setLicenseFile(file);
        setFormData(prev => ({
          ...prev,
          license_uploaded: true
        }));
      } else {
        setSubmitError('Please upload a valid PDF license.');
        setLicenseFile(null);
      }
    }
  };

  const handleCertificateGenerated = (fileName, pdfDataUri) => {
    setCertificateGenerated(true);
    setCertificatePdfData(pdfDataUri);
  };

  const validateCertificateDownload = () => {
    // Use the same validation function used for form submission
    const validationErrors = validateRegistration(formData);

    // Check required fields for patient certificate
    const requiredFields = ['first_name', 'last_name', 'cnic', 'mobile', 'email', 'state', 'city'];

    // Check if any required fields are missing
    const missingFields = requiredFields.filter(field =>
      !formData[field] || formData[field].trim() === ''
    );

    if (missingFields.length > 0) {
      // Update errors state with validation errors
      setErrors(validationErrors);

      // Set a specific error message for certificate download
      setCertificateError('Please fill out all required fields before downloading the certificate.');
      return false;
    }

    // Check if there are any other validation errors
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setCertificateError('Please correct the errors in the form before downloading the certificate.');
      return false;
    }

    return true;
  };

  const handleDownloadCertificate = () => {
    if (validateCertificateDownload()) {
      // Call the generate certificate method directly
      certificateRef.current.generateCertificate();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    // Validate form
    const validationErrors = validateRegistration(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Check if certificate is required and uploaded for patients
    if (formData.user_type === 'patient' && (!formData.certificate_uploaded || !certificateFile)) {
      setSubmitError('Please download and upload the consent certificate before proceeding.');
      return;
    }

    // Clear previous errors
    setErrors({});
    setIsLoading(true);

    try {
      // Prepare data for submission
      let submitData = new FormData();

      // Add all regular form fields
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });

      // For patients, include certificate file
      if (formData.user_type === 'patient' && certificateFile) {
        submitData.append('certificate_file', certificateFile);
        submitData.append('certificate_data', certificatePdfData);
      }

      // For specialists, include license file if provided
      if (formData.user_type === 'specialist' && licenseFile) {
        submitData.append('license_file', licenseFile);
      }

      const response = await registerUser(submitData);
      console.log('Registration successful', response);

      // Set registered user data for confirmation
      setRegisteredUser(response.user);
      setSuccess(true);

    } catch (error) {
      // Check if the error response contains validation errors
      if (error.errors && typeof error.errors === 'object') {
        // Backend validation errors - convert array format to string for each field
        const backendErrors = {};
        Object.keys(error.errors).forEach(field => {
          backendErrors[field] = error.errors[field][0]; // Take the first error message
        });

        setErrors(backendErrors);
        setSubmitError('Please correct the errors in the form.');
      } else {
        // Generic error message
        setSubmitError(error.message || 'Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (registeredUser) {
    return <RegistrationConfirmation userData={registeredUser} onContinue={() => navigate('/login')} />;
  }

  const isPatient = formData.user_type === 'patient';
  const isSpecialist = formData.user_type === 'specialist';

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-400 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header Section with improved tabs */}
          <div className="text-center">
            <div className="flex border-b border-gray-200">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, user_type: 'patient' }))}
                className={`flex-1 py-4 px-6 text-center transition-colors duration-200 ease-in-out focus:outline-none cursor-pointer ${!isSpecialist
                  ? 'bg-blue-600 text-white font-semibold border-b-2 border-blue-600'
                  : 'bg-white text-gray-700 hover:bg-blue-50'
                  }`}
              >
                Patient Registration
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, user_type: 'specialist' }))}
                className={`flex-1 py-4 px-6 text-center transition-colors duration-200 ease-in-out focus:outline-none cursor-pointer ${isSpecialist
                  ? 'bg-purple-600 text-white font-semibold border-b-2 border-purple-600'
                  : 'bg-white text-gray-700 hover:bg-purple-50'
                  }`}
              >
                Specialist Registration
              </button>
            </div>
            <div className={`${isSpecialist ? 'bg-purple-600' : 'bg-blue-600'} text-white py-6 px-4`}>
              <h2 className="text-3xl font-bold">Create Your Account</h2>
              <p className={`${isSpecialist ? 'text-purple-100' : 'text-blue-100'} mt-2`}>
                Join Derma Elixir Studio as a {isSpecialist ? 'Specialist' : 'Patient'}
              </p>
            </div>
          </div>

          {/* Form Container */}
          <div className="p-8">
            {submitError && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Personal Information Fields */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    name="first_name"
                    placeholder="First Name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.first_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {errors.first_name && (
                    <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    name="last_name"
                    placeholder="Last Name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.last_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {errors.last_name && (
                    <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>
                  )}
                </div>
              </div>

              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.username ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">{errors.username}</p>
              )}

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2/4 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.781-1.781zm4.261 4.262l1.514 1.514a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.742L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .817 0 1.614-.107 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}

              <input
                type="text"
                name="mobile"
                placeholder="Mobile Number"
                value={formData.mobile}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.mobile ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {errors.mobile && (
                <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>
              )}

              <input
                type="text"
                name="cnic"
                placeholder="CNIC (XXXXX-XXXXXXX-X)"
                value={formData.cnic}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.cnic ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {errors.cnic && (
                <p className="text-red-500 text-xs mt-1">{errors.cnic}</p>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
              </div>

              {/* Radio buttons removed as they're replaced by the tabs above */}

              {/* Specialist Section - Only for specialists */}
              {isSpecialist && (
                <div className="border border-gray-200 rounded-lg p-4 bg-purple-50 mb-4">
                  <h3 className="font-medium text-gray-700 mb-3">Specialist Information</h3>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Specialty / Area of Expertise
                    </label>
                    <input
                      type="text"
                      name="specialty"
                      placeholder="e.g., Dermatologist, Cosmetologist, etc."
                      value={formData.specialty}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 border-gray-300"
                    />
                  </div>

                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      License/Certification (Optional)
                    </label>
                    <label className={`flex flex-col items-center px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer ${licenseFile ? 'border-purple-300 bg-purple-50' : 'border-gray-300 hover:bg-gray-50'}`}>
                      <div className="flex flex-col items-center">
                        {licenseFile ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-medium text-purple-600">License uploaded successfully</span>
                            <span className="text-xs text-purple-500 mt-1">{licenseFile?.name}</span>
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span className="text-sm font-medium text-gray-600">Click to upload license</span>
                            <span className="text-xs text-gray-500 mt-1">(PDF files only)</span>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf"
                        onChange={handleLicenseUpload}
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Certificate Section - Only for patients */}
              {isPatient && (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-4">
                  <h3 className="font-medium text-gray-700 mb-3">Patient Consent Certificate</h3>

                  {certificateError && (
                    <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                      {certificateError}
                    </div>
                  )}

                  {!certificateGenerated ? (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">
                        Please download the consent certificate to proceed with registration:
                      </p>

                      {/* Hidden ConsentCertificate component with ref */}
                      <div style={{ display: "none" }}>
                        <ConsentCertificate
                          ref={certificateRef}
                          userData={formData}
                          onCertificateGenerated={handleCertificateGenerated}
                        />
                      </div>

                      {/* Custom button that validates before triggering certificate download */}
                      <button
                        type="button"
                        onClick={handleDownloadCertificate}
                        className="w-full py-3 rounded-lg text-white font-semibold transition duration-300 bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 mb-4"
                      >
                        Download Consent Certificate
                      </button>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <div className="flex items-center text-sm text-green-600 mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Certificate downloaded successfully
                      </div>

                      <p className="text-sm text-gray-600 mb-2">
                        Please upload the downloaded certificate to complete registration:
                      </p>

                      <label className={`flex flex-col items-center px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer ${certificateUploaded ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:bg-gray-50'}`}>
                        <div className="flex flex-col items-center">
                          {certificateUploaded ? (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-sm font-medium text-green-600">Certificate uploaded successfully</span>
                              <span className="text-xs text-green-500 mt-1">{certificateFile?.name}</span>
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              <span className="text-sm font-medium text-gray-600">Click to upload certificate</span>
                              <span className="text-xs text-gray-500 mt-1">(PDF files only)</span>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf"
                          onChange={handleFileUpload}
                          disabled={certificateUploaded}
                        />
                      </label>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || success || (isPatient && !certificateUploaded)}
                className={`w-full py-3 rounded-lg text-white font-semibold transition duration-300 ${isLoading || success || (isPatient && !certificateUploaded)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : isSpecialist
                    ? 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registering...
                  </div>
                ) : success ? 'Registered!' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center text-sm text-gray-500">
          © 2025 Derma Elixir Studio. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;