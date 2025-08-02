"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../dashboard/components/Sidebar";
import MyListings from "../dashboard/components/MyListings";
import EmployeesPage from "../dashboard/components/EmployeesPage"; // Import the new component
import BookAppointment from "../dashboard/BookAppointment";

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("my-listings");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        router.push("/login");
      } else {
        setToken(storedToken);
      }
    }
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    router.push("/login");
  };

  const handleTokenExpired = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    router.push("/login");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "my-listings":
        return <MyListings token={token} onTokenExpired={handleTokenExpired} />;
      case "employees":
        return <EmployeesPage />;
      case "book-appointment":
        return <BookAppointment />;
      case "analytics":
        return (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Analytics
              </h2>
              <p className="text-gray-600 mt-1">
                Track your listing performance
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <p className="text-gray-600 mb-6">
                Analytics dashboard coming soon...
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-blue-800">
                        Total Listings
                      </h3>
                      <p className="text-2xl font-bold text-blue-600 mt-2">-</p>
                    </div>
                    <div className="text-blue-500 text-2xl">📋</div>
                  </div>
                </div>
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-green-800">
                        Active Listings
                      </h3>
                      <p className="text-2xl font-bold text-green-600 mt-2">
                        -
                      </p>
                    </div>
                    <div className="text-green-500 text-2xl">✅</div>
                  </div>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-purple-800">
                        Total Views
                      </h3>
                      <p className="text-2xl font-bold text-purple-600 mt-2">
                        -
                      </p>
                    </div>
                    <div className="text-purple-500 text-2xl">👁️</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Settings</h2>
              <p className="text-gray-600 mt-1">
                Manage your account preferences
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Notifications
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        Email Notifications
                      </label>
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        defaultChecked
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        Auto-refresh listings
                      </label>
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        SMS notifications
                      </label>
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                      />
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Account
                  </h3>
                  <div className="space-y-3">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Change Password
                    </button>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium block">
                      Update Profile
                    </button>
                    <button className="text-red-600 hover:text-red-800 text-sm font-medium block">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "profile":
        return (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Profile</h2>
              <p className="text-gray-600 mt-1">
                Manage your profile information
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center space-x-6 mb-6">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-semibold">U</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    User Name
                  </h3>
                  <p className="text-gray-600">user@example.com</p>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-1">
                    Change Photo
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your location"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />
      <div className="flex-1 ml-64 min-h-screen">{renderContent()}</div>
    </div>
  );
}
