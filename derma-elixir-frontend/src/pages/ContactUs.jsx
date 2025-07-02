import React from 'react';
import contact from "../assets/contact.jpeg"
const ContactUs = () => {
  return (
    <div className="bg-gradient-to-b from-blue-50 to-blue-500 min-h-screen">
    {/* Hero Banner with Image */}
    <div className="relative h-80 md:h-96 overflow-hidden">
      <img 
        src={contact}
        alt="Derma Elixir Studio" 
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-blue-900/70"></div>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Contact Us</h1>
        <p className="text-xl text-white max-w-3xl">
          We're here to help with your skin health journey
        </p>
      </div>
    </div>

    {/* Contact Information Content */}
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Get in Touch</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Our team is dedicated to providing exceptional care. Reach out to us with any questions or to schedule your consultation.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {/* Address Card */}
        <div className="bg-gradient-to-b from-blue-100 to-blue-400 rounded-xl shadow-lg p-8 text-center transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
          <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Visit Us</h3>
          <p className="text-gray-600">
            123 Skin Care Street, <br />
            Islamabad, Pakistan
          </p>
        </div>

        {/* Phone Card */}
        <div className="bg-gradient-to-b from-blue-100 to-blue-400 rounded-xl shadow-lg p-8 text-center transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
          <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Call Us</h3>
          <p className="text-gray-600">+92 123 456 7890</p>
          <p className="text-gray-500 mt-2">
            For appointments and inquiries
          </p>
        </div>

        {/* Email Card */}
        <div className="bg-gradient-to-b from-blue-100 to-blue-400 rounded-xl shadow-lg p-8 text-center transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
          <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Email Us</h3>
          <p className="text-gray-600">info@dermaelixir.com</p>
          <p className="text-gray-500 mt-2">
            We'll respond within 24 hours
          </p>
        </div>
      </div>

      {/* Hours of Operation */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-400 rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-center text-blue-600">Hours of Operation</h2>

        <div className="space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <span className="text-gray-600 font-medium">Monday - Friday</span>
            <span className="font-semibold text-gray-800 bg-blue-50 px-4 py-1 rounded-full">9:00 AM - 7:00 PM</span>
          </div>
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <span className="text-gray-600 font-medium">Saturday</span>
            <span className="font-semibold text-gray-800 bg-blue-50 px-4 py-1 rounded-full">10:00 AM - 4:00 PM</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">Sunday</span>
            <span className="font-semibold text-red-600 bg-red-50 px-4 py-1 rounded-full">Closed</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default ContactUs;