"use client";

import React from 'react';

const PropertyOptions: React.FC = () => {
  const buyOptions = [
    { name: "Apartments in Bangalore", count: "12,000+ Properties", link: "/buy/apartments-bangalore" },
    { name: "Villas in Bangalore", count: "3,500+ Properties", link: "/buy/villas-bangalore" },
    { name: "Independent Houses", count: "8,200+ Properties", link: "/buy/houses-bangalore" },
    { name: "Plots in Bangalore", count: "5,800+ Properties", link: "/buy/plots-bangalore" },
    { name: "Commercial Properties", count: "2,100+ Properties", link: "/buy/commercial-bangalore" },
    { name: "New Projects", count: "450+ Projects", link: "/buy/new-projects-bangalore" }
  ];

  const rentOptions = [
    { name: "1 BHK for Rent", count: "8,500+ Properties", link: "/rent/1bhk-bangalore" },
    { name: "2 BHK for Rent", count: "15,200+ Properties", link: "/rent/2bhk-bangalore" },
    { name: "3 BHK for Rent", count: "11,800+ Properties", link: "/rent/3bhk-bangalore" },
    { name: "Furnished Apartments", count: "6,200+ Properties", link: "/rent/furnished-bangalore" },
    { name: "PG & Hostels", count: "4,800+ Properties", link: "/rent/pg-bangalore" },
    { name: "Office Spaces", count: "1,500+ Properties", link: "/rent/office-bangalore" }
  ];

  const popularAreas = [
    "Whitefield", "Electronic City", "Sarjapur Road", "Hebbal", "Marathahalli", 
    "Koramangala", "Indiranagar", "Banashankari", "Yelahanka", "Kanakapura Road",
    "Outer Ring Road", "Hosur Road", "Bellary Road", "Tumkur Road", "Mysore Road"
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Property Options in Bangalore
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore comprehensive property options for buying and renting in Bangalore
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Buy Properties */}
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              🏠 Buy Properties in Bangalore
            </h3>
            <div className="space-y-4">
              {buyOptions.map((option, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-red-50 transition-colors">
                  <div>
                    <h4 className="font-semibold text-gray-800">{option.name}</h4>
                    <p className="text-sm text-gray-600">{option.count}</p>
                  </div>
                  <a 
                    href={option.link}
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    View All →
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Rent Properties */}
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              🏢 Rent Properties in Bangalore
            </h3>
            <div className="space-y-4">
              {rentOptions.map((option, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-red-50 transition-colors">
                  <div>
                    <h4 className="font-semibold text-gray-800">{option.name}</h4>
                    <p className="text-sm text-gray-600">{option.count}</p>
                  </div>
                  <a 
                    href={option.link}
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    View All →
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Popular Areas */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Popular Areas in Bangalore
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {popularAreas.map((area, index) => (
              <a
                key={index}
                href={`/properties/${area.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors text-sm"
              >
                {area}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PropertyOptions;
