import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getReviews } from '../services/api';
import { isLoggedIn } from '../utils/auth';
import skinLotion from "../assets/skinLotion.jpg"
import sensitiveSkin from "../assets/sensitiveSkin.jpg"
import skinLiquid from "../assets/skinLiquid.jpg"
import washFace from "../assets/washFace.jpg"
import advanced from "../assets/advanced.jpg"
import convenient from "../assets/convenient.jpeg"
import expert from "../assets/expert.jpeg"
import hair from "../assets/hair.jpg"
import cosmetic from "../assets/cosmetic.jpeg"
import laser from "../assets/laser.jpg"
import skinTreatment from "../assets/skinTreatment.jpg"
import bg from "../assets/bg.jpg"


// Star rating component
const StarRating = ({ rating }) => {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

// Review Card Component
const ReviewCard = ({ patient, treatment, comment, specialist, rating}) => (
  <div className="bg-gradient-to-r from-blue-100 to-blue-600 rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300">
    <div className="flex items-center mb-4">
      <div className="mr-4">
        <h4 className="font-semibold text-gray-800">
          {patient?.first_name} {patient?.last_name}
        </h4>
        <p className="text-sm text-gray-600">
  {treatment?.name} Treatment by Dr. {specialist?.first_name} {specialist?.last_name}
</p>
      </div>
      <div className="ml-auto">
        <StarRating rating={rating} />
      </div>
    </div>
    <p className="text-gray-600 italic">"{comment}"</p>
  </div>
);

// Featured Service Component
const FeaturedService = ({ image, title, description, link }) => (
  <a
    href={link}
    className="bg-blue-200 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 block"
  >
    <div className="h-55 overflow-hidden">
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
      />
    </div>
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-3 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  </a>
);

// Treatment Category Card Component
const TreatmentCategoryCard = ({ name, image, description }) => (
  <Link
    to="/treatments"
    className="bg-blue-200 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 block"
  >
    <div className="h-48 overflow-hidden">
      <img
        src={image}
        alt={`${name} Treatments`}
        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
      />
    </div>
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-3 text-gray-800">
        {name} Treatments
      </h3>
      <p className="text-gray-600">{description}</p>
    </div>
  </Link>
);


const HomePage = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    // Get login status from localStorage
    setAuthenticated(isLoggedIn());

    // Fetch reviews
    const fetchReviews = async () => {
      try {
        const response = await getReviews();
        if (response.success) {
          setReviews(response.reviews);
        }
      } catch (error) {
        console.error('Failed to fetch reviews', error);
      }
    };

    fetchReviews();
  }, []);

  return (
    <div className="bg-gradient-to-b from-blue-50 to-blue-600 min-h-screen">
      {/* Hero Section with Images */}
      <div className="container mx-auto px-4 pt-16 pb-24">
        <div className="flex flex-col lg:flex-row items-center">
          {/* Text Content - Left Side */}
          <div className="lg:w-1/2 mb-12 lg:mb-0 lg:pr-8 text-center lg:text-left">
            <h1 className="text-5xl font-extrabold mb-6 text-gray-900 leading-tight">
              Transform Your Skin, <br />
              <span className="text-blue-600">Boost Your Confidence</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              At Derma Elixir Studio, we blend cutting-edge medical expertise with personalized care to help you achieve your skin health goals.
            </p>
            <div className="space-x-4 space-y-4">
              <Link
                to="/treatments"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition duration-300 inline-block shadow-lg hover:shadow-xl"
              >
                Explore Treatments
              </Link>

              {!authenticated && (
                <Link
                  to="/register"
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition duration-300 inline-block"
                >
                  Create Account
                </Link>
              )}
            </div>
          </div>

          {/* Images - Right Side */}
          <div className="lg:w-1/2">
            {/* Top Large Image */}
            <div className="mb-4">
              <img
                src={sensitiveSkin}
                alt="Sensitive Skin Care"
                className="rounded-xl shadow-lg w-full object-cover h-64"
              />
            </div>
            {/* Three Images Below */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <img
                  src={skinLiquid}
                  alt="Advanced Facial Treatment"
                  className="rounded-xl shadow-lg w-full object-cover h-50"
                />
              </div>
              <div>
                <img
                  src={skinLotion}
                  alt="Skincare Application"
                  className="rounded-xl shadow-lg w-full object-cover h-50"
                />
              </div>
              <div>
                <img
                  src={washFace}
                  alt="Hydration Treatment"
                  className="rounded-xl shadow-lg w-full object-cover h-50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Services */}
      <div className="container mx-auto px-4 mb-24">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
          Our Specialized Services
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeaturedService 
            image={advanced}
            title="Advanced Treatments"
            description="Cutting-edge skin care solutions tailored to your unique needs and skin type for optimal results."
            link="/treatments"
          />
          <FeaturedService
            image={expert}
            title="Expert Consultation"
            description="Personalized advice from board-certified dermatology specialists with years of clinical experience."
            link="/contact"
          />
          <FeaturedService
            image={convenient}
            title="Convenient Care"
            description="Easy booking, minimal wait times, and flexible scheduling to fit your busy lifestyle."
            link="/appointments"
          />
        </div>
      </div>

      {/* Reviews Section */}
      <div className="container mx-auto px-4 mb-24">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
          What Our Patients Say
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <ReviewCard
                key={index}
                patient={review.patient}
                treatment={review.treatment}
                specialist={review.specialist}
                comment={review.comment}
                rating={review.rating}
              />
            ))
          ) : (
            <div className="col-span-full text-center text-gray-600">
              No reviews available at the moment
            </div>
          )}
        </div>
      </div>
      {/* Treatment Categories Preview */}
      <div className="container mx-auto px-4 mb-24">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
          Our Treatment Categories
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <TreatmentCategoryCard
            name="Skin Care"
            image={skinTreatment}
            description="Advanced skin care treatments for all skin types to address various concerns."
            color="bg-pink-600"
          />
          <TreatmentCategoryCard
            name="Laser"
            image={laser}
            description="Cutting-edge laser therapies for skin rejuvenation and targeted treatments."
            color="bg-green-600"
          />
          <TreatmentCategoryCard
            name="Cosmetic"
            image={cosmetic}
            description="Non-invasive cosmetic procedures to enhance your natural beauty."
            color="bg-purple-600"
          />
          <TreatmentCategoryCard
            name="Hair"
            image={hair}
            description="Specialized treatments for hair restoration and scalp health."
            color="bg-indigo-600"
          />
        </div>
      </div>

      {/* Call to Action with Imported Background Image */}
      <div className="bg-cover bg-center py-16 relative" style={{ backgroundImage: `url(${bg})` }}>
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-blue-900/40"></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold mb-6 text-white">
            Ready to Start Your Skin Health Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed max-w-3xl mx-auto">
            Book a consultation with our expert dermatologists today.
          </p>
          <div className="space-x-4 space-y-4">
            <Link
              to="/appointments"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition duration-300 inline-block font-semibold shadow-lg"
            >
              Book Appointment
            </Link>
            <Link
              to="/treatments"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-blue-600 transition duration-300 inline-block"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};

export default HomePage;