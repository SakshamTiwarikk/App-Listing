import React from "react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onLogout,
}) => {
  const menuItems = [
    {
      id: "my-listings",
      label: "My Listings",
      icon: "📋",
      description: "Manage your property listings",
    },
    {
      id: "employees",
      label: "Employees",
      icon: "👥",
      description: "Manage company employees",
    },
    {
      id: "book-appointment",
      label: "Book Appointment",
      icon: "📅",
      description: "Schedule and manage appointments",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: "📊",
      description: "View performance metrics",
    },
    {
      id: "profile",
      label: "Profile",
      icon: "👤",
      description: "Manage your profile",
    },
    {
      id: "settings",
      label: "Settings",
      icon: "⚙️",
      description: "App preferences",
    },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg border-r border-gray-200 z-10">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">L</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">ListingApp</h1>
            <p className="text-sm text-gray-500">Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 group hover:bg-gray-50 ${
                  activeTab === item.id
                    ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <div
                      className={`font-medium ${
                        activeTab === item.id
                          ? "text-blue-700"
                          : "text-gray-800"
                      }`}
                    >
                      {item.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {item.description}
                    </div>
                  </div>
                </div>
                {activeTab === item.id && (
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-l-full"></div>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-medium">U</span>
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-800">User</div>
            <div className="text-sm text-gray-500">Online</div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
