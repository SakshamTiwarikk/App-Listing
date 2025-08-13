import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Play,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Magicbricks */}
          <div>
            <div className="flex items-center mb-4">
              <h3 className="text-xl font-bold">Magicbricks</h3>
            </div>
            <p className="text-gray-300 mb-4 text-sm leading-relaxed">
              India's No. 1 property site. Find properties for sale and rent
              across India with verified listings, photos, and genuine reviews.
            </p>
            <div className="flex space-x-3">
              <Button
                size="sm"
                variant="secondary"
                className="w-8 h-8 p-0 bg-gray-700 hover:bg-blue-600"
              >
                <Facebook className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="w-8 h-8 p-0 bg-gray-700 hover:bg-blue-400"
              >
                <Twitter className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="w-8 h-8 p-0 bg-gray-700 hover:bg-pink-600"
              >
                <Instagram className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="w-8 h-8 p-0 bg-gray-700 hover:bg-red-600"
              >
                <Youtube className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="w-8 h-8 p-0 bg-gray-700 hover:bg-blue-700"
              >
                <Linkedin className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Properties for Sale
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Properties for Rent
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  New Projects
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  PG & Hostels
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Commercial Properties
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Plot & Land
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4">Our Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Property Valuation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Home Loans
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Legal Services
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Property Management
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Interior Design
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Property Insurance
                </a>
              </li>
            </ul>
          </div>

          {/* Mobile Apps */}
          <div>
            <h4 className="font-semibold mb-4">Get Our Mobile App</h4>
            <p className="text-gray-300 text-sm mb-4">
              Download our app for a faster and better experience
            </p>
            <div className="space-y-3">
              <Button
                variant="secondary"
                className="w-full justify-start bg-gray-800 hover:bg-gray-700 text-white"
              >
                <Play className="h-5 w-5 mr-2" />
                <div className="text-left">
                  <div className="text-xs text-gray-300">GET IT ON</div>
                  <div className="font-semibold">Google Play</div>
                </div>
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start bg-gray-800 hover:bg-gray-700 text-white"
              >
                <Smartphone className="h-5 w-5 mr-2" />
                <div className="text-left">
                  <div className="text-xs text-gray-300">Download on the</div>
                  <div className="font-semibold">App Store</div>
                </div>
              </Button>
            </div>
          </div>
        </div>

        <Separator className="bg-gray-700" />

        {/* Popular Cities */}
        <div className="py-8">
          <h4 className="font-semibold mb-4">Properties in Popular Cities</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
            {[
              "Mumbai",
              "Delhi",
              "Bangalore",
              "Hyderabad",
              "Pune",
              "Chennai",
              "Kolkata",
              "Ahmedabad",
              "Gurgaon",
              "Noida",
              "Faridabad",
              "Ghaziabad",
              "Surat",
              "Lucknow",
              "Kochi",
              "Indore",
              "Nagpur",
              "Thane",
            ].map((city, index) => (
              <a
                key={index}
                href="#"
                className="text-gray-300 hover:text-white transition-colors"
              >
                {city}
              </a>
            ))}
          </div>
        </div>

        <Separator className="bg-gray-700" />

        {/* Bottom Footer */}
        <div className="pt-8 text-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="text-gray-300">
              <p>
                © 2024 Magicbricks Realty Services Limited. All Rights Reserved.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Terms & Conditions
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Sitemap
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 p-4 bg-gray-800 rounded-lg">
            <h5 className="font-semibold mb-2 text-yellow-400">Disclaimer:</h5>
            <p className="text-xs text-gray-300 leading-relaxed">
              Magicbricks Realty Services Limited is only an intermediary
              offering its platform to facilitate the transactions between
              Seller and Customer/Buyer/User and is not and cannot be a party to
              or control in any manner any transactions between the Seller and
              the Customer/Buyer/User. All the offers and discounts on this
              website have been extended by various builders/developers.
              Magicbricks does not guarantee, authenticate or endorse the
              validity of the offers extended by the builder/developers. You are
              advised to verify all the details, including area, amenities,
              services, terms of sales and payments and other relevant
              conditions, before making any kind of booking/purchase of any of
              the individual units, plots or apartments.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
