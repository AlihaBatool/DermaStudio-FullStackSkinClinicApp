import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getUser, isLoggedIn, logout } from '../../utils/auth';
import SearchModal from './SearchModal';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Check authentication status on component mount and location changes
  useEffect(() => {
    setAuthenticated(isLoggedIn());
    setUser(getUser());
  }, [location]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setUser(null);
    setAuthenticated(false);
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close search on route change
  useEffect(() => {
    setIsSearchOpen(false);
  }, [location.pathname]);

  return (
    <>
      <nav className="bg-blue-400 shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold text-white flex-shrink-0">
              Derma Elixir Studio
            </Link>

            {/* Desktop search field - only for larger screens (lg and up) */}
            <div className="hidden lg:flex items-center justify-center mx-4 lg:mx-8 flex-grow max-w-md">
              <div
                className="relative w-full flex items-center bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2 cursor-pointer"
                onClick={() => setIsSearchOpen(true)}
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-gray-500 ml-2">Search...</span>
              </div>
            </div>

            {/* Mobile menu and search buttons - visible on tablet and below */}
            <div className="lg:hidden flex items-center ml-auto">
              <button
                className="focus:outline-none mr-4"
                onClick={() => setIsSearchOpen(true)}
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button
                className="focus:outline-none"
                onClick={toggleMenu}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

            {/* Desktop navigation - separate flex container */}
            <div className="hidden lg:flex items-center space-x-4 lg:space-x-6 flex-shrink-0">
              <Link
                to="/treatments"
                className={`${isActive('/treatments') ? 'text-white' : 'text-blue-800'} hover:text-white font-bold`}
              >
                Treatments
              </Link>
              <Link
                to="/lab-tests"
                className={`${isActive('/lab-tests') ? 'text-white' : 'text-blue-800'} hover:text-white font-bold`}
              >
                Lab Tests
              </Link>
              <Link
                to="/about"
                className={`${isActive('/about') ? 'text-white' : 'text-blue-800'} hover:text-white font-bold`}
              >
                About
              </Link>
              <Link
                to="/contact"
                className={`${isActive('/contact') ? 'text-white' : 'text-blue-800'} hover:text-white font-bold`}
              >
                Contact Us
              </Link>
              {!authenticated ? (
                <>
                  <Link
                    to="/login"
                    className={`${isActive('/login') ? 'text-white' : 'text-blue-800'} hover:text-white font-bold`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
                  >
                    Register
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/dashboard"
                    className={`${isActive('/dashboard') ? 'text-white' : 'text-blue-800'} hover:text-white font-bold`}
                  >
                    Dashboard
                  </Link>

                  {/* User dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={toggleDropdown}
                      className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 focus:outline-none cursor-pointer"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="font-medium text-blue-600 capitalize">
                          {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <span className="font-medium capitalize hidden lg:inline">{user?.first_name || user?.username}</span>
                      <svg className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                      </svg>
                    </button>
                    {/* For the desktop dropdown menu: */}
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1 border border-gray-200">
                        {/* Show profile link only for non-admin users */}
                        {user?.user_type !== 'admin' && (
                          <Link
                            to="/dashboard?tab=profile"
                            className="block px-4 py-2 text-blue-500 hover:bg-blue-50 hover:text-black"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            My Profile
                          </Link>
                        )}
                        <Link
                          to="/dashboard"
                          className="block px-4 py-2 text-blue-500 hover:bg-blue-50 hover:text-black"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <div className="border-t border-gray-100"></div>
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsDropdownOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-red-600 font:bold hover:bg-red-50 cursor-pointer"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile navigation */}
          {isMenuOpen && (
            <div className="lg:hidden mt-4 space-y-3 pb-3">
              <Link
                to="/treatments"
                className={`block py-2 ${isActive('/treatments') ? 'text-white' : 'text-blue-800'} hover:text-white font-bold`}
                onClick={() => setIsMenuOpen(false)}
              >
                Treatments
              </Link>
              <Link
                to="/lab-tests"
                className={`block py-2 ${isActive('/lab-tests') ? 'text-white' : 'text-blue-800'} hover:text-white font-bold`}
                onClick={() => setIsMenuOpen(false)}
              >
                Lab Tests
              </Link>
              <Link
                to="/about"
                className={`block py-2 ${isActive('/about') ? 'text-white' : 'text-blue-800'} hover:text-white font-bold`}
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                to="/contact"
                className={`block py-2 ${isActive('/contact') ? 'text-white' : 'text-blue-800'} hover:text-white font-bold`}
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>

              {!authenticated ? (
                <>
                  <Link
                    to="/login"
                    className={`block py-2 ${isActive('/login') ? 'text-white' : 'text-blue-800'} hover:text-white font-bold`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 w-full text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              ) : (
                <>
                  {/* For the mobile menu: */}
                  <div className="bg-blue-50 rounded-lg p-3 mt-2">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="font-medium text-blue-600 capitalize">
                          {user?.first_name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 capitalize">
                          {user?.first_name || user?.username}
                        </h3>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                    </div>

                    {/* Show profile link only for non-admin users */}
                    {user?.user_type !== 'admin' && (
                      <Link
                        to="/dashboard?tab=profile"
                        className={`block py-2 px-3 rounded-md mb-2 ${isActive('/dashboard') ? 'bg-blue-100 text-blue-700' : 'text-gray-700'} hover:bg-blue-100`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        My Profile
                      </Link>
                    )}

                    <Link
                      to="/dashboard"
                      className={`block py-2 px-3 rounded-md mb-2 ${isActive('/dashboard') ? 'bg-blue-100 text-blue-700' : 'text-gray-700'} hover:bg-blue-100`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>

                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left py-2 px-3 rounded-md text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Search Modal Component */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Navbar;