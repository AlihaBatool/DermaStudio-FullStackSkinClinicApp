import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../../utils/auth';
import { getTreatments, getSpecialists, createAppointment } from '../../services/api';

const AppointmentForm = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [treatments, setTreatments] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [filteredTreatments, setFilteredTreatments] = useState([]);

  const [formData, setFormData] = useState({
    specialist_id: '',
    treatment_id: '',
    appointment_date: '',
    appointment_time: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const AVAILABLE_TIMES = [
    "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00",
    "17:00", "18:00"
  ];

  // Get user data from localStorage on component mount
  useEffect(() => {
    const userData = getUser();
    setUser(userData);
  }, []);

  // Fetch treatments and specialists on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const treatmentsResponse = await getTreatments();
        const specialistsResponse = await getSpecialists();

        setTreatments(treatmentsResponse);
        setSpecialists(specialistsResponse.specialists || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setSubmitError('Failed to load treatments and specialists');
      }
    };

    fetchData();
  }, []);

  // Filter treatments based on selected category
  useEffect(() => {
    if (formData.treatmentCategory) {
      const filtered = treatments.filter(
        treatment => treatment.category === formData.treatmentCategory
      );
      setFilteredTreatments(filtered);
    } else {
      setFilteredTreatments([]);
    }
  }, [formData.treatmentCategory, treatments]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if user is logged in
    if (!user) {
      setSubmitError('You must be logged in to book an appointment');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    // Validate date is in the future
    const selectedDate = new Date(formData.appointment_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setSubmitError('Please select a future date for your appointment');
      setIsSubmitting(false);
      return;
    }

    // Prepare appointment data (excluding patient_id)
    const appointmentData = {
      specialist_id: formData.specialist_id || null,
      treatment_id: formData.treatment_id,
      appointment_date: formData.appointment_date,
      appointment_time: formData.appointment_time,
      notes: formData.notes || null
    };

    try {
      // Create appointment, passing user ID separately
      await createAppointment(appointmentData, user.id);

      setIsSubmitting(false);
      setSubmitSuccess(true);

      // Reset form after successful submission
      setFormData({
        specialist_id: '',
        treatment_id: '',
        appointment_date: '',
        appointment_time: '',
        notes: ''
      });

      // Redirect to appointments section after 5 seconds
      setTimeout(() => {
        navigate('/dashboard?tab=appointments');
      }, 5000);
    } catch (error) {
      console.error('Appointment submission error:', error);

      // Handle specific error responses
      if (error.errors) {
        const errorMessages = Object.values(error.errors)
          .flat()
          .join(' ');
        setSubmitError(errorMessages);
      } else {
        setSubmitError(error.message || 'Failed to book appointment');
      }

      setIsSubmitting(false);
    }
  };

  // Calculate the minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  // Don't render form if no user is logged in
  if (!user) {
    return (
      <div className="bg-gray-100 py-12 text-center">
        <p className="text-xl text-gray-700">Please log in to book an appointment</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-l from-blue-50 to-blue-400 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Book an Appointment</h1>

        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8">
          {submitSuccess && (
            <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
              Your appointment request has been submitted successfully! Redirecting to your appointments in 5 seconds...
            </div>
          )}


          {submitError && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="treatmentCategory" className="block text-gray-700 font-medium mb-2">Treatment Category</label>
                <select
                  id="treatmentCategory"
                  name="treatmentCategory"
                  value={formData.treatmentCategory || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Category</option>
                  {[...new Set(treatments.map(t => t.category))].map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="treatment_id" className="block text-gray-700 font-medium mb-2">Specific Treatment</label>
                <select
                  id="treatment_id"
                  name="treatment_id"
                  value={formData.treatment_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Treatment</option>
                  {filteredTreatments.map(treatment => (
                    <option key={treatment.id} value={treatment.id}>
                      {treatment.name} - ${treatment.price}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="appointment_date" className="block text-gray-700 font-medium mb-2">Preferred Date</label>
                <input
                  type="date"
                  id="appointment_date"
                  name="appointment_date"
                  value={formData.appointment_date}
                  min={today}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="appointment_time" className="block text-gray-700 font-medium mb-2">Preferred Time</label>
                <select
                  id="appointment_time"
                  name="appointment_time"
                  value={formData.appointment_time}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Time</option>
                  {AVAILABLE_TIMES.map(time => {
                    // Convert 24-hour time to 12-hour time for display
                    const [hours, minutes] = time.split(':');
                    const formattedTime = new Date(2023, 0, 1, parseInt(hours), parseInt(minutes))
                      .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                    return (
                      <option key={time} value={time}>
                        {formattedTime}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="specialist_id" className="block text-gray-700 font-medium mb-2">Preferred Specialist</label>
              <select
                id="specialist_id"
                name="specialist_id"
                value={formData.specialist_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Specialist</option>
                {specialists.map(specialist => (
                  <option key={specialist.id} value={specialist.id}>
                    {specialist.first_name} {specialist.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label htmlFor="notes" className="block text-gray-700 font-medium mb-2">Additional Information (Optional)</label>
              <textarea
                id="notes"
                name="notes"
                rows="4"
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <button
              type="submit"
              className={`w-full py-3 px-4 rounded-md text-white font-medium transition duration-300 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Book Appointment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AppointmentForm;