// src/components/ReviewModal.jsx
import React, { useState, useEffect } from 'react';
import { getAppointmentReview, submitReview } from '../../services/api';

const ReviewModal = ({ show, appointment, userId, onClose, onSubmitted }) => {
    const [reviewData, setReviewData] = useState({
        rating: 0,
        comment: ''
    });
    const [submitLoading, setSubmitLoading] = useState(false);

    useEffect(() => {
        // Check if an existing review is available when the modal opens
        if (show && appointment) {
            const checkExistingReview = async () => {
                try {
                    const response = await getAppointmentReview(appointment.id);
                    if (response.success && response.review) {
                        setReviewData({
                            rating: response.review.rating,
                            comment: response.review.comment || ''
                        });
                    } else {
                        // Reset to defaults if no review
                        setReviewData({ rating: 0, comment: '' });
                    }
                } catch (err) {
                    console.error("Error fetching review:", err);
                    setReviewData({ rating: 0, comment: '' });
                }
            };

            checkExistingReview();
        }
    }, [show, appointment]);

    // Handle rating change
    const handleRatingChange = (rating) => {
        setReviewData({
            ...reviewData,
            rating
        });
    };

    // Handle comment change
    const handleCommentChange = (e) => {
        setReviewData({
            ...reviewData,
            comment: e.target.value
        });
    };

    // Submit review
    const handleSubmitReview = async () => {
        if (!userId || !appointment) return;

        if (reviewData.rating === 0) {
            alert('Please select a rating');
            return;
        }

        setSubmitLoading(true);
        try {
            const response = await submitReview(
                appointment.id,
                reviewData,
                userId
            );

            if (response.success) {
                alert('Thank you for your review!');
                if (onSubmitted) onSubmitted(response.review);
                onClose();
            }
        } catch (err) {
            console.error('Error submitting review:', err);
            alert('Failed to submit review. Please try again.');
        } finally {
            setSubmitLoading(false);
        }
    };

    if (!show || !appointment) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
                <h2 className="text-2xl font-semibold mb-4">Review Your Appointment</h2>

                <div className="mb-6">
                    <p className="text-gray-600 mb-2">Treatment: {appointment.treatmentName}</p>
                    <p className="text-gray-600 mb-4">Specialist: {appointment.specialistName}</p>

                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">
                            Rating
                        </label>
                        <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => handleRatingChange(star)}
                                    className="focus:outline-none"
                                >
                                    <svg
                                        className={`w-8 h-8 ${star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300'
                                            }`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">
                            Comment (Optional)
                        </label>
                        <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="4"
                            placeholder="Share your experience..."
                            value={reviewData.comment}
                            onChange={handleCommentChange}
                        ></textarea>
                    </div>
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition duration-300 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmitReview}
                        disabled={submitLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 disabled:bg-blue-400 cursor-pointer"
                    >
                        {submitLoading ? 'Submitting...' : 'Submit Review'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;