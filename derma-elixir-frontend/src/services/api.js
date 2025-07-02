import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api/v1';

export const registerUser = async (userData) => {
  try {
    let response;
    
    // Check if userData is FormData (for file uploads)
    if (userData instanceof FormData) {
      // For file upload requests
      response = await axios.post(`${BASE_URL}/register`, userData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } else {
      // For regular JSON requests
      response = await axios.post(`${BASE_URL}/register`, userData);
    }
    
    return response.data;
  } catch (error) {
    console.log(error.response ? error.response.data : error);
    throw error.response ? error.response.data : new Error('Registration failed');
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${BASE_URL}/login`, credentials);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Login failed');
  }
};

// Treatment related API calls
export const getTreatments = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/treatments`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to fetch treatments');
  }
};

export const createTreatment = async (treatmentData) => {
  try {
    const response = await axios.post(`${BASE_URL}/treatments`, treatmentData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to create treatment');
  }
};

export const deleteTreatment = async (treatmentId) => {
  try {
    const response = await axios.delete(`${BASE_URL}/treatments/${treatmentId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to delete treatment');
  }
};

export const updateTreatment = async (treatmentId, treatmentData) => {
  try {
    const response = await axios.put(`${BASE_URL}/treatments/${treatmentId}`, treatmentData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to update treatment');
  }
};

// Appointment related API calls
export const getAppointments = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/appointments`, {
      params: { user_id: userId }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to fetch appointments');
  }
};

export const updateAppointmentStatus = async (appointmentId, status, userId) => {
  try {
    const response = await axios.put(`${BASE_URL}/appointments/${appointmentId}/status`, { 
      status,
      user_id: userId 
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to update appointment status');
  }
};

export const createAppointment = async (appointmentData, userId) => {
  try {
    const data = {
      ...appointmentData,
      patient_id: userId
    };
    
    const response = await axios.post(`${BASE_URL}/appointments`, data);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to create appointment');
  }
};

export const getSpecialists = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/specialists`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to fetch specialists');
  }
};

export const getUsers = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/users`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to fetch users');
  }
};

export const updateUserProfile = async (userId, userData) => {
  try {
    const response = await axios.put(`${BASE_URL}/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error.response ? error.response.data : new Error('Failed to update profile');
  }
}; 

export const getCertificate = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/users/${userId}/certificate`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to fetch certificate');
  }
};

export const getLicense = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/users/${userId}/license`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to fetch license');
  }
};

export const submitReview = async (appointmentId, reviewData, userId) => {
  try {
    const response = await axios.post(`${BASE_URL}/appointments/${appointmentId}/review`, {
      ...reviewData,
      user_id: userId
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to submit review');
  }
};

export const getAppointmentReview = async (appointmentId) => {
  try {
    const response = await axios.get(`${BASE_URL}/appointments/${appointmentId}/review`);
    return response.data;
  } catch (error) {
    // For 404 errors (no review found), return a standardized response
    if (error.response && error.response.status === 404) {
      return { success: false, exists: false };
    }
    throw error.response ? error.response.data : new Error('Failed to fetch review');
  }
};

export const getReviews = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/reviews`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to fetch reviews');
  }
};

// Lab Test related API calls
export const getLabTests = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/lab-tests`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to fetch lab tests');
  }
};

export const createLabTest = async (labTestData) => {
  try {
    const response = await axios.post(`${BASE_URL}/lab-tests`, labTestData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to create lab test');
  }
};

export const deleteLabTest = async (labTestId) => {
  try {
    const response = await axios.delete(`${BASE_URL}/lab-tests/${labTestId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to delete lab test');
  }
};

export const updateLabTest = async (labTestId, labTestData) => {
  try {
    const response = await axios.put(`${BASE_URL}/lab-tests/${labTestId}`, labTestData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to update lab test');
  }
};

export const getPatientHistory = async (patientId) => {
  try {
    const response = await axios.get(`${BASE_URL}/patients/${patientId}/history`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to fetch patient history');
  }
};

export const addPatientHistory = async (historyData) => {
  try {
    const response = await axios.post(`${BASE_URL}/patient-history`, historyData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to add patient history');
  }
};