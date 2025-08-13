"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location, setLocation] = useState("Bangalore");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-lg" : "bg-white shadow-md"
      }`}
    >
      {/* Top Header Bar */}
      <div className="bg-red-600 text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-transparent border-none text-white focus:outline-none cursor-pointer"
              >
                <option value="Bangalore" className="text-black">
                  Bangalore
                </option>
                <option value="Mumbai" className="text-black">
                  Mumbai
                </option>
                <option value="Delhi" className="text-black">
                  Delhi NCR
                </option>
                <option value="Chennai" className="text-black">
                  Chennai
                </option>
                <option value="Hyderabad" className="text-black">
                  Hyderabad
                </option>
                <option value="Pune" className="text-black">
                  Pune
                </option>
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <Link
              href="/login"
              className="hover:text-red-200 transition-colors font-medium"
            >
              Login
            </Link>
            <div className="w-px h-4 bg-red-400"></div>
            <Link
              href="/post-property"
              className="bg-white text-red-600 px-3 py-1 rounded text-sm font-semibold hover:bg-red-50 transition-colors"
            >
              Post Property FREE
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-red-600">
                PropertyBricks
              </div>
              <div className="text-xs text-gray-500 hidden sm:block">
                India's No.1 Property Site
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="#"
                className="flex items-center space-x-1 text-gray-700 hover:text-red-600 font-medium py-2 px-1 border-b-2 border-transparent hover:border-red-600 transition-all"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span>Buy</span>
              </Link>
              <Link
                href="#"
                className="flex items-center space-x-1 text-gray-700 hover:text-red-600 font-medium py-2 px-1 border-b-2 border-transparent hover:border-red-600 transition-all"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm12 12H4V6h12v10z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Rent</span>
              </Link>
              <Link
                href="#"
                className="flex items-center space-x-1 text-gray-700 hover:text-red-600 font-medium py-2 px-1 border-b-2 border-transparent hover:border-red-600 transition-all"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Sell</span>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-700 hover:text-red-600 p-2"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100">
              <div className="flex flex-col space-y-4">
                <Link
                  href="/buy"
                  className="flex items-center space-x-2 text-gray-700 hover:text-red-600 font-medium py-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  <span>Buy</span>
                </Link>
                <Link
                  href="/rent"
                  className="flex items-center space-x-2 text-gray-700 hover:text-red-600 font-medium py-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm12 12H4V6h12v10z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Rent</span>
                </Link>
                <Link
                  href="/sell"
                  className="flex items-center space-x-2 text-gray-700 hover:text-red-600 font-medium py-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Sell</span>
                </Link>
                <Link
                  href="/home-loans"
                  className="text-gray-700 hover:text-red-600 font-medium py-2"
                >
                  Home Loans
                </Link>
                <Link
                  href="/property-services"
                  className="text-gray-700 hover:text-red-600 font-medium py-2"
                >
                  Property Services
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
