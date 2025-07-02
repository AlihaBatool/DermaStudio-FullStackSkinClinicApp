import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Specialists from '../components/Specialists';
import aboutMainBg from "../assets/aboutMainBg.jpg"
import mission from "../assets/mission.jpg"
import story from "../assets/story.jpg"
import advanced from "../assets/advanced.jpg"
import convenient from "../assets/convenient.jpeg"
import expert from "../assets/expert.jpeg"

const AboutUs = () => {
  const location = useLocation();

  // Scroll to the bottom section if the hash is present
  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);
  return (
    <div className="bg-gradient-to-b from-blue-50 to-blue-500 min-h-screen">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section with Background Image */}
        <div className="relative py-20 mb-16">
          <img
            src={aboutMainBg}
            className="absolute inset-0 w-full rounded-lg h-full object-cover opacity-60"
            alt="Background"
          />
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-3xl font-extrabold text-gray-900 mb-6 leading-tight">
                Derma Elixir Studio: <br />
                <span className="text-blue-600">Transforming Skin, Empowering Confidence</span>
              </h1>
              <p className="text-gray-700 text-lg md:text-xl font-bold leading-relaxed max-w-3xl mx-auto">
                We blend cutting-edge medical expertise with personalized care to help you achieve your best skin. Our holistic approach focuses on your unique skincare journey.
              </p>
            </div>
          </div>
        </div>
        {/* Mission and Story Section with Background Images */}
        <div className="grid md:grid-cols-2 gap-12 mb-16 items-center">
          <div className="bg-blue-200 rounded-xl shadow-lg p-8 border-l-4 border-blue-600 relative overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
              <img
                src={mission}
                alt=""
                className="w-full h-full object-cover opacity-50"
              />
            </div>
            {/* Content (on top of the background) */}
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-black-800 mb-6">Our Mission</h2>
              <p className="text-gray-700 text-lg md:text-xl font-bold leading-relaxed">
                At Derma Elixir Studio, we're committed to providing personalized, evidence-based skincare solutions. Our mission is to empower individuals by helping them achieve their healthiest, most confident skin through advanced medical expertise.
              </p>
            </div>
          </div>

          <div className="bg-blue-200 rounded-xl shadow-lg p-8 border-l-4 border-blue-600 relative overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
              <img
                src={story}
                alt=""
                className="w-full h-full object-cover opacity-50"
              />
            </div>
            {/* Content (on top of the background) */}
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Our Story</h2>
              <p className="text-gray-700 text-lg md:text-xl font-bold leading-relaxed">
                Founded in 2020 by Dr. Sarah Ahmad, Derma Elixir Studio emerged from a vision to revolutionize skincare. We bridge gap between medical precision and aesthetic innovation, creating a warm, welcoming environment where science meets beauty.
              </p>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Our Core Values
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <a
              href="/about"
              className="bg-blue-200 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 block"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={expert}
                  alt="Expert Care"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Expert Care</h3>
                <p className="text-gray-600">
                  Personalized treatments by board-certified specialists tailored to your unique skin needs.
                </p>
              </div>
            </a>

            <a
              href="/about"
              className="bg-blue-200 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 block"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={advanced}
                  alt="Advanced Technology"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Advanced Technology</h3>
                <p className="text-gray-600">
                  Leveraging state-of-the-art equipment and innovative techniques for superior results.
                </p>
              </div>
            </a>

            <a
              href="/about"
              className="bg-blue-200 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 block"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={convenient}
                  alt="Convenient Care"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Convenient Care</h3>
                <p className="text-gray-600">
                  Seamless scheduling and minimal wait times to provide a stress-free experience.
                </p>
              </div>
            </a>
          </div>
        </div>

        {/* Specialists Section */}
        <Specialists />
        <div id="bottom" /> 
      </div>
    </div>

  );
};

export default AboutUs;