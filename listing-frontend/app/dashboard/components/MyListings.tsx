"use client";
import { useEffect, useState, useCallback } from "react";
import ImageCarousel from "./ImageCarousel";

// Types
type Listing = {
  id: number | string;
  name: string;
  price: number | string;
  images: string[];
};

type ImagePreview = { file: File; url: string; name: string };

interface MyListingsProps {
  token: string | null;
  onTokenExpired: () => void;
}

export default function MyListings({ token, onTokenExpired }: MyListingsProps) {
  const [listings, setListings] = useState<Listing[]>([]);

  // Pagination state for infinite scroll
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const ITEMS_PER_PAGE = 10;

  // Add form state
  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<ImagePreview[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);

  // Edit form state
  const [editModal, setEditModal] = useState<boolean>(false);
  const [editListing, setEditListing] = useState<Listing | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editPrice, setEditPrice] = useState<string>("");
  const [editImages, setEditImages] = useState<File[]>([]);
  const [editImagePreview, setEditImagePreview] = useState<ImagePreview[]>([]);

  // Fetch user listings with pagination
  const fetchListings = useCallback(
    async (page = 1, append = false) => {
      if (loading) return;

      setLoading(true);
      try {
        // Replace with your actual API call
        const response = await fetch(
          `http://localhost:5000/api/listings?page=${page}&limit=${ITEMS_PER_PAGE}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            onTokenExpired();
            return;
          }
          throw new Error("Failed to fetch listings");
        }

        const data = await response.json();
        const newListings = data.listings || data;
        const totalCount = data.total || newListings.length;

        if (append) {
          setListings((prev) => [...prev, ...newListings]);
        } else {
          setListings(newListings);
        }

        // Check if there are more items to load
        setHasMore(page * ITEMS_PER_PAGE < totalCount);
      } catch (err) {
        console.error("Failed to fetch listings", err);
        if (!append) {
          onTokenExpired();
        }
      } finally {
        setLoading(false);
      }
    },
    [token, loading, ITEMS_PER_PAGE, onTokenExpired]
  );

  // Load more listings (infinite scroll)
  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchListings(nextPage, true);
    }
  }, [currentPage, hasMore, loading, fetchListings]);

  // Scroll event handler for infinite scroll
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
      ) {
        loadMore();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMore, hasMore, loading]);

  // Image handling functions
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
        if (loadedCount === files.length) {
          setImagePreview([...previews]);
        }
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
        if (loadedCount === files.length) {
          setEditImagePreview([...previews]);
        }
      };
      reader.readAsDataURL(file);
    });
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

  // Handle new listing submit
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
    images.forEach((image) => {
      formData.append("images", image);
    });

    try {
      const response = await fetch("http://localhost:5000/api/listing", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add listing");
      }

      resetAddForm();
      // Reset pagination and reload from first page
      setCurrentPage(1);
      setListings([]);
      fetchListings(1, false);
      alert("Listing added successfully!");
    } catch (err: any) {
      console.error("Error adding listing:", err);
      alert(err.message || "Failed to add listing. Please try again.");
    }
  };

  // Handle edit listing submit
  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editName.trim() || !editPrice.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    const formData = new FormData();
    formData.append("name", editName.trim());
    formData.append("price", editPrice);
    if (editImages.length > 0) {
      editImages.forEach((image) => {
        formData.append("images", image);
      });
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/listings/${editListing?.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update listing");
      }

      resetEditForm();
      // Reset pagination and reload from first page
      setCurrentPage(1);
      setListings([]);
      fetchListings(1, false);
      alert("Listing updated successfully!");
    } catch (err: any) {
      console.error("Error updating listing:", err);
      alert(err.message || "Failed to update listing.");
    }
  };

  // Form reset functions
  const resetAddForm = () => {
    setShowModal(false);
    setName("");
    setPrice("");
    setImages([]);
    setImagePreview([]);
  };

  const resetEditForm = () => {
    setEditModal(false);
    setEditListing(null);
    setEditName("");
    setEditPrice("");
    setEditImages([]);
    setEditImagePreview([]);
  };

  // Open edit modal with selected item's data
  const openEditModal = (item: Listing) => {
    setEditImages([]);
    setEditImagePreview([]);
    setEditListing({ ...item });
    setEditName(item.name);
    setEditPrice(item.price.toString());
    setEditModal(true);
  };

  // Initial load
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
          <p className="text-gray-600 mt-1">Manage your product listings</p>
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
                <p className="text-gray-700 mb-3 text-xl font-semibold text-green-600">
                  ₹{item.price}
                </p>

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
              <p>🎉 You've reached the end of your listings.</p>
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
                  placeholder="Enter product name"
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
                  Select Product Images *
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
                  placeholder="Enter product name"
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
