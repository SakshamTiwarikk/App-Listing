"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";

interface Listing {
  id: number;
  name: string;
  price: number;
  description: string;
  images: string[];
  bookingStatus: string;
  rentStatus?: string; // ✅ Added rent status field
  companyId: string | null;
  city?: string | null;
  property_type?: string | null;
  bhk?: string | null;
  bookedBy?: string | null;
  booking_date?: string | null;
  updatedOn?: string | null;
  updatedBy?: string | null;
}

interface RentCollectionProps {
  companyId: string;
  token: string;
}

const RentCollection: React.FC<RentCollectionProps> = ({
  companyId,
  token,
}) => {
  const [bookedListings, setBookedListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "online">("cash");
  const [rentStatus, setRentStatus] = useState<"pending" | "paid">("pending"); // ✅ Added rent status state
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [collectingRent, setCollectingRent] = useState(false);

  // Function to refresh listings
  const refreshListings = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Token being sent:", token ? "Present" : "Missing");

      if (!token) {
        setError("Authentication token missing. Please login again.");
        return;
      }

      const response = await axios.get(`http://localhost:5000/api/listings`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const allListings: Listing[] = Array.isArray(response.data.listings)
        ? response.data.listings
        : [];

      console.log("API Response:", response.data);
      console.log("Fetched listings:", allListings);

      // ✅ Updated filter: Only show booked listings with pending rent status
      const bookedPendingListings = allListings.filter((listing) => {
        const bookingStatus = listing.bookingStatus?.toLowerCase();
        const rentStatus = listing.rentStatus?.toLowerCase() || "pending"; // Default to pending

        const isBooked = bookingStatus === "booked";
        const isPending = rentStatus === "pending";

        console.log(
          `Listing ${listing.id}: bookingStatus="${
            listing.bookingStatus
          }", rentStatus="${listing.rentStatus}", showing=${
            isBooked && isPending
          }`
        );

        return isBooked && isPending;
      });

      console.log("Filtered booked + pending listings:", bookedPendingListings);
      setBookedListings(bookedPendingListings);
    } catch (error: unknown) {
      console.error("Error fetching booked listings:", error);

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setError("Authentication failed. Please login again.");
      } else if (error instanceof Error) {
        setError(`Failed to fetch booked listings: ${error.message}`);
      } else {
        setError("Failed to fetch booked listings");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle collect rent button click
  const handleCollectRentClick = (listing: Listing) => {
    setSelectedListing(listing);
    setIsModalOpen(true);
    setPaymentMethod("cash");
    setRentStatus("pending"); // ✅ Default to pending
    setScreenshot(null);
  };

  // Handle modal close
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedListing(null);
    setPaymentMethod("cash");
    setRentStatus("pending"); // ✅ Reset rent status
    setScreenshot(null);
  };

  // Handle screenshot upload
  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      setScreenshot(file);
    }
  };

  // Handle rent collection submission
  const handleSubmitRentCollection = async () => {
    if (!selectedListing) return;

    if (!token) {
      alert("Authentication token missing. Please login again.");
      return;
    }

    if (paymentMethod === "online" && !screenshot) {
      alert("Please upload a payment screenshot for online payments");
      return;
    }

    try {
      setCollectingRent(true);

      const formData = new FormData();
      formData.append("listingId", selectedListing.id.toString());
      formData.append("paymentMethod", paymentMethod);
      formData.append("rentStatus", rentStatus); // ✅ Make sure this is being sent
      formData.append("amount", selectedListing.price.toString());
      formData.append("collectionDate", new Date().toISOString());

      if (paymentMethod === "online" && screenshot) {
        formData.append("paymentScreenshot", screenshot);
      }

      // ✅ Debug: Log what we're sending
      console.log("Sending FormData:");
      for (const [key, value] of formData.entries()) {
        console.log(key, value);
      }

      console.log("API URL:", `http://localhost:5000/api/rent/collect`);
      console.log(
        "Headers will include Authorization:",
        `Bearer ${token?.substring(0, 20)}...`
      );

      const response = await axios.post(
        `http://localhost:5000/api/rent/collect`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("✅ Response:", response.data);

      if (response.status === 200) {
        const statusMessage =
          rentStatus === "paid"
            ? `Rent marked as paid for ${selectedListing.name}! This listing will be removed from pending collections.`
            : `Rent collection recorded as pending for ${selectedListing.name}!`;

        alert(statusMessage);
        closeModal();

        // ✅ Force refresh after a short delay to ensure database is updated
        setTimeout(() => {
          refreshListings();
        }, 1000);
      }
    } catch (error: unknown) {
      console.error("❌ Full error details:", error);
      if (axios.isAxiosError(error)) {
        console.error("❌ Response data:", error.response?.data);
        console.error("❌ Response status:", error.response?.status);

        if (error.response?.status === 401) {
          alert("Authentication failed. Please login again.");
        } else {
          alert(
            `Failed to process rent collection: ${
              error.response?.data?.message || "Unknown error"
            }`
          );
        }
      } else if (error instanceof Error) {
        alert(`Failed to process rent collection: ${error.message}`);
      } else {
        alert("Failed to process rent collection: Unknown error");
      }
    } finally {
      setCollectingRent(false);
    }
  };

  useEffect(() => {
    if (token) {
      refreshListings();
    }
  }, [companyId, token, refreshListings]);

  // Auto-refresh every 30 seconds to catch updates
  useEffect(() => {
    if (token) {
      const interval = setInterval(refreshListings, 30000);
      return () => clearInterval(interval);
    }
  }, [token, refreshListings]);

  if (loading) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Pending Rent Collections</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading pending rent collections...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Pending Rent Collections</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={refreshListings}
            className="mt-2 text-red-800 underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            Pending Rent Collections
          </h2>
          <p className="text-gray-600 mt-1">
            Manage booked listings with pending rent payments
          </p>
        </div>
        <button
          onClick={refreshListings}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>🔄</span>
          Refresh
        </button>
      </div>

      {bookedListings.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No pending rent collections
            </h3>
            <p className="text-gray-600 mb-4">
              All booked listings have their rent collected or marked as paid
            </p>
            <div className="mt-4 text-sm text-gray-500 bg-gray-50 p-4 rounded">
              <p className="font-medium">Debug info:</p>
              <p>Token: {token ? "Available" : "Missing"}</p>
              <p>Company ID: {companyId || "Not provided"}</p>
              <button
                onClick={refreshListings}
                className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              >
                Check Again
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookedListings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 truncate">
                    {listing.name}
                  </h3>
                  <div className="flex flex-col gap-1">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      Booked
                    </span>
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      Rent Pending
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Price:</span> ₹{listing.price}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Booking Status:</span>{" "}
                    {listing.bookingStatus}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Rent Status:</span>{" "}
                    <span className="text-yellow-600 font-medium">
                      {listing.rentStatus || "Pending"}
                    </span>
                  </p>
                  {listing.city && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">City:</span> {listing.city}
                    </p>
                  )}
                  {listing.bookedBy && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Booked By:</span>{" "}
                      {listing.bookedBy}
                    </p>
                  )}
                  {listing.booking_date && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Booking Date:</span>{" "}
                      {new Date(listing.booking_date).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {listing.description && (
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                    {listing.description}
                  </p>
                )}

                {listing.images && listing.images.length > 0 && (
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {listing.images.slice(0, 3).map((img, index) => (
                      <div key={index} className="flex-shrink-0">
                        <Image
                          src={`http://localhost:5000/uploads/${img}`}
                          alt={`Listing ${index + 1}`}
                          width={64}
                          height={64}
                          className="w-16 h-16 object-cover rounded border border-gray-200"
                        />
                      </div>
                    ))}
                    {listing.images.length > 3 && (
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
                        <span className="text-xs text-gray-500">
                          +{listing.images.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4">
                  <button
                    onClick={() => handleCollectRentClick(listing)}
                    className="w-full bg-green-600 text-white text-sm py-2 px-4 rounded hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>💰</span>
                    Process Rent
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ Updated Rent Collection Modal with Status Dropdown */}
      {isModalOpen && selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Process Rent Collection
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">
                  {selectedListing.name}
                </h4>
                <p className="text-2xl font-bold text-green-600 mb-4">
                  ₹{selectedListing.price}
                </p>
              </div>

              {/* ✅ Rent Status Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Rent Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={rentStatus}
                  onChange={(e) =>
                    setRentStatus(e.target.value as "pending" | "paid")
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent mb-2"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
                <p className="text-xs text-gray-500">
                  {rentStatus === "paid"
                    ? "⚠️ Marking as 'Paid' will remove this listing from the rent collection view"
                    : "This listing will remain in the rent collection view until marked as paid"}
                </p>
              </div>

              {/* Payment Method Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Method
                </label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={paymentMethod === "cash"}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value as "cash")
                      }
                      className="mr-3"
                    />
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">💵</span>
                      <span>Cash Payment</span>
                    </div>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={paymentMethod === "online"}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value as "online")
                      }
                      className="mr-3"
                    />
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">💳</span>
                      <span>Online Payment</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Screenshot Upload for Online Payment */}
              {paymentMethod === "online" && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Screenshot <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                  {screenshot && (
                    <div className="mt-2">
                      <p className="text-sm text-green-600">
                        ✓ Screenshot selected: {screenshot.name}
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Upload a screenshot of the online payment confirmation
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={closeModal}
                  disabled={collectingRent}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRentCollection}
                  disabled={
                    collectingRent ||
                    (paymentMethod === "online" && !screenshot)
                  }
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {collectingRent ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    `${
                      rentStatus === "paid" ? "Mark as Paid" : "Save as Pending"
                    }`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentCollection;
