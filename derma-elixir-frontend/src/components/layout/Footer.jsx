import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-blue-400 text-black py-6">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; 2025 Derma Elixir Studio. All rights reserved.</p>
        <div className="mt-4 space-x-4">
          <a href="#" className="hover:text-blue-400">Privacy Policy</a>
          <a href="#" className="hover:text-blue-400">Terms of Service</a>
          <a href="#" className="hover:text-blue-400">Contact Us</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;