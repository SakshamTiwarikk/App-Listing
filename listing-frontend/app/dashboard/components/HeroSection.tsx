"use client";

import {
  MapPin,
  Home,
  IndianRupee,
  Search,
  ChevronDown,
  X,
} from "lucide-react";

const HeroSection = () => {
  return (
    <div className="w-full bg-white">
      {/* Navigation Tabs */}
      <div className="border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="relative">
                <button className="py-4 text-sm font-medium text-gray-900 hover:text-red-600 transition-colors">
                  Buy
                </button>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"></div>
              </div>
              <button className="py-4 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Rent
              </button>
              <button className="py-4 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                New Projects
              </button>
              <button className="py-4 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                PG
              </button>
              <button className="py-4 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Plot
              </button>
              <button className="py-4 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Commercial
              </button>
            </div>
            <button className="py-4 text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
              Post Free Property Ad
            </button>
          </div>
        </div>
      </div>

      {/* Search Form - Moved Down */}
      <div className="container mx-auto px-4 pt-16 pb-12">
        <div className="flex items-center justify-center">
          <div className="bg-white rounded-full shadow-lg border border-gray-200 p-2 flex items-center max-w-4xl w-full">
            {/* Location Input */}
            <div className="flex items-center flex-1 px-4 py-2">
              <MapPin className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
              <div className="flex items-center flex-1">
                <div className="bg-gray-100 rounded-full px-3 py-1 mr-2 flex items-center text-sm">
                  <span className="text-gray-700">Bangalore</span>
                  <X className="w-3 h-3 ml-1 text-gray-500 cursor-pointer" />
                </div>
                <input
                  type="text"
                  placeholder="Search for locality, landmark, project, or builder"
                  className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-500"
                />
              </div>
            </div>

            {/* Separator */}
            <div className="w-px h-8 bg-gray-200"></div>

            {/* Property Type Dropdown */}
            <div className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors">
              <Home className="w-5 h-5 text-gray-600 mr-2" />
              <span className="text-sm text-gray-700 mr-1">Flat +1</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>

            {/* Separator */}
            <div className="w-px h-8 bg-gray-200"></div>

            {/* Budget Dropdown */}
            <div className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors">
              <IndianRupee className="w-5 h-5 text-gray-600 mr-2" />
              <span className="text-sm text-gray-500 mr-1">Budget</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>

            {/* Search Button */}
            <button className="bg-red-600 hover:bg-red-700 text-white rounded-full p-3 ml-2 transition-colors">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
