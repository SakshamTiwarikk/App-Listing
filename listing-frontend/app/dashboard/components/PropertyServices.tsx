"use client";

import React from "react";
import {
  Home,
  FileText,
  PaintBucket,
  Calculator,
  Hammer,
  TrendingUp,
  Shield,
  MapPin,
  ArrowRight,
} from "lucide-react";

const PropertyServices: React.FC = () => {
  const services = [
    {
      icon: Home,
      title: "Home Loans",
      description:
        "Get instant approval on home loans with competitive interest rates from 40+ partner banks",
      link: "/home-loans",
      color: "bg-blue-50",
      iconColor: "text-blue-600",
      hoverColor: "hover:bg-blue-100",
    },
    {
      icon: FileText,
      title: "Legal Services",
      description:
        "Complete legal assistance for property documentation, verification and registration",
      link: "/legal-services",
      color: "bg-green-50",
      iconColor: "text-green-600",
      hoverColor: "hover:bg-green-100",
    },
    {
      icon: PaintBucket,
      title: "Interior Design",
      description:
        "Transform your space with our expert interior design services and get multiple quotes",
      link: "/interior-design",
      color: "bg-purple-50",
      iconColor: "text-purple-600",
      hoverColor: "hover:bg-purple-100",
    },
    {
      icon: Calculator,
      title: "Property Valuation",
      description:
        "Get accurate property valuation in 30 seconds with 98% accuracy using PropWorth",
      link: "/valuation",
      color: "bg-orange-50",
      iconColor: "text-orange-600",
      hoverColor: "hover:bg-orange-100",
    },
    {
      icon: Hammer,
      title: "Renovation Services",
      description:
        "End-to-end renovation and construction services with verified contractors",
      link: "/renovation",
      color: "bg-yellow-50",
      iconColor: "text-yellow-600",
      hoverColor: "hover:bg-yellow-100",
    },
    {
      icon: TrendingUp,
      title: "Investment Advisory",
      description:
        "Expert advice on property investment opportunities and market trends analysis",
      link: "/advisory",
      color: "bg-red-50",
      iconColor: "text-red-600",
      hoverColor: "hover:bg-red-100",
    },
    {
      icon: Shield,
      title: "Property Insurance",
      description:
        "Comprehensive property insurance coverage with competitive premiums and easy claims",
      link: "/insurance",
      color: "bg-indigo-50",
      iconColor: "text-indigo-600",
      hoverColor: "hover:bg-indigo-100",
    },
    {
      icon: MapPin,
      title: "Site Visit Services",
      description:
        "FREE cab pick-up and drop-off service to select projects across major cities",
      link: "/site-visit",
      color: "bg-teal-50",
      iconColor: "text-teal-600",
      hoverColor: "hover:bg-teal-100",
    },
  ];

  return (
    <section className="py-20 bg-gray-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23dc2626' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-600 rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4 mr-2" />
            Trusted Services
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            360-Degree{" "}
            <span className="text-red-600 relative">
              Property Services
              <div className="absolute -bottom-2 left-0 w-full h-1 bg-red-600 rounded-full"></div>
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Comprehensive real estate services to make your property journey
            seamless, secure, and stress-free
          </p>
          <div className="flex items-center justify-center mt-8 space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>40+ Partner Banks</span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Verified Professionals</span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span>End-to-End Support</span>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div
                key={index}
                className={`group bg-white rounded-2xl p-8 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${service.hoverColor} cursor-pointer`}
              >
                {/* Icon Section */}
                <div
                  className={`${service.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <IconComponent className={`w-8 h-8 ${service.iconColor}`} />
                </div>

                {/* Content Section */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Action Section */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <a
                    href={service.link}
                    className="inline-flex items-center text-red-600 font-semibold text-sm group-hover:text-red-700 transition-colors"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Section */}
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-bold text-sm"
                  >
                    {i === 1 && "👤"}
                    {i === 2 && "🏠"}
                    {i === 3 && "💼"}
                    {i === 4 && "✓"}
                  </div>
                ))}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Need Help with Multiple Services?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Get personalized assistance from our property experts. Book a free
              consultation to discuss your specific requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-red-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl">
                Book Free Consultation
              </button>
              <button className="border-2 border-red-600 text-red-600 px-8 py-3 rounded-xl font-semibold hover:bg-red-50 transition-colors">
                Call +91 98765 43210
              </button>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-red-600">10L+</div>
              <div className="text-gray-600 text-sm">Happy Customers</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-red-600">50+</div>
              <div className="text-gray-600 text-sm">Cities Covered</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-red-600">1000+</div>
              <div className="text-gray-600 text-sm">Verified Partners</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-red-600">24/7</div>
              <div className="text-gray-600 text-sm">Support Available</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PropertyServices;
