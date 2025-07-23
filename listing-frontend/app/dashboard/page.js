"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function DashboardPage() {
  const router = useRouter();
  const [listings, setListings] = useState([]);

  // Add form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Edit form state
  const [editModal, setEditModal] = useState(false);
  const [editListing, setEditListing] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editImages, setEditImages] = useState([]);
  const [editImagePreview, setEditImagePreview] = useState([]);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Fetch user listings
  const fetchListings = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/listings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setListings(res.data);
    } catch (err) {
      console.error("Failed to fetch listings", err);
      router.push("/login");
    }
  };

  // Handle image selection for new listing
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }
    setImages(files);

    // Create preview URLs
    const previews = [];
    let loadedCount = 0;

    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        previews[index] = {
          file,
          url: event.target.result,
          name: file.name,
        };
        loadedCount++;
        if (loadedCount === files.length) {
          setImagePreview([...previews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle image selection for edit listing
  const handleEditImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }
    setEditImages(files);

    // Create preview URLs
    const previews = [];
    let loadedCount = 0;

    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        previews[index] = {
          file,
          url: event.target.result,
          name: file.name,
        };
        loadedCount++;
        if (loadedCount === files.length) {
          setEditImagePreview([...previews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove image from preview (new listing)
  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...imagePreview];
    newPreviews.splice(index, 1);
    setImagePreview(newPreviews);
  };

  // Remove image from edit preview
  const removeEditImage = (index) => {
    const newImages = [...editImages];
    newImages.splice(index, 1);
    setEditImages(newImages);

    const newPreviews = [...editImagePreview];
    newPreviews.splice(index, 1);
    setEditImagePreview(newPreviews);
  };

  // Handle new listing submit
  const handleAddListing = async (e) => {
    e.preventDefault();

    if (!name.trim() || !price.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    if (images.length === 0) {
      alert("Please select at least one image");
      return;
    }

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      alert("You are not logged in.");
      router.push("/login");
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("price", price);

    images.forEach((image) => {
      formData.append("images", image);
    });

    try {
      const response = await axios.post(
        "http://localhost:5000/api/listing",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // DO NOT SET Content-Type manually!
          },
        }
      );

      console.log("Listing created:", response.data);

      resetAddForm();
      fetchListings();
      alert("Listing added successfully!");
    } catch (err) {
      console.error("Error adding listing:");
      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Data:", err.response.data);
      } else {
        console.error("Message:", err.message);
      }
      alert("Error adding listing. Check console for details.");
    }
  };

  // Handle edit listing submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!editName.trim() || !editPrice.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    const formData = new FormData();
    formData.append("name", editName.trim());
    formData.append("price", editPrice);

    // Only append images if new ones were selected
    if (editImages.length > 0) {
      editImages.forEach((image) => {
        formData.append("images", image);
      });
    }

    try {
      await axios.put(
        `http://localhost:5000/api/listings/${editListing.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      resetEditForm();
      fetchListings();
      alert("Listing updated successfully!");
    } catch (err) {
      console.error("Error editing listing", err);
      alert("Error updating listing. Please try again.");
    }
  };

  // Reset add form
  const resetAddForm = () => {
    setShowModal(false);
    setName("");
    setPrice("");
    setImages([]);
    setImagePreview([]);
  };

  // Reset edit form
  const resetEditForm = () => {
    setEditModal(false);
    setEditListing(null);
    setEditName("");
    setEditPrice("");
    setEditImages([]);
    setEditImagePreview([]);
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  // Open edit modal with proper state initialization
  const openEditModal = (item) => {
    console.log("Opening edit modal for:", item); // Debug log

    // Reset any previous edit state first
    setEditImages([]);
    setEditImagePreview([]);

    // Set the edit state with the selected item's data
    setEditListing({ ...item }); // Create a copy to avoid reference issues
    setEditName(item.name);
    setEditPrice(item.price.toString());
    setEditModal(true);
  };

  // Close modals with proper cleanup
  const closeAddModal = () => {
    resetAddForm();
  };

  const closeEditModal = () => {
    resetEditForm();
  };

  useEffect(() => {
    if (!token) {
      router.push("/login");
    } else {
      fetchListings();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="mb-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
      >
        Add Listing
      </button>

      {/* Add Listing Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Listing</h2>
              <button
                onClick={closeAddModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddListing}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter product name"
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  placeholder="Enter price"
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              {/* File Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Product Images *
                </label>
                <input
                  type="file"
                  multiple
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={handleImageChange}
                  accept="image/*"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can select multiple images (Max 5)
                </p>
              </div>

              {/* Image Preview Container */}
              {imagePreview.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Selected Images ({imagePreview.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg max-h-60 overflow-y-auto">
                    {imagePreview.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview.url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md border"
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

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Edit Listing: {editListing.name}
              </h2>
              <button
                onClick={closeEditModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter product name"
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  placeholder="Enter price"
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Current Images Display */}
              {editListing.images && editListing.images.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Current Images
                  </h3>
                  <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-lg">
                    {editListing.images.map((img, index) => (
                      <img
                        key={index}
                        src={`http://localhost:5000/uploads/${img}`}
                        alt="Current"
                        className="w-full h-20 object-cover rounded border"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Upload new images to replace these
                  </p>
                </div>
              )}

              {/* File Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload New Images (Optional)
                </label>
                <input
                  type="file"
                  multiple
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  onChange={handleEditImageChange}
                  accept="image/*"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to keep current images
                </p>
              </div>

              {/* New Image Preview Container */}
              {editImagePreview.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    New Images ({editImagePreview.length}) - Will replace
                    current images
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-green-50 rounded-lg max-h-60 overflow-y-auto">
                    {editImagePreview.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview.url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md border"
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

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                  disabled={!editName.trim() || !editPrice.trim()}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* My Listings */}
      <h2 className="text-2xl font-semibold mb-4">My Listings</h2>
      {listings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No listings found. Create your first listing!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((item) => (
            <div
              key={item.id}
              className="bg-white shadow-md p-4 rounded-lg hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-bold mb-2 truncate">{item.name}</h3>
              <p className="text-gray-700 mb-3 text-xl font-semibold">
                ₹{item.price}
              </p>

              {item.images && item.images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto mb-3 pb-2">
                  {item.images.map((img, index) => (
                    <img
                      key={index}
                      src={`http://localhost:5000/uploads/${img}`}
                      alt="Listing"
                      className="w-20 h-20 object-cover rounded flex-shrink-0 border"
                    />
                  ))}
                </div>
              )}

              <button
                onClick={() => openEditModal(item)}
                className="w-full text-sm bg-yellow-100 text-yellow-800 px-3 py-2 rounded hover:bg-yellow-200 transition-colors font-medium"
              >
                Edit Listing
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
