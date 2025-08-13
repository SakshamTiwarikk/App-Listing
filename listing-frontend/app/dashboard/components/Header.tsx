import { Search, MapPin, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="bg-[#D32F2F] text-white">
      {/* Top Navigation */}
      <div className="border-b border-red-600">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <img
                  src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=40&h=40&fit=crop&crop=entropy&auto=format&q=80"
                  alt="Magicbricks"
                  className="h-8 w-8 mr-2"
                />
                <span className="text-xl font-bold">Magicbricks</span>
              </div>

              <ul className="flex items-center space-x-6 text-sm">
                <li>
                  <a href="#" className="hover:text-red-200">
                    Buy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-red-200">
                    Rent
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-red-200">
                    Sell
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-red-200">
                    Home Loans
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-red-200">
                    Home Interiors
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-red-200">
                    MB Advice
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-red-200">
                    Help
                  </a>
                </li>
              </ul>
            </div>

            <div className="flex items-center space-x-4">
              {/* Location Selector */}
              <div className="flex items-center space-x-1 hover:bg-red-600 px-2 py-1 rounded cursor-pointer">
                <MapPin size={16} />
                <span className="text-sm">Delhi NCR</span>
                <ChevronDown size={14} />
              </div>

              {/* Login Button */}
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-red-700 text-sm px-4 py-1"
              >
                <User size={16} className="mr-1" />
                Login
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
