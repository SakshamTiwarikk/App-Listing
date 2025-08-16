"use client";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import ImageCarousel from "./ImageCarousel";

type Listing = {
  id: number | string;
  name: string;
  price: number | string;
  images: string[];
  description?: string | null;
  city?: string | null;
  property_type?: string | null;
  bhk?: string | null;
  facing?: string | null;
  size?: string | null;
  floors?: string | null;
  total_floors?: string | null;
  location?: string | null;
  street_landmark?: string | null;
  map_link?: string | null;
  rent_or_lease?: string | null;
  deposit?: string | null;
  maintenance?: string | null;
  available_from?: string | null;
  furnishing?: string | null;
  parking?: string | null;
  preferred_tenants?: string | null;
  non_veg_allowed?: boolean | null;
  shown_by?: string | null;
  booking_date?: string | null;
  agreement_duration?: string | null;
  bookingStatus?: string;
  transaction_image?: string | null;
  mode_of_payment?: string | null;
  bookedBy?: string | null;
  updatedOn?: string | null;
  updatedBy?: string | null;
  companyId?: string | null;
};

type ImagePreview = { file: File; url: string; name: string };

interface MyListingsProps {
  token: string | null;
  onTokenExpired: () => void;
}

export default function MyListings({ token, onTokenExpired }: MyListingsProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const ITEMS_PER_PAGE = 10;

  // Add form state
  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [propertyType, setPropertyType] = useState<string>("");
  const [bhk, setBhk] = useState<string>("");
  const [facing, setFacing] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const [floors, setFloors] = useState<string>("");
  const [totalFloors, setTotalFloors] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [streetLandmark, setStreetLandmark] = useState<string>("");
  const [mapLink, setMapLink] = useState<string>("");
  const [rentOrLease, setRentOrLease] = useState<string>("");
  const [deposit, setDeposit] = useState<string>("");
  const [maintenance, setMaintenance] = useState<string>("");
  const [availableFrom, setAvailableFrom] = useState<string>("");
  const [furnishing, setFurnishing] = useState<string>("");
  const [parking, setParking] = useState<string>("");
  const [preferredTenants, setPreferredTenants] = useState<string>("");
  const [nonVegAllowed, setNonVegAllowed] = useState<boolean>(false);
  const [shownBy, setShownBy] = useState<string>("");
  const [bookingDate, setBookingDate] = useState<string>("");
  const [agreementDuration, setAgreementDuration] = useState<string>("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<ImagePreview[]>([]);
  const [bookingStatus, setBookingStatus] = useState<string>("available");
  const [transactionImage, setTransactionImage] = useState<File | null>(null);
  const [modeOfPayment, setModeOfPayment] = useState<string>("");
  const [bookedBy, setBookedBy] = useState<string>("");
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>(
    []
  );
  const [showModal, setShowModal] = useState<boolean>(false);

  // Edit form state
  const [editModal, setEditModal] = useState<boolean>(false);
  const [editListing, setEditListing] = useState<Listing | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editPrice, setEditPrice] = useState<string>("");
  const [editDescription, setEditDescription] = useState<string>("");
  const [editCity, setEditCity] = useState<string>("");
  const [editPropertyType, setEditPropertyType] = useState<string>("");
  const [editBhk, setEditBhk] = useState<string>("");
  const [editFacing, setEditFacing] = useState<string>("");
  const [editSize, setEditSize] = useState<string>("");
  const [editFloors, setEditFloors] = useState<string>("");
  const [editTotalFloors, setEditTotalFloors] = useState<string>("");
  const [editLocation, setEditLocation] = useState<string>("");
  const [editStreetLandmark, setEditStreetLandmark] = useState<string>("");
  const [editMapLink, setEditMapLink] = useState<string>("");
  const [editRentOrLease, setEditRentOrLease] = useState<string>("");
  const [editDeposit, setEditDeposit] = useState<string>("");
  const [editMaintenance, setEditMaintenance] = useState<string>("");
  const [editAvailableFrom, setEditAvailableFrom] = useState<string>("");
  const [editFurnishing, setEditFurnishing] = useState<string>("");
  const [editParking, setEditParking] = useState<string>("");
  const [editPreferredTenants, setEditPreferredTenants] = useState<string>("");
  const [editNonVegAllowed, setEditNonVegAllowed] = useState<boolean>(false);
  const [editShownBy, setEditShownBy] = useState<string>("");
  const [editBookingDate, setEditBookingDate] = useState<string>("");
  const [editAgreementDuration, setEditAgreementDuration] =
    useState<string>("");
  const [editImages, setEditImages] = useState<File[]>([]);
  const [editImagePreview, setEditImagePreview] = useState<ImagePreview[]>([]);
  const [editBookingStatus, setEditBookingStatus] =
    useState<string>("available");
  const [editTransactionImage, setEditTransactionImage] = useState<File | null>(
    null
  );
  const [editModeOfPayment, setEditModeOfPayment] = useState<string>("");
  const [editBookedBy, setEditBookedBy] = useState<string>("");

  // Update Status Modal state
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);
  const [statusListing, setStatusListing] = useState<Listing | null>(null);

  const fetchListings = useCallback(
    async (page = 1, append = false) => {
      if (loading) return;
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5000/api/listings?page=${page}&limit=${ITEMS_PER_PAGE}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) {
          if (response.status === 401) onTokenExpired();
          throw new Error("Failed to fetch listings");
        }
        const data = await response.json();
        const newListings = data.listings || data;
        const totalCount = data.total || newListings.length;
        if (append) setListings((prev) => [...prev, ...newListings]);
        else setListings(newListings);
        setHasMore(page * ITEMS_PER_PAGE < totalCount);
      } catch (err) {
        console.error("Failed to fetch listings", err);
        if (!append) onTokenExpired();
      } finally {
        setLoading(false);
      }
    },
    [token, loading, ITEMS_PER_PAGE, onTokenExpired]
  );

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchListings(nextPage, true);
    }
  }, [currentPage, hasMore, loading, fetchListings]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      if (
        scrollTop + clientHeight >= scrollHeight - 1000 &&
        hasMore &&
        !loading
      )
        loadMore();
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMore, hasMore, loading]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        if (!token) {
          console.warn("No token available, skipping employee fetch");
          return;
        }
        const response = await fetch(
          "http://localhost:5000/api/employees/active",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to fetch employees: ${response.status} - ${errorText}`
          );
        }
        const data = await response.json();
        setEmployees(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("Error fetching employees:", err.message);
        } else {
          console.error("Error fetching employees:", err);
        }
      }
    };
    if (token) fetchEmployees();
  }, [token]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }
    setImages(files);
    const previews: ImagePreview[] = [];
    let loadedCount = 0;
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        previews[index] = {
          file,
          url: event.target?.result as string,
          name: file.name,
        };
        loadedCount++;
        if (loadedCount === files.length) setImagePreview([...previews]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }
    setEditImages(files);
    const previews: ImagePreview[] = [];
    let loadedCount = 0;
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        previews[index] = {
          file,
          url: event.target?.result as string,
          name: file.name,
        };
        loadedCount++;
        if (loadedCount === files.length) setEditImagePreview([...previews]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleTransactionImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0] || null;
    setTransactionImage(file);
  };

  const handleEditTransactionImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0] || null;
    // setEditTransactionImage(file); // This line is removed
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    const newPreviews = [...imagePreview];
    newPreviews.splice(index, 1);
    setImagePreview(newPreviews);
  };

  const removeEditImage = (index: number) => {
    const newImages = [...editImages];
    newImages.splice(index, 1);
    setEditImages(newImages);
    const newPreviews = [...editImagePreview];
    newPreviews.splice(index, 1);
    setEditImagePreview(newPreviews);
  };

  const handleAddListing = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || !price.trim()) {
      alert("Please fill in all required fields");
      return;
    }
    if (images.length === 0) {
      alert("Please select at least one image");
      return;
    }
    if (!token) {
      alert("You are not logged in.");
      onTokenExpired();
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("price", price);
    formData.append("description", description.trim());
    formData.append("city", city.trim());
    formData.append("property_type", propertyType.trim());
    formData.append("bhk", bhk.trim());
    formData.append("facing", facing.trim());
    formData.append("size", size.trim());
    formData.append("floors", floors.trim());
    formData.append("total_floors", totalFloors.trim());
    formData.append("location", location.trim());
    formData.append("street_landmark", streetLandmark.trim());
    formData.append("map_link", mapLink.trim());
    formData.append("rent_or_lease", rentOrLease.trim());
    formData.append("deposit", deposit.trim());
    formData.append("maintenance", maintenance.trim());
    formData.append("available_from", availableFrom.trim());
    formData.append("furnishing", furnishing.trim());
    formData.append("parking", parking.trim());
    formData.append("preferred_tenants", preferredTenants.trim());
    formData.append("non_veg_allowed", nonVegAllowed.toString());
    formData.append("shown_by", shownBy.trim());
    formData.append("booking_date", bookingDate);
    formData.append("agreement_duration", agreementDuration.trim());
    formData.append("bookingStatus", bookingStatus);
    if (transactionImage)
      formData.append("transaction_image", transactionImage);
    formData.append("mode_of_payment", modeOfPayment);
    formData.append("bookedBy", bookedBy);
    images.forEach((image) => formData.append("images", image));

    try {
      const response = await fetch("http://localhost:5000/api/listing", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) throw new Error(await response.text());
      resetAddForm();
      setCurrentPage(1);
      setListings([]);
      fetchListings(1, false);
      alert("Listing added successfully!");
    } catch (err: unknown) {
      console.error("Error adding listing:", err);
      if (err instanceof Error) {
        alert(err.message || "Failed to add listing.");
      } else {
        alert("Failed to add listing.");
      }
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("🔄 Starting edit submit...");
    console.log("Edit Listing ID:", editListing?.id);
    console.log("Edit Booking Status:", editBookingStatus);
    console.log("Edit Booked By:", editBookedBy);

    if (!editName.trim() || !editPrice.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      // ✅ For simple updates without new images, send JSON
      if (editImages.length === 0) {
        console.log("📤 Sending JSON update (no new images)...");

        const updateData = {
          name: editName.trim(),
          price: editPrice,
          description: editDescription.trim(),
          city: editCity.trim(),
          property_type: editPropertyType.trim(),
          bhk: editBhk.trim(),
          facing: editFacing.trim(),
          size: editSize.trim(),
          floors: editFloors.trim(),
          total_floors: editTotalFloors.trim(),
          location: editLocation.trim(),
          street_landmark: editStreetLandmark.trim(),
          map_link: editMapLink.trim(),
          rent_or_lease: editRentOrLease.trim(),
          deposit: editDeposit.trim(),
          maintenance: editMaintenance.trim(),
          available_from: editAvailableFrom.trim(),
          furnishing: editFurnishing.trim(),
          parking: editParking.trim(),
          preferred_tenants: editPreferredTenants.trim(),
          non_veg_allowed: editNonVegAllowed,
          shown_by: editShownBy.trim(),
          booking_date: editBookingDate,
          agreement_duration: editAgreementDuration.trim(),
          bookingStatus: editBookingStatus, // ✅ This is key for rent collection
          bookedBy: editBookedBy,
        };

        console.log("📝 Update payload:", updateData);

        const response = await fetch(
          `http://localhost:5000/api/listings/${editListing?.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updateData),
          }
        );

        console.log("📡 Response status:", response.status);
        console.log("📡 Response ok:", response.ok);

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          const errorText = await response.text().catch(() => "Unknown error");

          console.error("❌ Response error data:", errorData);
          console.error("❌ Response error text:", errorText);

          throw new Error(
            errorData?.message || errorText || `HTTP ${response.status}`
          );
        }

        const result = await response.json();
        console.log("✅ Update successful:", result);
      } else {
        // ✅ For updates with new images, send FormData
        console.log("📤 Sending FormData update (with new images)...");

        const formData = new FormData();
        formData.append("name", editName.trim());
        formData.append("price", editPrice);
        formData.append("description", editDescription.trim());
        formData.append("bookingStatus", editBookingStatus);
        formData.append("bookedBy", editBookedBy);
        // ... add other fields as needed

        editImages.forEach((image) => formData.append("images", image));

        const response = await fetch(
          `http://localhost:5000/api/listings/${editListing?.id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              // Don't set Content-Type for FormData
            },
            body: formData,
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText);
        }
      }

      // ✅ Success handling
      resetEditForm();
      setCurrentPage(1);
      setListings([]);
      fetchListings(1, false);
      alert("Listing updated successfully!");
    } catch (err: unknown) {
      console.error("❌ Update error details:", err);
      if (err instanceof Error) {
        alert(`Failed to update listing: ${err.message}`);
      } else {
        alert("Failed to update listing: Unknown error");
      }
    }
  };

  const resetAddForm = () => {
    setShowModal(false);
    setName("");
    setPrice("");
    setDescription("");
    setCity("");
    setPropertyType("");
    setBhk("");
    setFacing("");
    setSize("");
    setFloors("");
    setTotalFloors("");
    setLocation("");
    setStreetLandmark("");
    setMapLink("");
    setRentOrLease("");
    setDeposit("");
    setMaintenance("");
    setAvailableFrom("");
    setFurnishing("");
    setParking("");
    setPreferredTenants("");
    setNonVegAllowed(false);
    setShownBy("");
    setBookingDate("");
    setAgreementDuration("");
    setImages([]);
    setImagePreview([]);
    setBookingStatus("available");
    setTransactionImage(null);
    setModeOfPayment("");
    setBookedBy("");
  };

  const resetEditForm = () => {
    setEditModal(false);
    setEditListing(null);
    setEditName("");
    setEditPrice("");
    setEditDescription("");
    setEditCity("");
    setEditPropertyType("");
    setEditBhk("");
    setEditFacing("");
    setEditSize("");
    setEditFloors("");
    setEditTotalFloors("");
    setEditLocation("");
    setEditStreetLandmark("");
    setEditMapLink("");
    setEditRentOrLease("");
    setEditDeposit("");
    setEditMaintenance("");
    setEditAvailableFrom("");
    setEditFurnishing("");
    setEditParking("");
    setEditPreferredTenants("");
    setEditNonVegAllowed(false);
    setEditShownBy("");
    setEditBookingDate("");
    setEditAgreementDuration("");
    setEditImages([]);
    setEditImagePreview([]);
    setEditBookingStatus("available");
    // setEditTransactionImage(null); // This line is removed
    setEditModeOfPayment("");
    setEditBookedBy("");
  };

  const openEditModal = (item: Listing) => {
    setEditImages([]);
    setEditImagePreview([]);
    setEditListing({ ...item });
    setEditName(item.name);
    setEditPrice(item.price.toString());
    setEditDescription(item.description || "");
    setEditCity(item.city || "");
    setEditPropertyType(item.property_type || "");
    setEditBhk(item.bhk || "");
    setEditFacing(item.facing || "");
    setEditSize(item.size || "");
    setEditFloors(item.floors || "");
    setEditTotalFloors(item.total_floors || "");
    setEditLocation(item.location || "");
    setEditStreetLandmark(item.street_landmark || "");
    setEditMapLink(item.map_link || "");
    setEditRentOrLease(item.rent_or_lease || "");
    setEditDeposit(item.deposit || "");
    setEditMaintenance(item.maintenance || "");
    setEditAvailableFrom(item.available_from || "");
    setEditFurnishing(item.furnishing || "");
    setEditParking(item.parking || "");
    setEditPreferredTenants(item.preferred_tenants || "");
    setEditNonVegAllowed(item.non_veg_allowed || false);
    setEditShownBy(item.shown_by || "");
    setEditBookingDate(item.booking_date || "");
    setEditAgreementDuration(item.agreement_duration || "");
    setEditBookingStatus(item.bookingStatus || "available");
    // setEditTransactionImage(null); // This line is removed
    setEditModeOfPayment(item.mode_of_payment || "");
    setEditBookedBy(item.bookedBy || "");
    setEditModal(true);
  };

  const openStatusModal = (item: Listing) => {
    setStatusListing(item);
    setShowStatusModal(true);
  };

  useEffect(() => {
    if (token) {
      setCurrentPage(1);
      setListings([]);
      fetchListings(1, false);
    }
  }, [token]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">My Listings</h2>
          <p className="text-gray-600 mt-1">Manage your property listings</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2 shadow-sm"
        >
          <span>➕</span>
          <span>Add Listing</span>
        </button>
      </div>

      {/* Listings Grid */}
      {listings.length === 0 && !loading ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No listings found
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first listing to get started!
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Your First Listing
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((item) => (
              <div
                key={item.id}
                className="bg-white shadow-sm p-4 rounded-lg hover:shadow-md transition-shadow duration-200 border border-gray-100"
              >
                <h3 className="text-lg font-bold mb-2 truncate text-gray-800">
                  {item.name}
                </h3>
                <p className="text-gray-700 mb-1 text-xl font-semibold text-green-600">
                  ₹{item.price}
                </p>
                {item.city && (
                  <p className="text-gray-600 mb-1">City: {item.city}</p>
                )}
                {item.property_type && (
                  <p className="text-gray-600 mb-1">
                    Type: {item.property_type}
                  </p>
                )}
                {item.description && (
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {item.description}
                  </p>
                )}
                {item.images && item.images.length > 0 && (
                  <ImageCarousel
                    images={item.images.map(
                      (img) => `http://localhost:5000/uploads/${img}`
                    )}
                  />
                )}
                <button
                  onClick={() => openEditModal(item)}
                  className="w-full text-sm bg-yellow-50 text-yellow-700 px-3 py-2 rounded-lg hover:bg-yellow-100 transition-colors font-medium border border-yellow-200"
                >
                  ✏️ Edit Listing
                </button>
              </div>
            ))}
          </div>

          {/* Loading indicator */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading more listings...</p>
            </div>
          )}

          {/* End of listings message */}
          {!hasMore && listings.length > 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>🎉 You&#39;ve reached the end of your listings.</p>
            </div>
          )}
        </>
      )}

      {/* Add Listing Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  Add New Listing
                </h2>
                <button
                  onClick={resetAddForm}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleAddListing} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter property name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  placeholder="Enter price"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Enter property description"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  placeholder="Enter city"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <input
                  type="text"
                  placeholder="Enter property type (e.g., Apartment, Villa)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  BHK
                </label>
                <input
                  type="text"
                  placeholder="Enter BHK (e.g., 1, 2, 3)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={bhk}
                  onChange={(e) => setBhk(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facing
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={facing}
                  onChange={(e) => setFacing(e.target.value)}
                >
                  <option value="">Select facing</option>
                  <option value="East">East</option>
                  <option value="West">West</option>
                  <option value="North">North</option>
                  <option value="South">South</option>
                  <option value="North-East">North-East</option>
                  <option value="North-West">North-West</option>
                  <option value="South-East">South-East</option>
                  <option value="South-West">South-West</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size
                </label>
                <input
                  type="text"
                  placeholder="Enter size (e.g., 1000 sq.ft)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Floors
                </label>
                <input
                  type="text"
                  placeholder="Enter number of floors"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={floors}
                  onChange={(e) => setFloors(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Floors
                </label>
                <input
                  type="text"
                  placeholder="Enter total number of floors"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={totalFloors}
                  onChange={(e) => setTotalFloors(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Enter location"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street/Landmark
                </label>
                <input
                  type="text"
                  placeholder="Enter street or landmark"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={streetLandmark}
                  onChange={(e) => setStreetLandmark(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Map Link
                </label>
                <input
                  type="text"
                  placeholder="Enter map link"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={mapLink}
                  onChange={(e) => setMapLink(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rent or Lease
                </label>
                <input
                  type="text"
                  placeholder="Enter rent or lease type"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={rentOrLease}
                  onChange={(e) => setRentOrLease(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deposit
                </label>
                <input
                  type="text"
                  placeholder="Enter deposit amount"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maintenance
                </label>
                <input
                  type="text"
                  placeholder="Enter maintenance amount"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={maintenance}
                  onChange={(e) => setMaintenance(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available From
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={availableFrom}
                  onChange={(e) => setAvailableFrom(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Furnishing
                </label>
                <input
                  type="text"
                  placeholder="Enter furnishing type (e.g., Fully, Semi)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={furnishing}
                  onChange={(e) => setFurnishing(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parking
                </label>
                <input
                  type="text"
                  placeholder="Enter parking type (e.g., Bike, Car)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={parking}
                  onChange={(e) => setParking(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Tenants
                </label>
                <input
                  type="text"
                  placeholder="Enter preferred tenants (e.g., Anyone, Family)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={preferredTenants}
                  onChange={(e) => setPreferredTenants(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Non-Veg Allowed
                </label>
                <input
                  type="checkbox"
                  className="w-5 h-5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  checked={nonVegAllowed}
                  onChange={(e) => setNonVegAllowed(e.target.checked)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shown By
                </label>
                <input
                  type="text"
                  placeholder="Enter shown by details"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={shownBy}
                  onChange={(e) => setShownBy(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Booking Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agreement Duration
                </label>
                <input
                  type="text"
                  placeholder="Enter duration (e.g., 12 months)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={agreementDuration}
                  onChange={(e) => setAgreementDuration(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Property Images *
                </label>
                <input
                  type="file"
                  multiple
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onChange={handleImageChange}
                  accept="image/*"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can select multiple images (Max 5)
                </p>
              </div>

              {imagePreview.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Selected Images ({imagePreview.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg max-h-60 overflow-y-auto">
                    {imagePreview.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview.url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                        <p className="text-xs text-gray-600 mt-1 truncate">
                          {preview.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetAddForm}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={
                    images.length === 0 || !name.trim() || !price.trim()
                  }
                >
                  Add Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Listing Modal */}
      {editModal && editListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  Edit Listing: {editListing.name}
                </h2>
                <button
                  onClick={resetEditForm}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter property name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  placeholder="Enter price"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Enter property description"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  placeholder="Enter city"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <input
                  type="text"
                  placeholder="Enter property type (e.g., Apartment, Villa)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={editPropertyType}
                  onChange={(e) => setEditPropertyType(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  BHK
                </label>
                <input
                  type="text"
                  placeholder="Enter BHK (e.g., 1, 2, 3)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={editBhk}
                  onChange={(e) => setEditBhk(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facing
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={editFacing}
                  onChange={(e) => setEditFacing(e.target.value)}
                >
                  <option value="">Select facing</option>
                  <option value="East">East</option>
                  <option value="West">West</option>
                  <option value="North">North</option>
                  <option value="South">South</option>
                  <option value="North-East">North-East</option>
                  <option value="North-West">North-West</option>
                  <option value="South-East">South-East</option>
                  <option value="South-West">South-West</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size
                </label>
                <input
                  type="text"
                  placeholder="Enter size (e.g., 1000 sq.ft)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={editSize}
                  onChange={(e) => setEditSize(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Floors
                </label>
                <input
                  type="text"
                  placeholder="Enter number of floors"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={editFloors}
                  onChange={(e) => setEditFloors(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Floors
                </label>
                <input
                  type="text"
                  placeholder="Enter total number of floors"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={editTotalFloors}
                  onChange={(e) => setEditTotalFloors(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Enter location"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street/Landmark
                </label>
                <input
                  type="text"
                  placeholder="Enter street or landmark"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={editStreetLandmark}
                  onChange={(e) => setEditStreetLandmark(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Map Link
                </label>
                <input
                  type="text"
                  placeholder="Enter map link"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={editMapLink}
                  onChange={(e) => setEditMapLink(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rent or Lease
                </label>
                <input
                  type="text"
                  placeholder="Enter rent or lease type"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={editRentOrLease}
                  onChange={(e) => setEditRentOrLease(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deposit
                </label>
                <input
                  type="text"
                  placeholder="Enter deposit amount"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={editDeposit}
                  onChange={(e) => setEditDeposit(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maintenance
                </label>
                <input
                  type="text"
                  placeholder="Enter maintenance amount"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={editMaintenance}
                  onChange={(e) => setEditMaintenance(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available From
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={editAvailableFrom}
                  onChange={(e) => setEditAvailableFrom(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Furnishing
                </label>
                <input
                  type="text"
                  placeholder="Enter furnishing type (e.g., Fully, Semi)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={editFurnishing}
                  onChange={(e) => setEditFurnishing(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parking
                </label>
                <input
                  type="text"
                  placeholder="Enter parking type (e.g., Bike, Car)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={editParking}
                  onChange={(e) => setEditParking(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Tenants
                </label>
                <input
                  type="text"
                  placeholder="Enter preferred tenants (e.g., Anyone, Family)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={editPreferredTenants}
                  onChange={(e) => setEditPreferredTenants(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Non-Veg Allowed
                </label>
                <input
                  type="checkbox"
                  className="w-5 h-5 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                  checked={editNonVegAllowed}
                  onChange={(e) => setEditNonVegAllowed(e.target.checked)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shown By
                </label>
                <input
                  type="text"
                  placeholder="Enter shown by details"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={editShownBy}
                  onChange={(e) => setEditShownBy(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Booking Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={editBookingDate}
                  onChange={(e) => setEditBookingDate(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agreement Duration
                </label>
                <input
                  type="text"
                  placeholder="Enter duration (e.g., 12 months)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={editAgreementDuration}
                  onChange={(e) => setEditAgreementDuration(e.target.value)}
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Booking Status
                </label>
                <select
                  value={editBookingStatus} // ✅ Correct state variable
                  onChange={(e) => setEditBookingStatus(e.target.value)} // ✅ Correct setter
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="available">Available</option>
                  <option value="booked">Booked</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Booked By
                </label>
                <select
                  value={editBookedBy} // ✅ Correct state variable
                  onChange={(e) => setEditBookedBy(e.target.value)} // ✅ Correct setter
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={editBookingStatus !== "booked"} // Only enable when status is booked
                >
                  <option value="">Select employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>

              {editListing.images && editListing.images.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Current Images
                  </h3>
                  <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-lg">
                    {editListing.images.map((img, index) => (
                      <img
                        key={index}
                        src={`http://localhost:5000/uploads/${img}`}
                        alt="Current"
                        className="w-full h-20 object-cover rounded border border-gray-200"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Upload new images to replace these
                  </p>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload New Images (Optional)
                </label>
                <input
                  type="file"
                  multiple
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  onChange={handleEditImageChange}
                  accept="image/*"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to keep current images
                </p>
              </div>

              {editImagePreview.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    New Images ({editImagePreview.length}) - Will replace
                    current images
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-green-50 rounded-lg max-h-60 overflow-y-auto">
                    {editImagePreview.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview.url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeEditImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                        <p className="text-xs text-gray-600 mt-1 truncate">
                          {preview.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetEditForm}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={!editName.trim() || !editPrice.trim()}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
