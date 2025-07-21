"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Listing {
  id: number;
  name: string;
  price: string;
  images: string[];
  group_id?: string;
}

interface NewListing {
  name: string;
  price: string;
  images: File[];
}

interface EditListing {
  id: number;
  name: string;
  price: string;
  images: string[];
  newImages: File[];
}

export default function DashboardPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);

  const [multipleListings, setMultipleListings] = useState<NewListing[]>([
    { name: "", price: "", images: [] },
  ]);

  const [isMultiple, setIsMultiple] = useState(false);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editListings, setEditListings] = useState<EditListing[]>([]);

  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    images.forEach((img) => formData.append("images", img));

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/listing",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      fetchListings();
      setName("");
      setPrice("");
      setImages([]);
    } catch (err) {
      console.error(err);
    }
  };

  // FIXED: Updated handleMultipleSubmit function
  const handleMultipleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("multipleListings:", multipleListings);

    const validListings = multipleListings.filter((listing) => {
      const images = Array.isArray(listing.images) ? listing.images : [];
      return listing.name.trim() && listing.price.trim() && images.length > 0;
    });

    if (validListings.length === 0) {
      alert(
        "Please fill in all fields and add images for at least one listing."
      );
      return;
    }

    const formData = new FormData();
    const listingsData = validListings.map((listing) => ({
      name: listing.name,
      price: listing.price,
      imageCount: listing.images.length,
    }));

    formData.append("listings", JSON.stringify(listingsData));

    validListings.forEach((listing) => {
      listing.images.forEach((image) => {
        formData.append("images", image);
      });
    });

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/listing/group",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Multiple listings created:", response.data);

      // Clear the form first
      setMultipleListings([{ name: "", price: "", images: [] }]);

      // Add a small delay before fetching to ensure backend processing is complete
      setTimeout(async () => {
        await fetchListings();
      }, 500);

      const createdCount =
        response.data?.listings?.length ||
        response.data?.count ||
        validListings.length;

      alert(`${createdCount} listings created successfully!`);
    } catch (err) {
      console.error("Error creating multiple listings:", err);
      alert("Failed to create listings. Please check the console for details.");
    }
  };

  const handleListingChange = (index: number, field: string, value: string) => {
    const updated = [...multipleListings];
    updated[index] = {
      ...updated[index],
      [field]: value,
      images: updated[index].images ?? [], // Preserve images
    };
    setMultipleListings(updated);
  };

  const handleImageChange = (index: number, files: FileList | null) => {
    if (files) {
      const updated = [...multipleListings];
      updated[index].images = Array.from(files);
      setMultipleListings(updated);
    }
  };

  const addListingField = () => {
    setMultipleListings([
      ...multipleListings,
      { name: "", price: "", images: [] },
    ]);
  };

  // ADDED: Function to remove a listing field
  const removeListingField = (index: number) => {
    if (multipleListings.length > 1) {
      const updated = multipleListings.filter((_, i) => i !== index);
      setMultipleListings(updated);
    }
  };

  // Edit functionality
  const startEditGroup = (groupId: string, groupListings: Listing[]) => {
    setEditingGroup(groupId);
    setEditListings(
      groupListings.map((listing) => ({
        ...listing,
        newImages: [],
      }))
    );
  };

  const cancelEdit = () => {
    setEditingGroup(null);
    setEditListings([]);
  };

  const handleEditListingChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const updated = [...editListings];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setEditListings(updated);
  };

  const handleEditImageChange = (index: number, files: FileList | null) => {
    if (files) {
      const updated = [...editListings];
      updated[index].newImages = Array.from(files);
      setEditListings(updated);
    }
  };

  const removeExistingImage = (listingIndex: number, imageIndex: number) => {
    const updated = [...editListings];
    updated[listingIndex].images = updated[listingIndex].images.filter(
      (_, idx) => idx !== imageIndex
    );
    setEditListings(updated);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      // Update each listing individually using your existing endpoint
      for (const listing of editListings) {
        const formData = new FormData();
        formData.append("name", listing.name);
        formData.append("price", listing.price);

        // Add existing images that weren't removed
        listing.images.forEach((img) => {
          formData.append("existingImages", img);
        });

        // Add new images
        listing.newImages.forEach((img) => {
          formData.append("images", img);
        });

        // Use your actual endpoint: PUT /api/listings/:id
        await axios.put(
          `http://localhost:5000/api/listings/${listing.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      fetchListings();
      setEditingGroup(null);
      setEditListings([]);
      alert("Listings updated successfully!");
    } catch (err) {
      console.error("Edit error:", err);
      alert("Failed to update listings. Please check the console for details.");
    }
  };

  const fetchListings = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log(
        "Fetching listings with token:",
        token ? "Present" : "Missing"
      );

      const res = await axios.get("http://localhost:5000/api/listings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Fetched listings:", res.data);
      console.log("Number of listings:", res.data.length);

      setListings(res.data);
    } catch (err) {
      console.error("Error fetching listings:", err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        // Token might be expired
        localStorage.removeItem("token");
        router.push("/login");
      }
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const groupedListings: Record<string, Listing[]> = listings.reduce(
    (groups, listing) => {
      console.log("Processing listing:", listing); // Debug log
      const groupId = listing.group_id || `single-${listing.id}`;
      if (!groups[groupId]) groups[groupId] = [];
      groups[groupId].push(listing);
      return groups;
    },
    {} as Record<string, Listing[]>
  );

  console.log("Grouped listings:", groupedListings); // Debug log

  const handleRefresh = async () => {
    console.log("Manual refresh triggered");
    await fetchListings();
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Logout
        </button>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setIsMultiple(false)}
          className={`px-4 py-2 rounded ${
            !isMultiple ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Single Listing
        </button>
        <button
          onClick={() => setIsMultiple(true)}
          className={`px-4 py-2 rounded ${
            isMultiple ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Multiple Listing
        </button>
      </div>

      {!isMultiple ? (
        <form onSubmit={handleSingleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 w-full"
          />
          <input
            type="text"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="border p-2 w-full"
          />
          <input
            type="file"
            multiple
            onChange={(e) => setImages(Array.from(e.target.files || []))}
            className="w-full"
          />
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Add Listing
          </button>
        </form>
      ) : (
        <form onSubmit={handleMultipleSubmit} className="space-y-4">
          {multipleListings.map((listing, index) => (
            <div key={index} className="border p-4 rounded">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Listing {index + 1}</h3>
                {multipleListings.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeListingField(index)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder="Name"
                value={listing.name}
                onChange={(e) =>
                  handleListingChange(index, "name", e.target.value)
                }
                className="border p-2 w-full mb-2"
                required
              />
              <input
                type="text"
                placeholder="Price"
                value={listing.price}
                onChange={(e) =>
                  handleListingChange(index, "price", e.target.value)
                }
                className="border p-2 w-full mb-2"
                required
              />
              <input
                type="file"
                multiple
                onChange={(e) => handleImageChange(index, e.target.files)}
                className="w-full"
                accept="image/*"
                required
              />
              {listing.images.length > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {listing.images.length} image(s) selected
                </p>
              )}
            </div>
          ))}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={addListingField}
              className="bg-yellow-500 text-white px-4 py-2 rounded"
            >
              + Add More
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Submit Group
            </button>
          </div>
        </form>
      )}

      <div className="gap-2 w-full flex flex-row justify-center items-center">
        {Object.keys(groupedListings).length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No listings found.</p>
            <button
              onClick={handleRefresh}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Refresh Listings
            </button>
          </div>
        ) : (
          <div className="gap-2 w-full flex flex-row justify-center items-center">
            {Object.entries(groupedListings).map(([groupId, listings]) => (
              <div key={groupId} className="bg-white p-4 w-full rounded shadow">
                <div className="mb-2 text-sm text-gray-500">
                  Group ID: {groupId} | Items: {listings.length}
                </div>
                {/* Rest of your existing JSX for displaying listings */}
                {editingGroup === groupId ? (
                  // Your existing edit mode JSX
                  <div>Edit Mode Content...</div>
                ) : (
                  // Your existing view mode JSX
                  <>
                    {listings.map((item) => (
                      <div key={item.id} className="mb-4">
                        <h2 className="text-lg font-bold">{item.name}</h2>
                        <p className="text-gray-700">₹{item.price}</p>
                        <div className="flex space-x-2 overflow-x-auto">
                          {item.images.map((img: string, idx: number) => (
                            <img
                              key={idx}
                              src={`http://localhost:5000/uploads/${img}`}
                              alt={item.name}
                              className="w-32 h-32 object-cover rounded"
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => startEditGroup(groupId, listings)}
                      className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                      Edit Group
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
